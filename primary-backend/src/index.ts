import http from "http";
import express from "express";
import cors from "cors";
import { PORT } from "./config";
import { setUpSocketServer } from "./socket";
import { UserRouter } from "./routes/user";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/user",UserRouter);

const server = http.createServer(app);

setUpSocketServer(server);

server.listen(PORT, () => {
    console.log(`ws & http server running on port:${PORT}`);
});