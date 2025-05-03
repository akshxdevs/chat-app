import { Router } from "express";
import { prismaClient } from "../db/db";

const router = Router();

router.post("/add/:id",async(req,res)=>{
    const userId = req.params.id;
    const {receiverId,text} = req.body
    const createChat = await prismaClient.chats.create({
        data:{
            senderId:userId,
            receiverId:receiverId,
            chat:text
        }
    });
    res.json({
        createChat,
        message:"Success!!"})
});

router.get("/get/:userId/:contactId", async (req, res) => {
  const { userId, contactId } = req.params;

  try {
    const getChat = await prismaClient.chats.findMany({
      where: {
        OR: [
          {
            senderId: userId,
            receiverId: contactId,
          },
          {
            senderId: contactId,
            receiverId: userId,
          },
        ],
      },
      orderBy: {
        timeStamp: "asc",
      },
    });

    res.json({ getChat, message: "Success!!" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching chats", error });
  }
});




export const chatRouter = router;