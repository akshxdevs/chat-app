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
exports.messageRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db/db");
const router = (0, express_1.Router)();
router.post("/add/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    const { contactName, contactId } = req.body;
    const createMessagefeed = yield db_1.prismaClient.messageFeed.create({
        data: {
            contactName: contactName,
            constactId: contactId,
            userId: userId,
        }
    });
    res.json({
        createMessagefeed,
        message: "Success!!"
    });
}));
router.get("/get/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    const getMessagefeed = yield db_1.prismaClient.messageFeed.findMany({
        where: {
            userId: userId,
        }
    });
    res.json({
        getMessagefeed,
        message: "Success!!"
    });
}));
exports.messageRouter = router;
