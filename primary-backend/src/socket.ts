import { WebSocket, WebSocketServer } from "ws";
import { Server as httpServer } from "http";
import { redisClient } from "./redis/init";
import { producer } from "./kafka/producer";
import { consumer } from "./kafka/consumer";

const clients = new Map<string,WebSocket>();
const groupClients = new Map<string,Set<WebSocket>>();
export const setUpSocketServer  = (server:httpServer) => {
    const wss = new WebSocketServer({noServer:true})
    server.on("upgrade", (req, socket, head) => {
        const parsedUrl = new URL(req.url!, `http://${req.headers.host}`);
        const userId = parsedUrl.pathname.slice(1);
        const groupName = parsedUrl.searchParams.get("group");
        if (!userId) return socket.destroy
        wss.handleUpgrade(req,socket,head,(ws)=>{
            wss.emit('connection',ws,userId,groupName)
        });
    });
    wss.on('connection',async(socket:WebSocket,userId:string,groupName:string)=>{
        clients.set(userId,socket);
        if (!groupClients.has(groupName)) {
            groupClients.set(groupName, new Set<WebSocket>());
          }
          groupClients.get(groupName)?.add(socket);
        console.log(`UserId: ${userId} Connected!`);

        const pending = await redisClient.lrange(`message:${userId}`,0,-1);
        pending.forEach((message)=>socket.send(message));
        redisClient.del(`message:${userId}`);

        socket.on('message',async(data)=>{
            try {
                const parsed = JSON.parse(data.toString());
                const { to, text, group } = parsed;
        
                const message = {
                  from: userId,
                  text,
                  ...(group ? { group } : { to }),
                };
                await producer.send({
                    topic:"chat-room",
                    messages:[{value:JSON.stringify(message)}]
                });
            } catch (err) {
                console.error("Invalid message format:", err);
            }
        });
        socket.on("close", () => {
            clients.delete(userId);
            if (groupName && groupClients.has(groupName)) {
                groupClients.get(groupName)!.delete(socket);
              }
            console.log(`User disconnected: ${userId}`);
        });
    });

    function Broadcast(groupName:any,data:any) {
        const payload = JSON.stringify(data);
        const sockets = groupClients.get(groupName);
        if(!sockets) return;
        sockets.forEach((client)=> {
            if (client.readyState === WebSocket.OPEN) {
                client.send(payload);
            }
        })
    }
    (async()=>{
        await producer.connect();
        await consumer.connect();
        await consumer.subscribe({topic:"chat-room",fromBeginning:false});

        await consumer.run({
            eachMessage:async({message})=>{
                if (!message.value) return;
                const parsed = JSON.parse(message.value.toString());
                const { from, to, text, group } = parsed;
                const payload = { from, text };
                if (group) {
                    Broadcast(group,payload);
                    console.log(`Message from ${from} broadcasted to group ${group}`);

                }else if(to){
                    const reciver = clients.get(to);
                    if (reciver && reciver.readyState === WebSocket.OPEN) {
                        reciver.send(JSON.stringify(payload));
                        console.log(`Message form ${from} Delivered to ${to}`);
                    }else{
                        await redisClient.rpush(`message:${to}`,JSON.stringify(payload));
                        console.log(`Message is Stored for user ${to}!!`);
                    }
                }
            }
        })
    })();
}
