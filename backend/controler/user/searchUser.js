import User from "../../model/user.model.js";
export const searchUser=async(req,res)=>{
    try {
        const {search}=req.body
        const query=new RegExp(search,"i");
        const user=await User.find({
            "$or":[
                {name:query},
                {email:query},
            ]
        }).select("-password");
        return res.status(200).json({
            message:"all User",
            data:user,
            success:true
        })
    } catch (error) {
        return res.status(500).json({
            message:"Internal server error",
            error:true,
        })
    }
}