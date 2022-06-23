import { ViewIcon } from '@chakra-ui/icons';
import { Button, IconButton, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, useToast,Box, FormControl, Input, Spinner, position } from '@chakra-ui/react';
import axios from 'axios';
import React, { useState } from 'react'
import { ChatState } from '../../context/ChatProvider';
import UserBadgeItem from '../UserAvatar/UserBadgeItem';
import UserListItem from '../UserAvatar/UserListItem';

const UpdateGroupChatModal=({fetchAgain,setFetchAgain,fetchMessages})=> {

    const {isOpen,onOpen,onClose}=useDisclosure();
    // const {selectedChat,setSelectedChat,user}=ChatState();

    const [GroupChatName,setGroupChatName]=useState();
    const [search,setSearch]=useState("")
    const [searchResult,setSearchResult]=useState([])
    const [loading,setLoading]=useState(false)
    const [renameLoading,setRenameLoading]=useState(false)

    const {selectedChat,setSelectedChat,user}=ChatState();

    const handleRemove= async(user1)=>{

    // if loggedinuser is not one being removed and groupadmin id dosent match the user

    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      toast({
        title: "Only admins can remove someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/chat/groupremove`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );

      user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
     
      // update fetch chats after removing someone from the group
      fetchMessages();
      setLoading(false);
      }
      catch(e){
        toast({
          title:"Error in removing user!",
          description:e.response.data.message,
          status:"error",
          duration:5000,
          isClosable:true,
          position:"bottom"
        });
        setLoading(false);
      }


    }
    const handleAddUser= async (user1)=>{
      
      // user1 is user to add id

      if(selectedChat.users.find((u)=>u._id === user1._id)){
        toast({
          title:"Users Already in group!",
          status:"error",
          duration:5000,
          isClosable:true,
          position:"bottom"
        });
        return;
      }
      
      // user is loggedin user id
      if(selectedChat.groupAdmin._id !==user._id){
        toast({
          title:"Only admins can add someone!",
          status:"error",
          duration:5000,
          isClosable:true,
          position:"bottom",
        })
        return;
      }

      try{
        setLoading(true);


        const config={
          headers:{
            Authorization:`Bearer ${user.token}`,
          }
        }
        const {data}=await axios.put('/api/chat/groupadd',{
          chatId:selectedChat._id,
          userId:user1._id,
        },config);

        setSelectedChat(data);
        setFetchAgain(!fetchAgain);
        setLoading(false);

      }
      catch(e){
        toast({
          title:"Error Occured!",
          description:e.response.data.message,
          status:"error",
          duration:5000,
          isClosable:true,
          position:"bottom",
        });
        setLoading(false);
      }


    }

    const handleRename=async()=>{
      if(!GroupChatName)
      return;
      
      try{
        setRenameLoading(true);
        const config={
          headers:{
            Authorization:`Bearer ${user.token}`,
          },
        };

        const {data}=await axios.put('/api/chat/rename',{
          chatId:selectedChat._id,
          chatName:GroupChatName,
        },config
        );  

        setSelectedChat(data);
        setFetchAgain(!fetchAgain);
        setRenameLoading(false);
      }catch(e){

        toast({
          title:"Error Occured!",
          description:e.response.data.message,
          status:"error",
          duration:5000,
          isClosable:true,
          position:"bottom",
        });
        setRenameLoading(false);
      }
      setGroupChatName("");
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


    const toast=useToast();

  return (
   <>
    <IconButton  display={{base:'flex'}} icon={<ViewIcon/>} onClick={onOpen} /> 

<Modal isOpen={isOpen} onClose={onClose}  >
  <ModalOverlay />
  <ModalContent>
    <ModalHeader justifyContent="center" display={"flex"} isCentered>{selectedChat.chatName}</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
    <Box>
    {selectedChat.users.map(u=>(
      <UserBadgeItem
                key={user._id}
                user={u}    
                handleFunction={()=>handleRemove(u)}
              />
    ))}

    </Box>
      <FormControl display="flex">
      <Input
      placeholder="Chat Name"
      mb={3}
      value={GroupChatName}
      onChange={(e)=>setGroupChatName(e.target.value)}
      />

      <Button
      variant="solid"
      colorScheme={"teal"}
      ml={1}
      isLoading={renameLoading}
      onClick={handleRename}
      >
      Upadte
      </Button>
      </FormControl>
      <FormControl>
      <Input
      placeholder="Add User to Group"
      mb={1}
      onChange={(e)=>handleSearch(e.target.value)}
      />
      </FormControl>
      {loading ?(<Spinner size="lg"/>):(
        searchResult?.map((user)=>(
          <UserListItem
          key={user._id}
          user={user}
          handleFunction={()=>handleAddUser(user)}
          />
        ))
      )}
    </ModalBody>

    <ModalFooter>
      <Button onClick={()=>handleRemove(user)} colorScheme="red">
        Leave Group
      </Button>
    
    </ModalFooter>
  </ModalContent>
</Modal>
</>
   
  )
}

export default UpdateGroupChatModal