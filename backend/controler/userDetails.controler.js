import { getUserDetailsFromToken } from "../helper/getUserDetailsFromToken.js";
//  get deatils of user from token in cookie 
export const UserDetails=async(req,res)=>{
    try {
        const token=req.cookies.token || "";
        const user=await getUserDetailsFromToken(token);
        if(!user)
        { 
            return res.status(500).json({
                message:"Invalid token",
                error:true
            })
        }
        return res.status(200).json({
            message:"user details ",
            data:user,
            success:true
        })
    } catch (error) {
        return res.status(500).json({
            message:error.message|| error,
            error:true 
        });
    }
}