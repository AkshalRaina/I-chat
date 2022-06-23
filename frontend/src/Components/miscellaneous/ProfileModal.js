import { ViewIcon } from '@chakra-ui/icons';
import { Button, IconButton, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure,Image,Text } from '@chakra-ui/react';
import React from 'react'



const ProfileModal=({user,children})=> {

    const {isOpen,onOpen,onClose}=useDisclosure();

  return (
    <>
    {/* if the children are supplied hen display the children */}
        
        {children ? (
            <span onClick={onOpen}>{children}</span>
        ):(<IconButton display={{base:"flex"}} icon ={<ViewIcon/>} onClick={onOpen}/>
        )}
        
        <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent height="410px">
          <ModalHeader
            fontSize="40px"
            fontFamily="Work Sans"
            display="flex"
            justifyContent="center"
            
          >{user.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="space-between"
          >

          <Image
            borderRadius="full"
            boxSize="150px"
            src={user.pic}
            alt={user.name}
          >

          </Image>
            <Text 
            fontSize={{base:"28px",md:"30px"}}
            fontFamily="Work sans"
            >
            Email:{user.email}
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Close
            </Button>
            {/* <Button variant='ghost'>Secondary Action</Button> */}
          </ModalFooter>
        </ModalContent>
      </Modal>



</>
);
    
};

export default ProfileModal