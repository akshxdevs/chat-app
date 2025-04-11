import { WebSocket, WebSocketServer } from "ws";
import { Server as httpServer } from "http";
import { redisClient } from "./redis/init";
import { producer } from "./kafka/producer";
import { consumer } from "./kafka/consumer";

const clients = new Map<string,WebSocket>();
export const setUpSocketServer  = (server:httpServer) => {
    const wss = new WebSocketServer({noServer:true})
    server.on('upgrade',(req,socket,head)=>{
        const query = req.url?.split("/")[1];
        const userId = query as string;
        if (!userId) return socket.destroy
        wss.handleUpgrade(req,socket,head,(ws)=>{
            wss.emit('connection',ws,userId)
        });
    });

    wss.on('connection',async(socket:WebSocket,userId:string)=>{
        clients.set(userId,socket)
        console.log(`UserId: ${userId} Connected!`);

        const pending = await redisClient.lrange(`message:${userId}`,0,-1);
        pending.forEach((message)=>socket.send(message));
        redisClient.del(`message:${userId}`);

        socket.on('message',async(data)=>{
            try {
                const {to,text} = JSON.parse(data.toString());
                const message = {from:userId,to,text}
                await producer.send({
                    topic:"chat-room",
                    messages:[{value:JSON.stringify(message)}]
                })
            } catch (err) {
                console.error("Invalid message format:", err);
            }
        });
        socket.on("close", () => {
            clients.delete(userId);
            console.log(`User disconnected: ${userId}`);
        });
    });

    (async()=>{
        await producer.connect();
        await consumer.connect();
        await consumer.subscribe({topic:"chat-room",fromBeginning:false});

        await consumer.run({
            eachMessage:async({message})=>{
                if (!message.value) return;

                const {from,to,text} = JSON.parse(message.value.toString());
                const payload = JSON.stringify({from,text});

                const reciver = clients.get(to);
                if (reciver && reciver.readyState === WebSocket.OPEN) {
                    reciver.send(payload);
                    console.log(`Message form ${from} Delivered to ${to}`);
                }else{
                    await redisClient.rpush(`message:${to}`,payload);
                    console.log(`Message is Stored for user ${to}!!`);
                }
            }
        })
    })();
}
