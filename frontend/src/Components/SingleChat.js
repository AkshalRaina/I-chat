import { ArrowBackIcon } from '@chakra-ui/icons';
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react';
import axios from 'axios';
import React,{useEffect, useRef, useState} from 'react'
import { getSenderFull,getSender } from '../config/ChatLogics';
import { ChatState } from '../context/ChatProvider'
import ProfileModal from './miscellaneous/ProfileModal';
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal';
import ScrollableChat from "./ScrollableChat"
import io from "socket.io-client"
import Lottie, {} from 'react-lottie'
import animationData from "../animations/Typing.json"

const ENDPOINT="https://mern-i-chat.herokuapp.com/";

var socket,selectedChatCompare;

const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };


const SingleChat=({fetchAgain,setFetchAgain})=> {
  
  const [messages,setMessages]=useState([]);
  const [loading,setLoading]=useState(false);
  const [newMessage,setNewMessage]=useState(""); 
  const [socketConnected,setSocketConnected]=useState(false);
  const [typing,setTyping]=useState(false);
  const [isTyping,setIsTyping]=useState(false);  
  const {user,selectedChat,setSelectedChat,notification,setNotification}=ChatState();
  const messageEndRef=useRef(null);
  const toast=useToast();

    const fetchMessages= async()=>{

        if(!selectedChat) return;

        try{
            const config={
                headers:{
                    Authorization:`Bearer ${user.token}`,
                },
            };
            setLoading(true);
            const {data}=await axios.get(
            `/api/message/${selectedChat._id}`,
            config);

            // console.log(messages);
            setMessages(data);
            setLoading(false);

            socket.emit("join chat",selectedChat._id);
        }catch(error){  
            toast({
                title:"Error Occured!",
                description:"Failed to Load the Messages",
                status:"error",
                duration:5000,
                isClosable:true,
                position:"bottom"
            })
        }
    }

    const sendMessage=async(event)=>{
        if(event.key === "Enter" && newMessage){
            socket.emit("stop typing",selectedChat._id)
            try{
                const config ={
                    headers:{
                        "Content-type":"application/json",
                        Authorization:`Bearer ${user.token}`
                    }
                };

                setNewMessage("");
                setMessages([]);
                const {data}=await axios.post('/api/message',{  
                    content:newMessage,
                    chatId:selectedChat._id,
                },config);

                // console.log(data);

                // send new message socket
                socket.emit("new message",data);
                setMessages([...messages,data]);
            }
            catch(error){
                toast({
                    title:"Error Occured!",
                    description:"Failed to send Message",
                    status:"error",
                    duration:5000,
                    isClosable:true,
                    position:"bottom",
                })
            }
        }
    }

    // to scroll to bottom after change in msg
    useEffect(()=>{
        messageEndRef.current?.scrollIntoView();
    },[messages]);
    useEffect(()=>{
        socket=io(ENDPOINT);

        // we emit setip socket the user object
        socket.emit("setup",user);
        // as soon it returns something 
        socket.on("connected",()=>setSocketConnected(true));

        socket.on("typing",()=>setIsTyping(true));
        socket.on("stop typing",()=>setIsTyping(false));
    },[])

    useEffect(()=>{
        fetchMessages();

        selectedChatCompare=selectedChat;

    },[selectedChat]);

    console.log(notification,'----------------'); 
     // we want to render it everytime out state changes
     useEffect(()=>{
        socket.on("message received",(newMessageReceived)=>{
            
            // if none of chats are selected or new message received is not one selected chat
            if(!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id){
            // give notification 
            // if notification array does not include current noyification we add new msg received to array 
                if(!notification.includes(newMessageReceived)){
                    setNotification([newMessageReceived,...notification]);
                    // fetch all chats again
                    setFetchAgain(!fetchAgain);
                }


            }
            // else add messages to list of messages
            else{
                setMessages([...messages,newMessageReceived])
            }
        });
    })


    const typingHandler=(e)=>{
        setNewMessage(e.target.value);

        // Typing Indicator Logic 
        if(!socketConnected) return;

        if(!typing){
            setTyping(true);
            socket.emit("typing",selectedChat._id);
        }

        let lastTypingTime= new Date().getTime()
        var timerLength=3000;
        setTimeout(()=>{
            var timeNow=new Date().getTime();
            var timeDiff=timeNow-lastTypingTime;

            if(timeDiff>=timerLength && typing){
                // stop typing in room od selected chat
                 socket.emit("stop typing",selectedChat._id);
                 setTyping(false);
            }

        } ,timerLength);
    
    };

 
    return (
    <>
        {selectedChat ? (
            <>
            <Text
            fontSize={{base:"28px",md:"30px"}}
            pb={3}
            px={2}
            w="100%"
            fontFamily={"Work sans"}
            display="flex"
            
            justifyContent={{base:"space-between"}}
            alignItems="center"
            >
        <IconButton
        display={{base:"flex",md:"none"}}
        icon={<ArrowBackIcon/>}
        onClick={()=>setSelectedChat("")}
        />
        {!selectedChat.isGroupChat ? (
            <>
            {getSender(user,selectedChat.users)}
            <ProfileModal user={getSenderFull(user,selectedChat.users)}/>

            </>
        ):(
            <>{selectedChat.chatName.toUpperCase()}
            <UpdateGroupChatModal
            fetchMessages={fetchMessages}
            fetchAgain={fetchAgain}
            setFetchAgain={setFetchAgain}
            >

            </UpdateGroupChatModal>

            </>
        )}
          
            </Text>
            <Box
                display="flex"
                flexDir="column"
                p={3}
                bg="#E8E8E8"
                w="100%"
                h="100%"
                borderRadius={"lg"}
                overflow="scroll"
                position={"bottom"}
                // paddingBottom={10}
                marginBottom={10}
                >
               
               
                {loading ? <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"    
                />:(       
                <>
               
                    <div display="flex" flex-direction="column" overflowY="scroll" scrollbar-width="none">
                       <ScrollableChat messages={messages}/>
                    </div>
                   
                </> 
        )}
                    <FormControl 
                    onKeyDown={sendMessage} 
                    isRequired 
                    display={'flex'}
                    mt={3}>
                    {isTyping?<div>

                    <Lottie
                    options={defaultOptions}
                    width={70}
                    style={{marginBottom:-35, marginLeft:0}}
                    />
                    
                    
                    </div>:(<></>)}
                    <div ref={messageEndRef}></div>

                        <Input 
                        variant="filled"
                        bg="#E0E0E0"
                        position="fixed"
                        bottom={7}
                        overflow="hidden"
                        right={5}
                       width={'65%'}


                        // left="20px"
                        // marginLeft="100px"
                      

                        value={newMessage}
                        placeholder="Enter a message.."
                        onChange={typingHandler}
                        ></Input>   
                    </FormControl>
                </Box>
            </>

        ):(
            <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            h="100%"
            w="100%"
            // bg="#E8E8E8"
            borderRadius="3xl"
            >
            <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to Start Chatting
            </Text>
            </Box>
        )}
    </>
  )
}

export default SingleChat