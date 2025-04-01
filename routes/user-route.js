import express from "express";
import authenticator from "../component/auth-middleware.js";
import userModule from "../component/user.js";
const usersRouter = express.Router();


usersRouter.post("/user", authenticator, userModule.users_service);

export default usersRouter;