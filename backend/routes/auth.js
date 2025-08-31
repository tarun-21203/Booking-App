import express from "express";
import { login, register } from "../controllers/auth.js";

const router = express.Router();


// ROUTE 1: Create new user using POST "/api/auth/register"
// CREATE
router.post("/register", register)


// ROUTE 2: User login using POST "/api/auth/login"
// LOGIN
router.post("/login", login)


export default router