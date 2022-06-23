const express=require('express');
const router=express.Router();

// const router=require('router');  
const { registerUser,authUser,allUsers } = require('../Controllers/userControllers');
const { protect } = require('../Middleware/authMiddleware');

router.route('/').post(registerUser).get(protect,allUsers);
router.post('/login',authUser);

module.exports=router;