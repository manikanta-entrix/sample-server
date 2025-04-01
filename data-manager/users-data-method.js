import bcrypt from "bcrypt";
import User from "../data-manager/schema/user_scema.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

export const getUser = async query => {
  let errCode = "user.get_user";
  try {
    let userInfo = await User.find(query);
    if (userInfo && userInfo.length) {
      return { status: true, statusCode: 200, result: userInfo };
    } else {
      return { status: false, statusCode: 404, errCode: errCode + ":user-not-found" };
    }
  } catch (e) {
    return { status: false, statusCode: 500, errCode: errCode + ":exception-failure" };
  }
};

export const validateLogin = async (u) => {
  let errCode = "user.validate_login"; // Adjust the error code to reflect the operation being performed
  console.log("validateLogin", u);

  try {
    let query = {};
    
    // If the typeOfLogin is "1", look for user by email
      query = { "email": { $regex: new RegExp('^' + u.email + '$', 'i') } };
    // Find the user based on the query (email or another identifier)
    let userInfo = await User.findOne(query).lean();
    console.log("userInfo", userInfo);

    if (userInfo) {
      // Validate password asynchronously (use bcrypt.compare for non-blocking calls)
      const isValidPwd = await bcrypt.compare(u.password, userInfo.password);
      if (!isValidPwd) {
        return { 
          status: false, 
          statusCode: 400, 
          errCode: errCode + ":invalid-password" 
        };
      }

      // Generate JWT token with a 24-hour expiration
      const token = jwt.sign(
        { email: userInfo.email }, 
        process.env.JWT_SECRET, 
        { expiresIn: '24h' } 
      );

      return { 
        status: true, 
        statusCode: 200, 
        result: { email:userInfo.email,  mobile: userInfo.mobile, token } 
      };
    } else {
      return { 
        status: false, 
        statusCode: 404, 
        errCode: errCode + ":user-not-found" 
      };
    }
  } catch (e) {
    console.log(e);
    return { 
      status: false, 
      statusCode: 500, 
      errCode: errCode + ":exception-failure" 
    };
  }
};

  

export const setUser = async query => {
    let errCode = "user.set_user";
    let { email } = query;
    try {
      let updatedUser;
      let userQuery = { email: { $regex: new RegExp('^' + email + '$', 'i') } };
  
      let user = await User.findOne(userQuery);
      if (user) {
        // If user exists, return an error (user already exists)
        return {
          status: false,
          statusCode: 400,
          errCode: errCode + ":user-already-exists"
        };
      } else {
        // If no user exists, proceed to create a new user
  
        // Hash the password before saving it
        if (query.password) {
          let hashPwd = bcrypt.hashSync(query.password, 10);
          query.password = hashPwd // Store the hashed password
        }
  console.log("query", query)
        // Create a new user
        let newUser = new User(query);
        updatedUser = await newUser.save();
  
        // If user is successfully created
        if (updatedUser) {
          return { status: true, statusCode: 200, result: updatedUser };
        } else {
          // If user creation fails, return an error
          return {
            status: false,
            statusCode: 404,
            errCode: 'user.set_user:could-not-create'
          };
        }
      }
    } catch (e) {
      return { status: false, statusCode: 500, errCode: errCode + ":exception-failure" };
    }
  };
  
  
  
  
