import express from "express";
import auth from "../component/auth-verify.js";
const authRoute = express.Router();


authRoute.post("/auth", auth.auth_service);

export default authRoute;