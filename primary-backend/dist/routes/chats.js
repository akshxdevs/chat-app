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
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db/db");
const router = (0, express_1.Router)();
router.post("/add/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    const { receiverId, text } = req.body;
    const createChat = yield db_1.prismaClient.chats.create({
        data: {
            senderId: userId,
            receiverId: receiverId,
            chat: text
        }
    });
    res.json({
        createChat,
        message: "Success!!"
    });
}));
router.get("/get/:userId/:contactId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, contactId } = req.params;
    try {
        const getChat = yield db_1.prismaClient.chats.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching chats", error });
    }
}));
exports.chatRouter = router;
