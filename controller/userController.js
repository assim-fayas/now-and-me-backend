const User = require('../model/user/user')
const Token = require('../model/user/token')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const sendEmail = require('../service/sendEmail')
const crypto = require('crypto')
const { log } = require('console')
require('dotenv').config()
//User Registration
const userRegistration = async (req, res, next) => {
    try {
        console.log("inside registration");
        const { name, email, password } = req.body;
        console.log(req.body);
        const check = await User.findOne({ email: email })
        if (check) {
            return res.status(400).send({message: "Email alredy exist"})
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
        return res.status(201).send({ message: "An Email has been sent to your account please Verify" })
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error })
    }
}
//user login
const userLogin = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email })
        console.log("inside user");
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
            console.log("inside email ilaaaa");
            const token = await Token.findOne({ userId: user._id })
            if (!token) {
                console.log("inside token ilaaaa");
                const tokenGen = crypto.randomBytes(32).toString("hex")
                const Ttoken = await new Token({
                    userId: user._id,
                    token: tokenGen
                }).save()
                let url = `${process.env.FRONT_END_URL}user/${user._id}/verify/${Ttoken.token}`
                console.log("url", url);
                sendEmail(user.email, "NOW & ME mail verification", url)

            }
            return res.status(400).send({ message: "An Email has been sent to your account please Verify" })

        }
        const { _id } = user.toJSON();
        const token = jwt.sign({ _id: _id }, process.env._JWT_USER_SECERETKEY, { expiresIn: 3600 })
        console.log("usertoken",token);
        res.status(200).json({
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

        const id = req.params.id
        const token = req.params.token
        const user = await User.findOne({ _id: id })
        console.log("userrr", user);
        if (!user) {
            return res.status(400).send({ message: "invalid Link" })
        }
        const findtoken = await Token.findOne({ token: token })
        console.log(findtoken, "tokennn");
        if (!findtoken) {
            return res.status(400).send({ message: "invalid token" })
        }
        const verify = await User.updateOne({ _id: id }, { $set: { isMailVerified:true } })
        console.log(verify, "user verified");
        console.log("updated user", user);
        if (verify) {
            const deleteToken = await Token.deleteOne({ token: token })
            console.log("token deleted");
            res.json({ message: "success" })

        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Verification failed' })
    }
}


//user password   otp generating
const otp = async (req, res) => {
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
            return res.status(404).send({
                messasge: "You'r  Accound is Suspended"
            })
        }
        let otp = Math.random().toString().substr(-4)
        console.log("otp", otp);
        sendEmail(user.email, "NOW & ME mail password reset", otp)
        const addOtpToDb = await
            User.findOneAndUpdate(
                {}, { $set: { otp: otp } }, { new: true })
        return res.status(200).send({ message: "An otp has been sent to your account please Verify" })
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Verification failed' })
    }
}


// otp verifying

const veryfyOtp = async (req, res) => {
    try {
        console.log("inside verify otp");
        const { otp } = req.body
        let userOtp = await User.find({ otp: otp })
            .then(userOtp => {
                if (userOtp && userOtp.length > 0) {
                    return res.status(200).send({ message: "user verified dddd" })
                } else {
                    return res.status(404).send({ message: "Invalid Otp" })
                }
            })
        const deleteOtp = await User.findOneAndUpdate({ otp: otp }, { $set: { otp: '' } }, { new: true })
    }
    catch (error) {
        res.status(500).send({ message: "verification failed" })
    }

}

//reset password

const changePassword = async (req, res) => {
    try {
        console.log("inside change password");
        const { password } = req.body
        console.log(password, "backed ethiya password");
        const hashedPassword = await bcrypt.hash(password, 10)
        console.log(hashedPassword, "hashed passworddddd");
        const newPass = await User.findOneAndUpdate({}, { $set: { password: hashedPassword } })
        console.log("password updated");
        return res.status(200).send({ message: "password updated successfully" })
    } catch (error) {
        res.status(500).send({ message: "verification failed" })
    }
}

module.exports = {
    userRegistration,
    verify,
    userLogin,
    otp,
    veryfyOtp,
    changePassword
}