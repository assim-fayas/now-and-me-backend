const User = require('../model/user')
const Token = require('../model/token')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const sendEmail = require('../service/sendEmail')
const crypto = require('crypto')
const { log } = require('console')
require('dotenv').config()
//User Registration
const userRegistration = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        console.log(req.body);
        const check = await User.findOne({ email: email })
        if (check) {
            res.status(400).send({
                message: "Email alredy exist"
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new User({
            name: name,
            email: email,
            password: hashedPassword
        })
        const added = await user.save()
        const token = crypto.randomBytes(32).toString("hex")
        const Ttoken = await new Token({
            userId: added._id,
            token: token
        }).save();
        await User.findOne({ email: email })
        const url = `${process.env.FRONT_END_URL}user/${added._id}/verify/${Ttoken.token}`
        sendEmail(user.email, " NOW AND ME mail verification", url)
        res.status(201).send({ message: "An Email has been sent to your account please Verify" })
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error })
    }
}
//user login
const userLogin = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email })
        if (!user) {
            return res.status(404).send({ message: "user not found" })
        }
        const hashedPassword = user.password
        const password = await bcrypt.compare(req.body.password, hashedPassword)
        if (!password) {
            return res.status(404).send({ message: "password not match" })
        }
        if (user.isBlocked) {
            return res.status(404).send({ message: "your account is suspended" })
        }
        if (!user.isMailVerified) {
            const token = await Token.findOne({ userId: user._id })
            if (!token) {
                const tokenGen = crypto.randomBytes(32).toString("hex")
                const Ttoken = await new Token({
                    userId: user._id,
                    token: tokenGen
                }).save()
                let url = `${process.env.FRONT_END_URL}user/${user._id}/verify/${Ttoken.token}`
                console.log("url", url);
                sendEmail(user.email, "NOW & ME mail verification", url)
                return res.status(200).send({ message: "An Email has been sent to your account please Verify" })
            }
        }
        const { _id } = user.toJSON();
        const token = jwt.sign({ _id: _id }, process.env._JWT_USER_SECERETKEY, { expiresIn: 3600 })
        console.log(token);
        res.json({
            token
        })

    } catch (error) {
        res.status(500).send({ message: "Error in user login" })
        console.log(error);
    }
}
//Email verification for user
const verify = async (req, res) => {
    try {
        console.log("inside verify route");
        const user = await User.findOne({ _id: req.params.id })
        if (!user) {
            return res.status(400).send({ message: "invalid Link" })
        }
        const token = await Token.findOne({ token: req.params.token })
        if (!token) {
            return res.status(400).send({ message: "invalid Link" })
        }
        const verify = await User.updateOne({ _id: req.params.id }, { set: { isMailVerified: true } })
        if (verify) {
            const deleteToken = await Token.deleteOne({ token: req.params.token })
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Verification failed' })
    }
}


//user change Password
const changePassword = async (req, res) => {
    try {
        console.log("inside the change password");
        const { email } = req.body
        const user = await User.findOne({ email: email })
        if (!user) {
            return res.status(404).send({
                message: "User not found"
            })
        }
        if (user.isBlocked === true) {
            res.status(404).send({
                messasge: "You'r  Accound is Suspended"
            })
        }
        let otp = Math.random().toString().substr(-4)
        console.log(otp);
        sendEmail(user.email, "NOW & ME mail password reset", otp)
        return res.status(200).send({ message: "An otp has been sent to your account please Verify" })

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Verification failed' })
    }
}

const veryfyOtp = async (req, res) => {
    const { otp } = req.body
    let userOtp = User.find({ otp: otp })
    if (!userOtp) {
        res.status(404).send({ message: "Invalid Otp" })
    }
}

module.exports = {
    userRegistration,
    verify,
    userLogin,
    changePassword,
    veryfyOtp
}