import { getUserDetailsFromToken } from "../../helper/getUserDetailsFromToken.js";
import User from "../../model/user.model.js";

export const updateUser = async (req, res) => {
  try {
    const token = req.cookies.token || "";
    const user =await  getUserDetailsFromToken(token);

    if (!user || !user._id ) {
      return res.status(401).json({
        message: "Invalid or missing token",
        error: true,
      });
    }

    const { name, email, profile_pic } = req.body;
    const updateUser = await User.updateOne(
      { _id: user._id },
      {
        name,
        email,
        profile_pic,
      }
    );
    const userInfo = await User.findById(user._id).select("-password");
    return res.json({
        message: "User details updated successfully",
        data: userInfo,
        success: true,
      });
  } catch (error) {
    return res.status(500).json({
      message: "failed to update user detailed ",
      error: true,
    });
  }
};
