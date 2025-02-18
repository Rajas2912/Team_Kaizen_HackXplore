import User from "../../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "required email and password",
        error: true,
      });
    }
    const checkEmail = await User.findOne({email});
    if (!checkEmail) {
      return res.status(404).json({
        message: "No email exist!",
        error: true,
      });
    }

    const verifiedPassword = await bcrypt.compare(password,checkEmail.password);
    if (!verifiedPassword) {
      return res.status(401).json({
        message: "Invalid password",
        error: true,
      });
    }
    // create token using id and email with secrete key 
    const tokenData = {
      id: checkEmail._id,
      email: checkEmail.email,
    };

    // create token =tokendata+secreatekey 
    const token = await jwt.sign(tokenData, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });

    const cookieOption = {
      httpOnly: true,
      secure: true,
    };

    // save it in cookies 
    return res.cookie("token", token, cookieOption).status(200).json({
      message: "Login succesfuly!",
      token:token,
      data:checkEmail,
      success: true,
    });
    
  } catch (error) {
    return res.status(500).json({
        message: "Internal server error",
        error:true,
    })
  }
};
