const asyncHandler=require("express-async-handler");
const Chat=require("../Models/chatModel");
const User=require("../Models/userModel");

exports.acessChat=asyncHandler(async(req,res)=>{
    // check if user with requested userid exists, if it does not exist create one and if it exist return it
    const {userId}=req.body;

    // if user with userid does not avaliable with our reauest
    if(!userId){
        console.log("User Params not sent with request");
        return res.sendStatus(400)
    }

    // if user with this id is avaliable 
    var isChat=await Chat.find({
        isGroupChat:false,
        // should be equal to currennt user id or user id we sends
        $and:[
            {users:{$elemMatch:{$eq:req.user._id}}},
            {users:{$elemMatch:{$eq:userId}}},
        ],
    }).populate("users","-password").populate("latestMessage");

    isChat=await User.populate(isChat,{
        path:'latestMessage.sender',
        select:"name pic email",
    });

    // if chat exists
    if(isChat.length>0){
        res.send(isChat[0]);
    }  
    else{
        var chatData={
         chatName:"sender",
        isGroupChat:false,

        // users array has user loggedin id and user with which we are trying to create a chat respectively.
        users:[req.user._id,userId],
    };
    try{
        const createdChat=await Chat.create(chatData);
        const fullChat=await Chat.findOne({_id:createdChat._id}).populate("users","-password");
        res.status(200).send(fullChat);
    }
    catch(error){
        res.status(400);
        throw new Error(error.message);
    }
    }
})

exports.fetchChats=asyncHandler(async(req,res)=>{

 
    try{
        // we gp through all the chats in our database and return chats that user is a part of amd them return it   
            Chat.find({users:{$elemMatch:{$eq:req.user._id}}})
            .populate("users","-password")
            .populate("groupAdmin","-password")
            .populate("latestMessage")
            .sort({updatedAt:-1})
            .then(async (results)=>{
                results=await User.populate(results,{
                    path:"latestMessage.sender",
                    select:"name pic email",
                })
                res.status(200).send(results); 
            })
    }
    catch(error){
        res.status(400);
        throw new Error(error.message);
    }

})

exports.createGroupChat=asyncHandler(async(req,res)=>{
    if(!req.body.users || !req.body.name){
        return res.status(400).send({message:"Please Fill out all the feilds"});
    }


    var users=JSON.parse(req.body.users);

    if(users.length<2){
        return res
        .status(400)
        .send("More than 2 users are required to form a group chat");
    }

    users.push(req.user);
    
    try{
        const groupChat=await Chat.create({
            chatName:req.body.name,
            users:users,
            isGroupChat:true,
            groupAdmin:req.user,
        })
        
        const fullGroupChat=await Chat.findOne({_id:groupChat._id})
        .populate("users","-password")
        .populate("groupAdmin","-password");
    res.status(200).json(fullGroupChat);
    }

    catch(error){
        res.status(400);
        throw new Error(error.message);
    }

})

exports.renameGroup=asyncHandler(async(req,res)=>{
    const{chatId,chatName}= req.body;

        const updatedChat=await Chat.findByIdAndUpdate(
            chatId,{

                // update chatName to chatName
                chatName,
            },
            {
                // this returns new value if we dont do this it gives old value
                new :true,   
            }
        )
        .populate("users","-password")
        .populate("groupAdmin","-password")
            if(!updatedChat){
                res.status(404);
                throw new Error("Chat not found")
            }
            else{
                res.json(updatedChat)
            }

})

exports.addToGroup=asyncHandler(async(req,res)=>{
    
    // chat id for adding user to particular group and user id 
    const{chatId,userId}=req.body;

    const added=await Chat.findByIdAndUpdate(chatId,{ 
        $push:{users:userId},
        },
        {new :true}
    )
        .populate("users","-password")
        .populate("groupAdmin","-password");

        if(!added){
            res.status(404);
            throw new Error("Chat not found!")
        }
        else{
            res.json(added);
        }
})

exports.removeFromGroup=asyncHandler(async(req,res)=>{
    
    // chat id for adding user to particular group and user id 
    const{chatId,userId}=req.body;

    const removed=await Chat.findByIdAndUpdate(chatId,{ 
        $pull:{users:userId},
        },
        {new :true}
    )
        .populate("users","-password")
        .populate("groupAdmin","-password");

        if(!removed){
            res.status(404);
            throw new Error("Chat not found!")
        }
        else{
            res.json(removed);
        }
})

