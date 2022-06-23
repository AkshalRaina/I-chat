const express = require("express");
const { acessChat, createGroupChat, renameGroup, addToGroup, removeFromGroup } = require("../Controllers/chatControllers");
const {fetchChats} =require("../Controllers/chatControllers");
const {protect}=require("../middleware/authMiddleware");

const router=express.Router();
// reload();
// create chat if not from  given id to bearer token  id->bearertoken 
router.route("/").post(protect,acessChat);

// returns all chats to the bearedtoken chat
router.route("/").get(protect,fetchChats);

// make group chat with bearer token user and given ids
router.route("/group").post(protect,createGroupChat);

// renames group with given group id 
router.route("/rename").put(protect,renameGroup);

// adds given user id to group id
router.route("/groupadd").put(protect,addToGroup);

// removes given user from group id 
router.route("/groupremove").put(protect,removeFromGroup);



module.exports=router; 