import { Router } from "express";
import { prismaClient } from "../db/db";

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

export const messageRouter = router;