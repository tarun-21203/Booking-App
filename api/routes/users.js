import express from "express";
import { deleteUser, getUser, getUsers, updateUser } from "../controllers/user.js";
import { verifyAdmin, verifyToken, verifyUser } from "../utils/verifyToken.js";

const router = express.Router();

// ROUTE : To check whether user is LoggedIn
router.get("/checkauthentication", verifyToken, (req, res, next) => {
    res.send("Hello user, you are LoggedIn!");
})

// ROUTE : To check whether user is trying to update/delete/get his account after checking his authentication.
router.get("/checkuser/:id", verifyUser, (req, res, next) => {
    res.send("Hello user, you are LoggedIn and you can delete your account");
})

// ROUTE : To verify admin after checking his authentication.
router.get("/checkadmin/:id", verifyAdmin, (req, res, next) => {
    res.send("Hello Admin, you are LoggedIn and you can delete all accounts");
})



// ROUTE 1: Update an existing user using PUT "/api/users/:id".
// UPDATE
router.put("/:id", verifyUser, updateUser);


// ROUTE 2: Delete an existing user using DELETE "/api/users/:id"
// DELETE
router.delete("/:id", verifyUser, deleteUser);


// ROUTE 3: Get an existing user using GET "/api/users/:id"
// GET
router.get("/:id", verifyUser, getUser);


// ROUTE 4: Get all existing users using GET "/api/users"
// GET ALL
router.get("/", verifyAdmin, getUsers);

export default router