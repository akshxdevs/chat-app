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
exports.setUpSocketServer = void 0;
const ws_1 = require("ws");
const init_1 = require("./redis/init");
const producer_1 = require("./kafka/producer");
const consumer_1 = require("./kafka/consumer");
const clients = new Map();
const groupClients = new Map();
const setUpSocketServer = (server) => {
    const wss = new ws_1.WebSocketServer({ noServer: true });
    server.on("upgrade", (req, socket, head) => {
        const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
        const userId = parsedUrl.pathname.slice(1);
        const groupName = parsedUrl.searchParams.get("group");
        if (!userId)
            return socket.destroy;
        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit('connection', ws, userId, groupName);
        });
    });
    wss.on('connection', (socket, userId, groupName) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        clients.set(userId, socket);
        if (!groupClients.has(groupName)) {
            groupClients.set(groupName, new Set());
        }
        (_a = groupClients.get(groupName)) === null || _a === void 0 ? void 0 : _a.add(socket);
        console.log(`UserId: ${userId} Connected!`);
        const pending = yield init_1.redisClient.lrange(`message:${userId}`, 0, -1);
        pending.forEach((message) => socket.send(message));
        init_1.redisClient.del(`message:${userId}`);
        socket.on('message', (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const parsed = JSON.parse(data.toString());
                const { to, text, group } = parsed;
                const message = Object.assign({ from: userId, text }, (group ? { group } : { to }));
                yield producer_1.producer.send({
                    topic: "chat-room",
                    messages: [{ value: JSON.stringify(message) }]
                });
            }
            catch (err) {
                console.error("Invalid message format:", err);
            }
        }));
        socket.on("close", () => {
            clients.delete(userId);
            if (groupName && groupClients.has(groupName)) {
                groupClients.get(groupName).delete(socket);
            }
            console.log(`User disconnected: ${userId}`);
        });
    }));
    function Broadcast(groupName, data) {
        const payload = JSON.stringify(data);
        const sockets = groupClients.get(groupName);
        if (!sockets)
            return;
        sockets.forEach((client) => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(payload);
            }
        });
    }
    (() => __awaiter(void 0, void 0, void 0, function* () {
        yield producer_1.producer.connect();
        yield consumer_1.consumer.connect();
        yield consumer_1.consumer.subscribe({ topic: "chat-room", fromBeginning: false });
        yield consumer_1.consumer.run({
            eachMessage: (_a) => __awaiter(void 0, [_a], void 0, function* ({ message }) {
                if (!message.value)
                    return;
                const parsed = JSON.parse(message.value.toString());
                const { from, to, text, group } = parsed;
                const payload = { from, text, to };
                if (group) {
                    Broadcast(group, payload);
                    console.log(`Message from ${from} broadcasted to group ${group}`);
                }
                else if (to) {
                    const reciver = clients.get(to);
                    if (reciver && reciver.readyState === ws_1.WebSocket.OPEN) {
                        reciver.send(JSON.stringify(payload));
                        console.log(`Message form ${from} Delivered to ${to}`);
                    }
                    else {
                        yield init_1.redisClient.rpush(`message:${to}`, JSON.stringify(payload));
                        console.log(`Message is Stored for user ${to}!!`);
                    }
                }
            })
        });
    }))();
};
exports.setUpSocketServer = setUpSocketServer;
