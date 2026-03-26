import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Package from "@/models/Package";
import Tool from "@/models/Tool";
import Coupon from "@/models/Coupon";
import Subscription from "@/models/Subscription";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Setting from "@/models/Setting";
import { sendCapiEvent } from "@/lib/capi";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const user = session.user as any;

  try {
    const orders = await Order.find({ user: user.id })
      .populate('items.package')
      .populate('couponApplied')
      .sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  
  if (!session) {
      return NextResponse.json({ error: "Please login to place an order" }, { status: 401 });
  }
  
  const user = session.user as any;

  try {
    const { items, paymentMethod, paymentProof, couponCode } = await req.json();
    // items should be [{ packageId, ... }]

    // 1. Calculate Totals Server-Side for Security
    let totalAmount = 0;
    const finalItems = [];

    for (const item of items) {
        // Try Package first
        let targetItem = await Package.findById(item._id);
        let itemType = 'Package';
        
        if (!targetItem) {
            // Try Tool if Package not found
            targetItem = await Tool.findById(item._id);
            itemType = 'Tool';
        }

        if (!targetItem) continue;

        const durationMonths = item.durationMonths || 1;
        const pricePerMonth = targetItem.price;
        const subtotal = pricePerMonth * durationMonths;
        
        totalAmount += subtotal;
        finalItems.push({
            package: targetItem._id, 
            itemType: itemType,
            durationMonths: durationMonths,
            name: item.name || targetItem.name,
            price: pricePerMonth // Store per-month price for record
        });
    }

    // 2. Apply Coupon
    let discountAmount = 0;
    let couponId = null;

    if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode });
        // TODO: Re-verify coupon validity here (call validate logic or duplicate it)
        // For now, assuming validated or trusting basic check + simple re-calc
        if (coupon && coupon.status === 'active') {
            couponId = coupon._id;
            if (coupon.discountType === 'flat') {
                discountAmount = coupon.discountAmount;
            } else {
                discountAmount = (totalAmount * coupon.discountAmount) / 100;
            }
            // Update used count
            await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
        }
    }

    if (discountAmount > totalAmount) discountAmount = totalAmount; // Prevent negative
    const finalAmount = totalAmount - discountAmount;

    // 3. Determine Status
    // If Free (Total 0), auto-approve.
    // If Offline, status 'pending'.
    let status = 'pending';
    if (finalAmount === 0 || paymentMethod === 'free') {
        status = 'approved';
    }

    // 4. Create Order
    const order = await Order.create({
        user: user.id,
        items: finalItems,
        totalAmount,
        discountAmount,
        finalAmount,
        paymentMethod: finalAmount === 0 ? 'free' : paymentMethod,
        paymentProof,
        status,
        couponApplied: couponId
    });

    // 5. If Approved (Free), Activate Subscription Immediately
    if (status === 'approved') {
        for (const item of finalItems) {
             const targetItem = item.itemType === 'Tool' 
                ? await Tool.findById(item.package)
                : await Package.findById(item.package);

             if (!targetItem) continue;

             // Calculate duration
             let durationDays = 30; // Default base
             
             if (targetItem.interval === 'lifetime') {
                 durationDays = 36500; // 100 years
             } else if (targetItem.interval === 'yearly') {
                 durationDays = 365 * (item.durationMonths || 1); // Respect year multipliers if any
             } else if (targetItem.isTrial && (targetItem as any).trialDurationDays) {
                 durationDays = (targetItem as any).trialDurationDays;
             } else if (targetItem.isTrial || targetItem.price === 0) {
                 durationDays = 365; // User requested year instead of month for free tools
             } else {
                 // Monthly (default)
                 durationDays = 30 * (item.durationMonths || 1);
             }

            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + durationDays);

            // Check if user already has an active subscription for this package in dedicated collection
            const existingSub = await Subscription.findOne({
                user: user.id,
                packageId: targetItem._id,
                status: 'active'
            });

            if (existingSub) {
                // Extend existing subscription
                const currentEnd = new Date(existingSub.endDate);
                const extendFrom = currentEnd > startDate ? currentEnd : startDate;
                const newEnd = new Date(extendFrom);
                newEnd.setDate(newEnd.getDate() + durationDays);
                existingSub.endDate = newEnd;
                existingSub.orderId = order._id;
                await existingSub.save();
            } else {
                // Create new subscription in dedicated collection
                await Subscription.create({
                    user: user.id,
                    packageId: targetItem._id,
                    itemType: item.itemType,
                    startDate,
                    endDate,
                    status: 'active',
                    orderId: order._id
                });
            }
        }
    }

    // 6. Server-Side CAPI Tracking (Purchase)
    try {
        const setting = await Setting.findOne({});
        if (setting && setting.facebookPixelId && setting.facebookCapiToken) {
            await sendCapiEvent(
                "Purchase",
                setting.facebookPixelId,
                setting.facebookCapiToken,
                {
                    email: user.email,
                    userId: user.id || user._id,
                    clientIp: req.headers.get("x-forwarded-for") || undefined,
                    userAgent: req.headers.get("user-agent") || undefined
                },
                {
                    value: finalAmount,
                    currency: "USD",
                    content_ids: finalItems.map(i => i.package.toString()),
                    content_type: "product",
                    order_id: order._id.toString()
                }
            );
        }
    } catch (e) {
        console.error("CAPI Tracking Error:", e);
    }

    return NextResponse.json({ success: true, orderId: order._id, status }, { status: 201 });

  } catch (error) {
    console.error("Order creation failed:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
