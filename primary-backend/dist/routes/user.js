"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRouter = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db/db");
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = require("../config");
const router = (0, express_1.Router)();
const redis = new ioredis_1.default({
    host: "localhost",
    port: 6379
});
const OTP_LIMIT = 5;
const OTP_EXPIRY = 100;
// router.post("/signup",async(req,res)=>{
//     try {
//         const parsedBody = signupSchema.safeParse(req.body);
//         if (!parsedBody.success) {
//             console.log(parsedBody.error?.errors);
//             return res.status(403).json({message:"Invalid inputs!"})
//         }
//         const {name,username,password}  = parsedBody.data;
//         const existingUser = await prismaClient.user.findFirst({
//             where:{
//                 username:username
//             }
//         })
//         if (existingUser) {
//             return res.status(402).json({
//                 message:"User Exist!"
//             })
//         }
//         const hashedPassword = await bcrypt.hash(password,10)
//         const user = await prismaClient.user.create({
//             data:{
//                 username:username,
//                 password:hashedPassword,
//                 name:name
//             }
//         })
//         res.json({
//             message:"User Created Successfully!",
//             user:user
//         })
//     } catch (error) {
//         console.error(error);
//         res.status(411).json({message:"Something went wrong!!"})   
//     }
// })
// router.post("/signin",async(req,res)=>{
//     try {
//         const parsedBody = signinSchema.safeParse(req.body);
//         if (!parsedBody.success) {
//             return res.status(403).json({message:"Invalid inputs!"})
//         }
//         const {username,password}  = parsedBody.data;
//         const user = await prismaClient.user.findFirst({
//             where:{
//                 username,
//             }
//         })
//         if (!user) {
//             return res.status(402).json({
//                 message:"User Not Exist / Signup!"
//             })
//         }
//         const comparePassword = await bcrypt.compare(password,user.password)
//         if (!comparePassword) {
//             return res.status(403).json({message:"Password Mismatch!"})
//         }
//         const token = jwt.sign({
//             id:user.id
//         },JWT_SECERT as string)
//         res.json({
//             message:"User Login Successfully!",
//             token:token,
//             user:user
//         })
//     } catch (error) {
//         console.error(error);
//         res.status(411).json({message:"Something went wrong!!"})   
//     }
// })
router.post("/login/phone", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { mobileNo } = req.body;
        if (!mobileNo) {
            return res.status(403).send({ message: "Invalid inputs!" });
        }
        const user = yield db_1.prismaClient.user.findFirst({
            where: {
                mobileNo: mobileNo,
            }
        });
        if (!user) {
            yield db_1.prismaClient.user.create({
                data: {
                    mobileNo: mobileNo,
                }
            });
        }
        const generateOtp = String(Math.floor(100000 + Math.random() * 900000));
        const otpKey = `otp:${String(mobileNo)}`;
        const otpRequestCounts = yield redis.get(`otp_count:${mobileNo}`);
        if (otpRequestCounts && Number(otpRequestCounts) >= OTP_LIMIT) {
            res.status(429).json({ message: "Too many otp requests!" });
        }
        yield redis.setex(otpKey, OTP_EXPIRY, generateOtp);
        yield redis.incr(`otp_count:${mobileNo}`);
        yield redis.expire(`otp_count:${mobileNo}`, OTP_EXPIRY);
        res.json({
            message: "Otp Generated Successfully!",
            mobileNo: mobileNo,
            otp: generateOtp
        });
    }
    catch (error) {
        console.error(error);
        res.status(411).json({ message: "Something went wrong!!" });
    }
}));
router.post("/verify-otp", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { mobileNo, otp } = req.body;
        if (!mobileNo || !otp) {
            return res.status(403).json({ message: "Invalid inputs!" });
        }
        const storedOtp = yield redis.get(`otp:${mobileNo}`);
        if (!storedOtp || storedOtp !== otp) {
            return res.status(401).json({ message: "Invalid or expired OTP!" });
        }
        const user = yield db_1.prismaClient.user.findFirst({ where: { mobileNo } });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        const token = jsonwebtoken_1.default.sign({
            id: user.id
        }, config_1.JWT_SECERT, { expiresIn: '7d' });
        yield redis.del(`otp:${mobileNo}`);
        yield redis.del(`otp_count:${mobileNo}`);
        res.json({
            message: "User Login Successfully!",
            token: token,
            user: user
        });
    }
    catch (error) {
        console.error(error);
        res.status(411).json({ message: "Something went wrong!!" });
    }
}));
// router.post("/update/:id",UserAuthenticate,async(req,res)=>{
//     try {
//         const userId = req.params.id
//         const checkuser = await prismaClient.user.findFirst({
//             where:{
//                 id:userId
//             }
//         })
//         if (!checkuser) return res.status(403).json({message:"User Not Found!"})
//         const parsedBody = updateUserSchema.safeParse(req.body);
//         if (!parsedBody.success) {
//             console.log(parsedBody.error?.errors);
//             return res.status(403).json({message:"Invalid inputs!"})
//         }
//         const {name,username,password,address,mobileNo}  = parsedBody.data;
//         const updateData:any = {}
//         if (name) updateData.name = name;
//         if (username) updateData.username = username;
//         if (password){
//         const hashedPassword = await bcrypt.hash(password,10);
//         if (password) updateData.password = hashedPassword;
//         } updateData.username = username;
//         if (address) updateData.address = address;
//         if (mobileNo) updateData.mobileNo = mobileNo;
//         console.log(updateData);
//         const updateUser = await prismaClient.user.update({
//             where:{
//                 id:userId
//             },
//             data:updateData
//         })
//         res.json({
//             message:"User Updated Successfully!",
//             updateDetails:updateUser
//         })
//     } catch (error) {
//         console.error(error);
//         res.status(411).json({message:"Something went wrong!!"})   
//     }
// })
router.post("/search/:name", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const searchName = req.params.name;
    const user = yield db_1.prismaClient.user.findMany({
        where: {
            name: searchName
        }
    });
    if (!user) {
        res.status(404).json({ message: "User Not Found!!" });
    }
    res.json({
        user,
        message: "User fetched successfully!!"
    });
}));
exports.UserRouter = router;
