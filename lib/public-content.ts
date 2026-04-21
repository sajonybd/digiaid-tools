export type PublicContentSection = {
  heading: string;
  body?: string[];
  bullets?: string[];
};

export type PublicContentPage = {
  title: string;
  description: string;
  eyebrow?: string;
  sections: PublicContentSection[];
};

export function getPublicContent(siteName: string): Record<string, PublicContentPage> {
  return {
    "about-us": {
      title: "About Us",
      description: `${siteName} helps customers buy trusted premium digital tools with responsive onboarding and support.`,
      eyebrow: "Who we are",
      sections: [
        {
          heading: "Digital Tools by DigiAid",
          body: [
            `${siteName} is built for customers who want premium digital tools without the confusion that usually comes with group-buy style access.`,
            "We focus on clarity before purchase, guided onboarding after payment, and fast support whenever a customer gets stuck.",
          ],
        },
        {
          heading: "What customers can expect",
          bullets: [
            "Trusted premium digital tools by DigiAid",
            "Clear package details, pricing, and product access information",
            "WhatsApp, Messenger, email, and phone support options",
            "Practical buying guidance for new customers",
          ],
        },
      ],
    },
    "affiliate-program": {
      title: "Become an Affiliate",
      description: `Partner with ${siteName} and help more customers discover trusted premium digital tools.`,
      eyebrow: "Affiliate",
      sections: [
        {
          heading: "Who should apply",
          bullets: [
            "Content creators in SEO, freelancing, marketing, design, and business niches",
            "Agencies and trainers who recommend digital tools regularly",
            "Community owners who want a trusted tool partner for their audience",
          ],
        },
        {
          heading: "How to get started",
          body: [
            "Contact the DigiAid team with your audience details, traffic sources, and the product categories you want to promote.",
            "We will review your fit, share the next steps, and confirm the campaign workflow manually.",
          ],
        },
      ],
    },
    "refund-policy": {
      title: "Refund Policy",
      description: "Review the situations where refunds may or may not be approved before you place an order.",
      eyebrow: "Policies",
      sections: [
        {
          heading: "Refund eligibility",
          bullets: [
            "Refund requests must be made quickly after purchase and before extensive use or delivery completion",
            "Requests are reviewed case by case based on the product type and the issue reported",
            "Orders delivered exactly as described may not qualify for a refund",
          ],
        },
        {
          heading: "Non-refundable situations",
          bullets: [
            "A customer changes their mind after successful delivery or setup",
            "The customer does not read the product details, terms, or access requirements before purchase",
            "Service interruption is caused by third-party platform changes outside DigiAid control",
          ],
        },
      ],
    },
    "return-policy": {
      title: "Return Policy",
      description: "Digital products do not work like physical goods, so returns are handled differently.",
      eyebrow: "Policies",
      sections: [
        {
          heading: "How returns work for digital goods",
          body: [
            "Because these are digital products and access-based services, items usually cannot be returned after delivery in the same way physical products can.",
            "If access cannot be provided as promised, our team will first attempt a replacement, correction, or support-based resolution.",
          ],
        },
        {
          heading: "Resolution path",
          bullets: [
            "Access fix or troubleshooting",
            "Replacement access where possible",
            "Refund review if the issue cannot be resolved fairly",
          ],
        },
      ],
    },
    "privacy-policy": {
      title: "Privacy Policy",
      description: "Understand what customer data is used to operate the store, deliver access, and provide support.",
      eyebrow: "Policies",
      sections: [
        {
          heading: "Information we use",
          bullets: [
            "Basic account details such as name, email address, and order history",
            "Support contact information used for onboarding and service communication",
            "Technical or usage details needed to protect the platform and resolve customer issues",
          ],
        },
        {
          heading: "How we use it",
          bullets: [
            "To process purchases and grant product access",
            "To provide customer support and order updates",
            "To improve service quality, safety, and communication",
          ],
        },
      ],
    },
    "terms-and-conditions": {
      title: "Must Read Before Purchase",
      description: "These terms and conditions explain the basic rules customers agree to before buying.",
      eyebrow: "Terms",
      sections: [
        {
          heading: "Important purchase terms",
          bullets: [
            "Read the product title, description, delivery notes, and support terms before placing an order",
            "Access timelines can vary depending on the product and any manual setup required",
            "Misuse, abuse, credential sharing, or violating platform rules may result in access removal",
            "Third-party tool availability can change without notice due to provider policies",
          ],
        },
        {
          heading: "Customer responsibility",
          bullets: [
            "Use accurate contact information at checkout",
            "Follow onboarding instructions after purchase",
            "Contact support quickly if there is an issue with access or delivery",
          ],
        },
      ],
    },
    "how-to-buy": {
      title: "How to Buy",
      description: "A quick walkthrough for placing an order on the site.",
      eyebrow: "Buying guide",
      sections: [
        {
          heading: "Step by step",
          bullets: [
            "Browse the product catalog or packages and open the product details page",
            "Review pricing, included tools, terms, and support notes before buying",
            "Add the item to your cart or choose Buy Now",
            "Complete checkout with your contact details and payment information",
            "Wait for confirmation and onboarding instructions from DigiAid support",
          ],
        },
      ],
    },
    "how-to-access": {
      title: "How to Access Your Product",
      description: "What happens after payment and how customers receive their purchased access.",
      eyebrow: "Access guide",
      sections: [
        {
          heading: "After checkout",
          bullets: [
            "Check your account dashboard for purchased products and billing history",
            "Watch for email, WhatsApp, or Messenger updates if manual onboarding is required",
            "Use the provided instructions, linked page, or extension flow to access the purchased tool",
          ],
        },
        {
          heading: "If access is delayed",
          bullets: [
            "Confirm your order details were submitted correctly",
            "Review the product-specific access notes",
            "Reach out to DigiAid support with your order details for help",
          ],
        },
      ],
    },
    "get-support": {
      title: "How to Get Support",
      description: "Support is available across WhatsApp, Messenger, phone, and email.",
      eyebrow: "Support",
      sections: [
        {
          heading: "Fastest ways to reach us",
          bullets: [
            "WhatsApp chat for quick purchase and access help",
            "Messenger chat for Facebook-based support",
            "Phone support for urgent order issues",
            "Email for detailed follow-up and documentation",
          ],
        },
        {
          heading: "Before you contact support",
          bullets: [
            "Keep your order information ready",
            "Mention the product or package name clearly",
            "Explain whether the issue is payment, access, setup, or renewal related",
          ],
        },
      ],
    },
  };
}
