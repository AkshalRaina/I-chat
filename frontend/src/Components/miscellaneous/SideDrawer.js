import { Button, MenuButton, Tooltip,Menu, MenuList, Avatar, MenuItem, MenuDivider, Drawer, useDisclosure, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, Input, Spinner } from '@chakra-ui/react';
import React,{useState} from 'react'
import {Box,Text} from "@chakra-ui/react"
import {BellIcon,ChevronDownIcon} from "@chakra-ui/icons";
import { ChatState } from '../../context/ChatProvider';
import ProfileModal from './ProfileModal';
import {useHistory} from "react-router-dom";
// import { useDisclosure } from '@chakra-ui/react';
import { useToast } from "@chakra-ui/react";
import axios from 'axios';
import { getSender } from '../../config/ChatLogics';
import ChatLoading from '../ChatLoading';
import UserListItem from '../UserAvatar/UserListItem';
import { Effect } from 'react-notification-badge'
import NotificationBadge from 'react-notification-badge';
const SideDrawer = ()=> {

  const [search,setSearch]=useState("");
  const[searchResult,setSearchResult]=useState([]);
  const [loading,setLoading]=useState(false);
  const [loadingChat,setLoadingChat]=useState(false);
  const toast = useToast();


// we create these in our context so that its acessable all over our app
  const {user,setSelectedChat,chats,setChats,notification,setNotification}=ChatState();
  const history=useHistory();
  const {isOpen,onOpen,onClose}=useDisclosure();


  const  logoutHandler=()=>{
    localStorage.removeItem("userInfo");
    history.push("/");
  };


  const handleSearch= async (query)=>{
    setSearch(query)
    if(!query){
        return ;
    }


    try{
        setLoading(true);
        const config={
            headers:{
                Authorization:`Bearer ${user.token}`
            },
        };

        const {data}= await axios.get(`/api/user?search=${search}`,config)
        console.log(data);
        setLoading(false);
        setSearchResult(data);
    }
    catch(e){
        toast({
            title:"Error occured!",
            description:"Failed to load search results",
            status:"error",
            duration:5000,
            isClosable:true,
            position:"bottom-left",
        });
    }
  }

  const accessChat=async(userId)=>{
    console.log(userId);
    try{
      setLoadingChat(true);
      const config={
        headers:{
          "Content-type":"application/json",
          Authorization:`Bearer ${user.token}`,
        },
      };
      const {data}=await axios.post("/api/chat",{userId},config);


      // if it finds the chats in the list then it just updates the list by appnding
      if(!chats.find((c)=> c._id === data._id))
      setChats([data, ...chats]);

      setSelectedChat(data);
      setLoadingChat(false);
      onClose(); 
    }
    catch(e){
      toast({
        title: "Error in fetching Chats!",
        description:e.message,
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      }); 
    }
  }

  return (
   <>
     <Box
     display="flex"
     justifyContent="space-between"
     alignItems="center"
     bg="white"
     w="100%"
     p="5px 10px 5px 10px"
     borderWidth="5px"
     >
       <Tooltip
       label="Seacrh Users to Chat"
       hasArrow
       placement="bottom-end"
       >
        <Button variant="ghost" onClick={onOpen}>
        <i class="fas fa-search"></i>
        <Text d={{base:"none",md:"flex"}} px="4">Search User</Text>
        </Button>
       
       </Tooltip>
       <Text fontSize="2xl" fontFamily="Work sans">
        I-Chat
       </Text>
       <div>
         <Menu>
           <MenuButton p={1}>
           <NotificationBadge
           count={notification.length}
           effect={Effect.SCALE}
           >

           </NotificationBadge>
          <BellIcon fontSize={"2xl"} m={1}/>
           </MenuButton>
            <MenuList pl={2}>
              {!notification.length && "No new messages"}
              {notification.map(notify=>(
                <MenuItem key={notify._id} onClick={()=>{
                  setSelectedChat(notify.chat);
                  setNotification(notification.filter((n)=> n!== notify));
                }}>
                {notify.chat.isGroupChat?`New Message in ${notify.chat.chatName}`
                :`New message from ${getSender(user,notify.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>

        <Menu>
          <MenuButton as={Button} ringhtIcon={<ChevronDownIcon/>}>
            <Avatar size="sm" cursor="pointer" name={user.name} src={user.pic}/>
          </MenuButton>


        <MenuList>
        <ProfileModal user={user}>
          <MenuItem>My Profile</MenuItem>
        </ProfileModal>
          {/* <MenuDivider/> */}
          <MenuItem onClick={logoutHandler}>Logout</MenuItem>
        </MenuList>
        </Menu>
         </Menu>
       </div>
      

     </Box>
    <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
    <DrawerOverlay/>
        <DrawerContent>
          <DrawerHeader borderBottom="1px">Search Users</DrawerHeader>
          <DrawerBody>
          <Box
          display="flex"
          pb={2}
          >
          <Input
          placeholder="Search by name or email"
          mr={"2"}
          
          onChange={(e)=>handleSearch(e.target.value)}
          />
          {/* <Button onClick={handleSearch}>Search</Button> */}
          </Box>
          {loading?(<ChatLoading/>):(
          
          searchResult?.map((user)=>(
            <UserListItem
            key={user._id}
            user={user}
            handleFunction={()=>accessChat(user._id)}
            />
          ))
          
          
          )}
          {loadingChat && <Spinner display={"flex"} ml="auto"/>}
        </DrawerBody>
        </DrawerContent>
        




    </Drawer>




   </>
  )
}

export default SideDrawer