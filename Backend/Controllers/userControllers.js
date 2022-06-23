const asyncHandler =require('express-async-handler');
const User=require("../Models/userModel");
const generateToken=require("../Config/generateToken"); 


// make a user register
exports.registerUser= asyncHandler(async(req,res)=>{
        const {name,email,password,pic}=req.body;

        if(!name || !email || !password){
            throw new Error("Please Enter all the Details",400);
        }
        const userExists=await User.findOne({email});
        if(userExists){
            throw new Error("User already exists",400);

        }

        const user=await User.create({
            name,
            email,
            password,
            pic,
        });

        if(user){
            res.status(201).json({
                _id:user._id,
                name:user.name,
                email:user.email,
                pic:user.pic,
                token:generateToken(user._id)
            })
        }
        else{
            throw new Error("Failed to create new user",400);
        }
  
})

exports.authUser=asyncHandler(async(req,res)=>{
    const {email,password}=req.body;


    const user=await User.findOne({email});

    if(user && (await user.matchPassword(password))){
        res.json({
            _id:user._id,
            name:user.name,
            email:user.email,
            pic:user.pic,
            token:generateToken(user._id)
        })
    }
    else{
        res.status(400);
        throw new Error("Invalid Email or password");
    }
    
})


// api/user
exports.allUsers=asyncHandler(async(req,res)=>{

// get user details with sprcified details 

    const keyword=req.query.search
    ?{
        // or means any of one, $options i=case insenstive
    $or:[
    {name:{$regex:req.query.search,$options:"i"}},
    {email:{$regex:req.query.search,$options:"i"}},
    ]
}:{}

const users=await User.find(keyword).find({_id:{$ne:req.user._id}});
res.send(users);

})