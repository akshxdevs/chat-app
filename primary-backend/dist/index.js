"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const socket_1 = require("./socket");
const user_1 = require("./routes/user");
const message_1 = require("./routes/message");
const chats_1 = require("./routes/chats");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/v1/user", user_1.UserRouter);
app.use("/api/v1/message", message_1.messageRouter);
app.use("/api/v1/chat", chats_1.chatRouter);
const server = http_1.default.createServer(app);
(0, socket_1.setUpSocketServer)(server);
server.listen(config_1.PORT, () => {
    console.log(`ws & http server running on port:${config_1.PORT}`);
});
