"use client";
import { BACKEND_URL } from "@/config";
import axios from "axios";
import { useParams } from "next/navigation";
import { use, useEffect, useState } from "react"

export default function(){
    const [socket,setSocket] = useState<WebSocket | null>(null);
    const [messages,setMessages] = useState<{from:string; to:string; text:string}[]>([]);
    const [messagefeed,setmessageFeed] = useState<any[]>([]);
    const [profileImg,setProfileImg] = useState<string>("");
    const [showChatModel,setShowChatModel] = useState(false);
    const [contactName,setContactName] = useState();
    const [contactProfileImg,setContactProfileImg] = useState();
    const [message,setMessage] = useState("");
    const [sendModel,setSendModel] = useState(false);
    const [receiverId,setReceiverId] = useState();
    const [chats,setChats] = useState<any[]>([]);
    const [chatFeedModel,setChatFeedModel] = useState(false);
    const [searchedUsers,setSearchedUsers] = useState<any[]>([]);
    const [contactId,setContactId] = useState();
    const [pendingMsg,setPendingMsg] = useState<any[]>([]);
    const [messageModel,setMessageModel] = useState(true);
    const [groupModel,setGroupModel] = useState(false);
    const params = useParams();
    const userId:any = params[""]?.[0];
    const now = new Date();
    const timeNow = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'});

    useEffect(()=>{
        const getProfileImg  = localStorage.getItem("profileImg");
        if (getProfileImg) setProfileImg(getProfileImg);
    },[userId]);

    useEffect(()=>{
        fetchMessages();
        getAllMessageFeed();
    },[messages])

    const connectWebSocket = () => {
        if (!userId) return;
    
        const ws = new WebSocket(`ws://localhost:3000/${userId}`);
    
        ws.onopen = () => {
        console.log('WebSocket connected');
        setSocket(ws);
        };
    
        ws.onmessage = (event) => {
        try {
            const received = JSON.parse(event.data);
    
            const fullMessage = {
            ...received,
            to: userId,
            };
    
            setMessages((prev) => [...prev, fullMessage]);
            console.log('Received:', fullMessage);
        } catch (err) {
            console.error('Invalid JSON from server:', event.data);
        }
        };
    
        ws.onclose = () => {
        console.log('WebSocket disconnected');
        };
    
        return () => {
        ws.close();
        console.log('WebSocket cleanup');
        };
    };
    
      const getAllMessageFeed = async() => {
        const res = await axios.get(`${BACKEND_URL}/message/get/${userId}`);
        if (res.data) {
            setmessageFeed(res.data.getMessagefeed);
        }
      };
      const SendMessage = () => {
        if (socket && socket.readyState === WebSocket.OPEN && message.trim() && receiverId) {
          const msg:any = { from: userId, to: receiverId, text: message };
          socket.send(JSON.stringify(msg));
          setMessages((prev) => [...prev, msg]);
          setMessage('');
        } else {
          console.warn('WebSocket is not open or message is empty');
        }
      };
      const chatDetails = ({contactName,profileImg,contactId}:any) => {
        setContactName(contactName);
        setContactProfileImg(profileImg);
        setReceiverId(contactId);
        setContactId(contactId);
        getAllMessageFeed();
    }     
    const getUserMessages = async ({ contactId: id }: any) => {
        try {
          const res = await axios.get(`${BACKEND_URL}/chat/get/${userId}/${id}`);
          if (res.data && res.data.getChat) {
            setChats(res.data.getChat);
          }
        } catch (err: any) {
          console.error("Failed to fetch chat:", err.message);
        }
      };
      

      
    const storeChat = async() => {
        const res = await axios.post(`${BACKEND_URL}/chat/add/${userId}`,{            
            receiverId:receiverId,
            text:message
        });
        if (res.data) {
            console.log("Message Stored Successfully in the db");
        }
    }
    
    const searchUser = async(value:any) => {
        const res = await axios.post(`${BACKEND_URL}/user/search/${value}`);
        if (res.data) {
            setSearchedUsers(res.data.user)
        }
    }
    const fetchMessages = async () => {
        try {
          const res = await axios.get(`${BACKEND_URL}/message/pendingmsg/${userId}`);
          if (res.data) {
            setPendingMsg(res.data.message);
          }
        } catch (err) {
          console.error("Failed to fetch messages", err);
        }
      };
    const handleUser = async() => {
            const res = await axios.get(`${BACKEND_URL}/message/getcontact/${userId}/${contactId}`,)
            if (!res.data === null) {
                SendMessage();
                storeChat();
                getAllMessageFeed();
            }else{
                const res = await axios.post(`${BACKEND_URL}/message/add/${userId}`,{
                    contactName,
                    contactId
                });
                if (res.data) {
                    SendMessage();
                    storeChat();
                    getAllMessageFeed();
                }
            }
    }
    return <div className="flex flex-col justify-center items-center h-screen">
    <div className="bg-gray-800 border border-gray-500 rounded-lg">
        <div className="flex justify-between h-[600px]">
            <div className="w-16 border-r  border-gray-500">
                <div className="flex flex-col justify-between gap-60">
                    <div className="flex flex-col justify-center items-center py-5 gap-8">
                        <button className={`${messageModel ? "p-2 border border-green-700 rounded-full" : "p-2"}`} onClick={()=>{
                            setGroupModel(false);
                            setMessageModel(true)}}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                            </svg>
                        </button>
                        <button>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                            </svg>
                        </button>
                        <button>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                            </svg>
                        </button>
                        <button className={`${groupModel ? "p-2 border border-green-700 rounded-full" : "p-2"}`} onClick={()=>{
                            setMessageModel(false)
                            setGroupModel(true);
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex flex-col justify-center items-center gap-5">
                        <button>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                        </button>
                        <button>
                            {profileImg ? (
                                <div>
                                    <img src={profileImg} className="rounded-full w-fit h-8 border border-gray-700 object-cover object-center"/>
                                </div>
                            ):(
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            {groupModel && (
                <div className="w-96 border-r bg-[#041016a6] border-gray-500 py-4 px-2">
                    <div className="flex justify-between ">
                        <div>
                            <h1>Group Chats</h1>
                        </div>
                        <div className="flex gap-5">
                            <button>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                                </svg>
                            </button>
                            <button>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-center items-center w-full border my-3 rounded-lg gap-2">
                            <button className="py-1 pl-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                            </button>
                            <input type="text" placeholder="Search" className="w-full outline-none border-none" onChange={(e:any)=>{
                                const value = e.target.value;
                                setChatFeedModel(value.trim().length > 1);
                                searchUser(value);
                            }}/>
                        </div>
                    </div>
                </div>
            )}
            {messageModel && (
                <div className="w-96 border-r bg-[#041016a6] border-gray-500 py-4 px-2">
                    <div className="flex justify-between ">
                        <div>
                            <h1>Chats</h1>
                        </div>
                        <div className="flex gap-5">
                            <button>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                                </svg>
                            </button>
                            <button>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-center items-center w-full border my-3 rounded-lg gap-2">
                            <button className="py-1 pl-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                            </button>
                            <input type="text" placeholder="Search" className="w-full outline-none border-none" onChange={(e:any)=>{
                                const value = e.target.value;
                                setChatFeedModel(value.trim().length > 1);
                                searchUser(value);
                            }}/>
                        </div>
                    </div>
                    {chatFeedModel ?(
                        <div>
                            {searchedUsers.length > 0 ?(
                                <div>
                                    {searchedUsers.map((user,index)=>(
                                            <div key={index} className="border-b border-gray-700 pt-2 px-1">
                                                <button className="flex gap-4" onClick={()=>{
                                                    chatDetails({contactName:user.name,profileImg:user.profileImg,contactId:user.id});
                                                    setShowChatModel(true);
                                                    connectWebSocket();
                                                }}>
                                                    <img src={user.profileImg} alt="profilePic" className="border border-gray-700 rounded-full w-10 h-10 object-cover object-center"/>
                                                    <div className="flex justify-between gap-32">
                                                        <div className="flex flex-col">
                                                            <h1 className="font-semibold text-lg text-start">{user.name}</h1>
                                                        </div>
                                                    </div>
                                                </button>
                                            </div>
                                    ))}
                                </div>
                            ):(
                                <div>

                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <div className="flex justify-between border-b px-5 pb-2 border-gray-800 "> 
                                <div className="border px-2 py-1 rounded-lg">
                                    <h1>All</h1>
                                </div>
                                <div className="border px-2 py-1 rounded-lg">
                                    <h1>unread</h1>
                                </div>
                                <div className="border px-2 py-1 rounded-lg">
                                    <h1>Favourites</h1>
                                </div>
                                <div className="border px-2 py-1 rounded-lg">
                                    <h1>Group</h1>
                                </div>
                            </div>
                            <div>
                                {messagefeed.length > 0 ? (
                                    <div className="border-b border-gray-700">
                                        {messagefeed.map((feed,index)=>(
                                            <div key={index} className=" border-b border-gray-700 p-2">
                                                <button onClick={()=>{
                                                    setShowChatModel(true)
                                                    getUserMessages({contactId:feed.contactId});
                                                    chatDetails({contactName:feed.contactName,profileImg:feed.profilePic,contactId:feed.contactId})
                                                    connectWebSocket();
                                                    setPendingMsg([]);
                                                    }}>
                                                    {pendingMsg && pendingMsg.length > 0 ? (
                                                        <div className="flex gap-6">
                                                            <img src={feed.profilePic} alt="profilePic" className="border border-gray-700 rounded-full w-10 h-10 object-cover object-center"/>
                                                            {pendingMsg && pendingMsg.length > 0 && (
                                                            <div className="flex gap-52">
                                                                <div className="flex flex-col">
                                                                <h1 className="font-bold text-lg text-start text-slate-400">{feed.contactName}</h1>
                                                                <p className="text-sm font-semibold text-slate-200">
                                                                    • {pendingMsg[0]?.text || "No message"}
                                                                </p>
                                                                </div>
                                                                <div className="flex flex-col justify-center items-center">
                                                                <p className="text-xs font-semibold py-1">{pendingMsg[0]?.timeStamp || "17:45"}</p>
                                                                <p className="w-5 h-5 text-[12px] bg-green-700 rounded-full text-center py-[1px]">
                                                                    {pendingMsg.length}
                                                                </p>
                                                                </div>
                                                            </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-6 pb-2">
                                                            <img src={feed.profilePic} alt="profilePic" className="border border-gray-700 rounded-full w-10 h-10 object-cover object-center"/>
                                                            <div className="flex gap-52 pb-2">
                                                                <div className="flex flex-col">
                                                                    <h1 className="font-bold text-lg text-start text-slate-400">{feed.contactName}</h1>
                                                                    <p className="text-sm font-semibold text-slate-200">{}</p>
                                                                </div>
                                                                <div className="flex flex-col justify-center items-center">
                                                                    <p className="text-xs font-semibold py-1">{}</p>
                                                                    <p className="w-5 h-5 text-[12px]  rounded-full text-center py-[1px]">{""}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </button>
                                            </div>
                                        ))} 
                                    </div>
                                ):(
                                    <div className="flex justify-center items-center h-80">
                                        No Messages
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end pr-10 mt-80">
                                <button onClick={()=>{
                                    setChatFeedModel(true)
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-9">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            <div className="">
                {showChatModel ? (
                    <div className="w-[432px] h-full flex flex-col bg-[#041016a6]">
                        <div className="flex flex-col justify-between gap-12">
                            <div className="flex justify-between gap-4 p-2 bg-gray-600 rounded-tr-lg">
                                <div className="flex gap-4">
                                    <img src={contactProfileImg} alt="profilePic" className="border bg-black border-gray-700 rounded-full w-10 h-10 object-cover object-center"/>
                                    <h1 className="font-semibold text-lg py-2 text-start">{contactName}</h1>
                                    </div>
                                <div className="flex gap-2 p-2">
                                    <button>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                        </svg>
                                    </button>
                                    <button>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="h-96 overflow-y-auto py-2 px-12 space-y-2 scrollbar-hide">
                                {chats.map((msg, index) => {
                                    const isSentByMe = msg.senderId === userId;
                                    const isRelatedToContact =
                                        msg.senderId === contactId || msg.receiverId === contactId;
                                    if (!isRelatedToContact) return null; 
                                    return (
                                        <div
                                        key={index}
                                        className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                                        >
                                        <div
                                            className={`rounded-lg px-2 max-w-xs break-words ${
                                            isSentByMe ? 'bg-green-800 text-white' : 'bg-gray-200 text-black'
                                            }`}
                                        >
                                            <p className="text-md">{msg.chat}</p>
                                            <p className="text-xs ml-4">
                                            {new Date(msg.timeStamp).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                            </p>
                                        </div>
                                        </div>
                                    );
                                })}
                                {messages.map((msg, index) => {
                                    const isSent = msg.from === userId;
                                    return (
                                    <div
                                        key={index}
                                        className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                        className={`rounded-lg px-2 max-w-xs break-words ${
                                            isSent ? 'bg-green-800 text-white' : 'bg-gray-200 text-black'
                                        }`}
                                        >
                                        <p className="text-md">{msg.text}</p>
                                        <p className="text-xs ml-4">{timeNow}</p>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                            <div className="fixed bottom-[55px] flex py-2 px-4 gap-4 bg-gray-600 rounded-br-lg">
                                <button>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                </button>
                                <div className="w-80 p-2 bg-gray-800 rounded-lg">
                                    <input type="text" placeholder="Type a message" className="w-full outline-none border-none" value={message} onChange={(e:any)=>{
                                        const val = e.target.value
                                        setMessage(val);
                                        setSendModel(val.trim().length > 0);
                                    }}/>
                                </div>
                                <button onClick={()=>{
                                    handleUser();
                                }}>
                                    {sendModel ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                                        </svg>
                                    ):(
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ):(
                    <div className="py-70">
                        <div className="flex flex-col justify-between items-center w-[500px] gap-32">
                            <div className="flex flex-col justify-center items-center p-3 gap-3">
                                <h1 className="text-3xl font-semibold">Chating Web</h1>
                                <p className="text-center">
                                Send and receive messages without keeping your phone online. Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
                                </p>
                            </div>
                            <p className="text-sm text-gray-500">🔒 Your personal messages are end-to-end encrypted</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
</div>
}