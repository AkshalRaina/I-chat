import { Avatar, background, Box, Text } from '@chakra-ui/react';
import React from 'react'
import { ChatState } from '../../context/ChatProvider'

const UserListItem=({user,handleFunction})=> {

    // const {user}=ChatState();

  return (
      <Box 
        onClick={handleFunction}
        cursor="pointer"
        bg="#E8E8E8"
        _hover={{
            background:"#38B2AC",
            color:"white",
        }}
        w="100%"
        h="15%"
        display="flex"
        alignItems="center"
        color="black"
        px={3}
        py={7}
        mb={2}
        borderRadius="lg"
      >
      <Avatar
      mr={2}
      size="sm"
      cursor="pointer"
      name={user.name}
      pic={user.pic}
      >
      </Avatar>
        <Box>
            <Text>{user.name}</Text>
            <Text fontSize="xs"><b>Email: </b>{user.email}</Text>
            
        </Box>
      </Box>
    
  )
}

export default UserListItem