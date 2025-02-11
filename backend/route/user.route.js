import express from "express";
const router=express.Router();
import { register } from "../controler/user.registration.js";
import { checkEmail } from "../controler/checkEmail.controler.js";
import {login} from "../controler/login.controler.js";
import {UserDetails} from "../controler/userDetails.controler.js"
import { logout } from "../controler/logout.controler.js";
import { updateUser } from "../controler/updateUser.controler.js";
import { searchUser } from "../controler/searchUser.js";
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