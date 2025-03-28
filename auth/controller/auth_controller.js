import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import User from "../model/user_scema.js";

export const register = async (req, res) => {
    try {
        const { email, username, mobile, password } = req.body;
if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ error: "Valid email is required" });
}
if (!mobile || !validator.isMobilePhone(mobile, "any") || mobile.length !== 10) {
    return res.status(400).json({ error: "Valid 10-digit mobile number is required" });
}
if (!password || !validator.isLength(password, { min: 6 })) {
    return res.status(400).json({ error: "Password must be at least 6 characters long" });
}

const existingUser = await User.findOne({ email });
if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
}

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            username,
            mobile,
            password: hashedPassword,
        });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

export const signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ error: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: existingUser._id }, "your_secret_key", { expiresIn: "24h" });

        res.status(200).json({ message: "Sign-in successful", email, token });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};
