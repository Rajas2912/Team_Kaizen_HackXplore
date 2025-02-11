import jwt from "jsonwebtoken";
import User from "../model/user.model.js";
export  const getUserDetailsFromToken= async(token)=>{
    if(!token)
    {
        return {
            message:"session out ",
            logout:true,
        }
    }

    // we get userid and email from token
    const decode=await jwt.verify(token,process.env.JWT_SECRET_KEY);

    // get user from userid
    const user=await User.findById(decode.id).select("-password");
    return user;
}