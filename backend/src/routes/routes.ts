import express from "express";
const router = express.Router();

import {googleLogin,loginUser,registerUser} from "../controller/user_controller"

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);

export default router;