import { Router } from "express";
import { prismaClient } from "../db/db";
import { redisClient } from "../redis/init";

const router = Router();

router.post("/add/:id",async(req,res)=>{
    const userId = req.params.id;
    const {contactName,contactId} = req.body
    const createMessagefeed = await prismaClient.messageFeed.create({
        data:{
            contactName:contactName,
            contactId:contactId,
            userId:userId,
        }
    });
    res.json({
        createMessagefeed,
        message:"Success!!"})
});

router.get("/get/:id",async(req,res)=>{
    const userId = req.params.id;
    const getMessagefeed = await prismaClient.messageFeed.findMany({
        where:{
            userId:userId,
        }
    });
    res.json({
        getMessagefeed,
        message:"Success!!"});
});

router.get("/getcontact/:id/:contactId",async(req,res)=>{
    const userId = req.params.id;
    const contactId = req.params.contactId;

    const contactExist = await prismaClient.messageFeed.findFirst({
        where:{
            userId:userId,
            contactId:contactId,
        }
    });
    res.json({
        contactExist,
        message:"Success!!"});
});

router.get("/pendingmsg/:id",async(req,res)=>{
    const id = req.params.id;
    try {
        const msg = await redisClient.lrange(`message:${id}`,0,-1)
        const parsedMsg = msg.map(msg => JSON.parse(msg));
        res.json({
            sucess:true,
            message:parsedMsg
        })
    } catch (error) {
        console.error("redis error",error);
    }

})

export const messageRouter = router;