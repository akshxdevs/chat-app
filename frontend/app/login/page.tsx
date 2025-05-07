"use client";
import axios from "axios";
import { useState } from "react"
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "@/config";

export default function () {
    const [phoneNo,setPhoneNo] = useState();
    const [otp,setOtp] = useState();
    const [otpModel,setOtpModel] = useState(false);
    const router = useRouter();

    return <div className="flex justify-center items-center h-screen" >
        <div className="bg-[#00223317] rounded-lg shodow-lg py-10 px-20">
            {otpModel ? (
                <div>
                    <h1 className="text-4xl font-bold">OTP Verification</h1>
                    <h2 className="text-2xl font-semi-bold py-5 w-56">OTP has sent to +91 {phoneNo}</h2>
                    <div className=" flex gap-2 w-96 p-3 border border-slate-400 rounded-3xl shadow-lg">
                        <input type="text" placeholder="Enter OTP number" className="outline-none" value={otp} onChange={(e:any)=>setOtp(e.target.value)}/>
                    </div>
                    <div className="p-4 bg-orange-600 my-5 text-center rounded-3xl ">
                        <button onClick={async()=>{
                            try {
                            const res = await axios.post(`${BACKEND_URL}/user/verify-otp`,{
                                mobileNo:phoneNo,
                                otp:otp
                            })
                            if (res.data) {
                                const userId = res.data.user.id
                                console.log("OTP Verification Successfully");
                                toast.success("✅ User Login Sucessfull!");
                                localStorage.setItem("userId",res.data.user.id);
                                localStorage.setItem("token",res.data.token);
                                localStorage.setItem("mobileNo",res.data.user.phoneNo);
                                localStorage.setItem("profileImg",res.data.user.profileImg || "");
                                localStorage.setItem("name",res.data.user.name);
                                router.push(`/message/${userId}`);
                            }
                        } catch (error) {
                            console.error(error);
                            toast.error("SOmething went wrong!!")
                        }
                        }}>Continue</button>
                    </div>
                </div>
            ):(
                <div>
                    <h1 className="text-4xl font-bold py-5">Login</h1>
                    <div className=" flex gap-3 w-96 p-3 border border-slate-400 rounded-3xl shadow-lg">
                        <p>+91</p>
                        <input type="text" placeholder="Enter Phone Number" className="outline-none" value={phoneNo} onChange={(e:any)=>setPhoneNo(e.target.value)}/>
                    </div>
                    <div className="p-4 bg-orange-600 my-5 text-center rounded-3xl ">
                        <button onClick={async()=>{
                        try {
                            const res = await axios.post(`${BACKEND_URL}/user/login/phone`,{
                                mobileNo:phoneNo
                            })
                            if (res.data) {
                                console.log("OTP generated");
                                toast.success("✅ OTP sent successfully to your mobile number!")
                                setOtpModel(true)
                            }
                        } catch (error) {
                            console.error(error);
                            toast.error("Something went wrong!!")
                        }
                        }}>Continue</button>
                    </div>
            </div>
            )}
            
        </div>
        
    </div>
}