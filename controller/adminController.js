const jwt = require('jsonwebtoken')
const User = require('../model/user/user')
const Admin = require('../model/admin/admin')
const Expert = require('../model/expert/expert')

//Admin login
const adminlogin = async (req, res) => {
    console.log("inside admin");
    const AdminDetails = await Admin.findOne({ email: req.body.email })
    if (!AdminDetails) {
        return res.status(404).send({
            message: "Admin not Found"
        })
    }
    if (!(req.body.password == AdminDetails.password)) {
        return res.status(404).send({
            message: "Password is Incorrect"
        })
    }
    const token = jwt.sign({ _id: AdminDetails._id }, process.env._JWT_ADMIN_SECERETKEY, { expiresIn: 3600 })
    console.log(token);
    res.status(200).json({ token })

}

//list users

const listUsers = async (req, res) => {
    try {
        const allUsers = await User.find({})
        console.log(allUsers, "usersss");
        res.status(200).json({ allUsers })
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "error in list users" })
    }
}

//block user

const blockUser = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id })
        if (user.isBlocked == true) {
            await User.updateOne({ _id: req.params.id }, { $set: { isBlocked: false } })
            res.status(200).send({ message: "user unblockeddd" })
        } else {
            await User.updateOne({ _id: req.params.id }, { $set: { isBlocked: true } })
            res.status(200).send({ message: "user blockeddd" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "error in block user" })
    }
}

//unblock users
// const unblockUser = async (req, res) => {
//     try {
//         await User.updateOne({ _id: req.params.id }, { $set: { isBlocked: false } })

//         res.status(200).send({ message: "user unblocked" })
//     } catch (error) {
//         res.status(500).send({ message: "error in unblock user" })
//         console.log(error);
//     }
// }

//listexperts

const listExperts = async (req, res) => {
    try {

        const allExperts = await Expert.find({})

        res.status(200).json({ allExperts })
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "error in experts listing" })
    }
}


const blockExpert = async (req, res) => {
    try {
        const allexperts = await Expert.findOne({ _id: req.params.id })
        if (allexperts.isBlocked == false) {
            console.log("inside false");
            await Expert.updateOne({ _id: req.params.id }, { $set: { isBlocked: true } })
            res.status(200).send({ message: "expert blocked" })
        } else {
            console.log("else block");
            await Expert.updateOne({ _id: req.params.id }, { $set: { isBlocked: false } })
            res.status(200).send({ message: "user un blocked" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Error in expert blocking" })
    }
}



module.exports = {
    adminlogin,
    listUsers,
    blockUser,
    listExperts,
    blockExpert,


}