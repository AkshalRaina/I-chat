const mongoose=require("mongoose");
const bcrypt=require("bcryptjs")



const userModel=mongoose.Schema({

name:{type:String,required:true},
email:{type:String,required:true,unique:true},
password:{type:String,required:true},
pic:{type:String,
default:"https://thumbs.dreamstime.com/b/default-avatar-profile-vector-user-profile-default-avatar-profile-vector-user-profile-profile-179376714.jpg"
},
isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
},
{ timestaps: true }
);

userModel.methods.matchPassword=async function(enteredPassword){
return await bcrypt.compare(enteredPassword,this.password)
}

userModel.pre('save',async function (next){
    if(!this.isModified){
        next()
    }
    const salt=await bcrypt.genSalt(10);
    this.password=await bcrypt.hash(this.password,salt);
})

const User=mongoose.model("User",userModel);
module.exports=User;