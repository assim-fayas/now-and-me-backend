const Expert = require('../model/expert/expert')
const Token = require('../model/user/token')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const crypto = require('crypto')
const sendEmail = require('../service/sendEmail')
const { log } = require('console')

//expert registration
const expertRegistration = async (req, res) => {
    try {
        console.log("inside expert registration");
        const { name, email, phone, password } = req.body;
        console.log(req.body);
        const check = await Expert.findOne({ email: email })
        if (check) {
            return res.status(400).send({ message: "Email alredy taken" })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const expert = new Expert({
            name: name,
            email: email,
            phone: phone,
            password: hashedPassword
        })
        const saved = await expert.save()
        console.log(saved, " expert saved");
        const token = crypto.randomBytes(32).toString("hex")
        const Ttoken = await new Token({
            userId: saved._id,
            token: token
        }).save();
        await Expert.findOne({ email: email })
        console.log("after saved");
        const url = `${process.env.FRONT_END_URL}experts/expert/${expert._id}/verify/${Ttoken.token}`
        console.log(url, "url");
        sendEmail(expert.email, "NOW AND ME MAIL VERIFICATION", url)
        return res.status(200).send({ message: "An Email has been sent to your account please Verify" })

    } catch (error) {
        res.status(500).send({ message: "Error in expert registration" })
        console.log(error);
    }
}


//expert login
const expertLogin = async (req, res) => {
    try {
        const expert = await Expert.findOne({ email: req.body.email })
        if (!expert) {
            return res.status(404).send({ message: "user not found" })
        }
        const hashedPassword = expert.password
        const password = await bcrypt.compare(req.body.password, hashedPassword)
        if (!password) {
            return res.status(404).send({ message: "password not match" })
        }
        if (expert.isBlocked) {
            return res.status(404).send({ message: "your account is suspended" })
        }
        // if (!expert.isVerified) {
        //     return res.status(404).send({ message: "Your details are being evaluated for verification purposes." })
        // }
        if (!expert.isMailVerified) {
            const token = await Token.findOne({ userId: expert._id })
            if (!token) {
                const tokenGen = crypto.randomBytes(32).toString("hex")
                const Ttoken = await new Token({
                    userId: expert._id,
                    token: tokenGen
                }).save()

                let url = `${process.env.FRONT_END_URL}experts/${expert._id}/verify/${Ttoken.token}`
                console.log("token generated");
                sendEmail(expert.email, "NOW & ME mail verification", url)
            }
            return res.status(400).send({ message: "An Email has been sent to your account please Verify" })
        }

        const { _id } = expert.toJSON()
        const token = jwt.sign({ _id: _id }, process.env._JWT_EXPERT_SECERETKEY, { expiresIn: 3600 })
        res.status(200).json({ token })
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Error in expert login" })
    }
}

//Email verification for expert
const verify = async (req, res) => {
    try {
        console.log("inside expert verification");
        const id = req.params.id
        const token = req.params.token
        const expert = await Expert.findOne({ _id: id })
        console.log("userrr", expert);
        if (!expert) {
            return res.status(400).send({ message: "invalid Link" })
        }
        const findtoken = await Token.findOne({ token: token })
        console.log(findtoken, "tokennn");
        if (!findtoken) {
            return res.status(400).send({ message: "invalid token" })
        }
        const verify = await Expert.updateOne({ _id: id }, { $set: { isMailVerified: true } })
        console.log("user verified");
        if (verify) {
            const deleteToken = await Token.deleteOne({ token: token })
            res.json({ message: "success" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Error occured in email verification" })
    }
}

//expert password otp generating

const otp = async (req, res) => {
    try {
        const { email } = req.body
        const expert = await Expert.findOne({ email: email })
        if (!expert) {
            return res.status(404).send({ message: "user not found" })
        }
        if (expert.isBlocked === true) {
            return res.status(404).send({ messasge: "You'r  Accound is Suspended" })
        }
        let otp = Math.random().toString().substr(-4)
        console.log(otp, "expert");
        sendEmail(expert.email, "NOW & ME PASSWORD RESET", otp)
        const addOtp = await Expert.findOneAndUpdate({}, { $set: { otp: otp } }, { new: true })
        return res.status(200).send({ message: "An otp has been sent to your account please Verify" })
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "error occured in otp" })
    }
}

// otp verifying

const verifyOtp = async (req, res) => {
    try {
        console.log("inside verify otp");
        const { otp } = req.body
        let expertOtp = await Expert.find({ otp: otp })
            .then(expertOtp => {
                if (expertOtp && expertOtp.length > 0) {
                    return res.status(200).send({ message: "otp verified" })
                } else {
                    return res.status(404).send({ message: "Invalid Otp" })
                }
            })
        const deleteOtp = await Expert.findOneAndUpdate({ otp: otp }, { $set: { otp: '' } }, { new: true })
    } catch (error) {
        console.log(error);
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
        const newPass = await Expert.findOneAndUpdate({}, { $set: { password: hashedPassword } })
        console.log("password updated");
        return res.status(200).send({ message: "password updated successfully" })
    } catch (error) {
        res.status(500).send({ message: "Error in change password" })
    }
}




module.exports = {
    expertRegistration,
    expertLogin,
    verify,
    otp,
    verifyOtp,
    changePassword
}