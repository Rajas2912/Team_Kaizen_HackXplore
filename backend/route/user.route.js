import express from "express";
const router=express.Router();
import { register } from "../controler/user/user.registration.js";
import { checkEmail } from "../controler/user/checkEmail.controler.js";
import {login} from "../controler/user/login.controler.js";
import {UserDetails} from "../controler/user/userDetails.controler.js"
import { logout } from "../controler/user/logout.controler.js";
import { updateUser } from "../controler/user/updateUser.controler.js";
import { searchUser } from "../controler/user/searchUser.js";
// for registration 
router.post("/register", register);

// for email verification
router.post("/email",checkEmail);

// cheeck user password
router.post("/login",login);

// get user details from token 
router.get('/user-details',UserDetails);

// for logout user
router.get('/logout-user',logout);


// for update user detailed 
router.post('/update-user',updateUser);

// for find user from databasee
router.post('/search-user',searchUser);
export default router;