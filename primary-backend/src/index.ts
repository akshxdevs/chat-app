import http from "http";
import express from "express";
import cors from "cors";
import { PORT } from "./config";
import { setUpSocketServer } from "./routes/socket";

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

setUpSocketServer(server);

server.listen(PORT, () => {
    console.log(`ws & http server running on port:${PORT}`);
});