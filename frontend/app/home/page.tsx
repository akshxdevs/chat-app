"use client";
import { useRouter } from "next/navigation"

export default function(){
    const router = useRouter();
    return <div className="flex flex-col justify-center items-center h-screen">
        <div className="bg-[#03456] border border-green-600 p-32">
            <div className="flex flex-col justify-center items-center">
                <h1 className="font-bold text-3xl py-5">Home</h1>
                <button className="p-2 bg-orange-600 rounded-lg text-black font-light" onClick={()=>{
                    router.push("/login");
                }}>Start Messaging</button>                
            </div>
        </div>
    </div>
}