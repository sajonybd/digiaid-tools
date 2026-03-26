
import { headers } from 'next/headers';
import dbConnect from "@/lib/mongodb";
import Tool from "@/models/Tool";
import mongoose from "mongoose";

export const dynamic = 'force-dynamic';

export default async function DebugPage() {
    await dbConnect();
    
    // Raw Mongo Query
    const rawTools = await mongoose.connection.db!.collection('tools').find({}).toArray();
    
    // Mongoose Query
    const mongooseTools = await Tool.find({});

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Debug Tools</h1>
            
            <div className="grid grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-bold mb-2">Raw MongoDB (Bypassing Schema)</h2>
                    <pre className="text-xs bg-slate-900 text-green-400 p-4 rounded overflow-auto h-[500px]">
                        {JSON.stringify(rawTools.map(t => ({ name: t.name, price: t.price, id: t._id })), null, 2)}
                    </pre>
                </div>
                
                <div>
                    <h2 className="text-xl font-bold mb-2">Mongoose (Using Schema)</h2>
                    <pre className="text-xs bg-slate-900 text-blue-400 p-4 rounded overflow-auto h-[500px]">
                        {JSON.stringify(mongooseTools.map(t => ({ name: t.name, price: t.price, id: t._id })), null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}
