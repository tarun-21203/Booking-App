import User from "../models/User.js";


// ROUTE 1: Update an existing user using PUT "/api/users/:id".
// UPDATE
export const updateUser = async (req, res, next)=> {
    try {
        const updateUser = await User.findByIdAndUpdate(req.params.id, { $set: req.body}, { new: true})
        res.status(200).json(updateUser);
    } catch (error) {
        next(error);
    }
}

// ROUTE 2: Delete an existing user using DELETE "/api/users/:id"
// DELETE
export const deleteUser = async (req, res, next)=> {
    try {
        await User.findByIdAndDelete(req.params.id)
        res.status(200).json("User has been deleted.");
    } catch (error) {
        next(error);
    }
}

// ROUTE 3: Get an existing user using GET "/api/users/:id"
// GET
export const getUser = async (req, res, next)=> {
    try {
        const user = await User.findById(req.params.id)
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
}

// ROUTE 4: Get all existing users using GET "/api/users"
// GET ALL
export const getUsers = async (req, res, next)=> {
    try {
        const users = await User.find()
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
}