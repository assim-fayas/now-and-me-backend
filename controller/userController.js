const User = require('../model/user')
const Token = require('../model/token')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const sendEmail = require('../service/sendEmail')
const crypto = require('crypto')

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
        const hashedPassword=user.password
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
                sendEmail(user.email, "NOW & ME mail verification", url)
                res.status(200).send({ message: "An Email has been sent to your account please Verify" })
            }
        }
        const { _id } =  user.toJSON();
        const token = jwt.sign({ _id:_id }, process.env._JWT_USER_SECERETKEY)
        console.log(token);
        res.status(200).json({ token })

    } catch (error) {
        res.status(500).send({ message: "Error in user login" })
        console.log(error);
    }
}


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


module.exports = {
    userRegistration,
    verify,
    userLogin
}