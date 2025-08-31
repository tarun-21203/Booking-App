import { createError } from "../utils/error.js"
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


// ROUTE 1: Create new user using POST "/api/auth/register"
// CREATE
export const register = async (req, res, next)=> {
    try {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hash
        });
        await newUser.save();
        res.status(200).send(newUser);
    } catch (error) {
        next(error);
    }
}


// ROUTE 2: User login using POST "/api/auth/login"
// LOGIN
export const login = async (req, res, next)=> {
    try {

        // To check if user exist
        const user = await User.findOne({ username: req.body.username })
        if (!user) {
            return next(createError(404, "User not found!"));
        }

        // To check if password is correct
        const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordCorrect) {
            return next(createError(400, "Wrong username or password!"));
        }

        const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT);

        const { password, isAdmin, ...otherDetails } = user._doc;
        res.cookie("access_token", token, { httpOnly: true }).status(200).send({ details:{...otherDetails}, isAdmin});
    } catch (error) {
        next(error);
    }
}