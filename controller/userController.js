const User = require('../model/user')
const Token = require('../model/token')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const sendEmail = require('../service/sendEmail')
const crypto = require('crypto')

require('dotenv').config()

//User Registration

const userRegistration = async (req, res,next) => {
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
        await User.findOne({ email:email})
        const url = `${process.env.FRONT_END_URL}user/${added._id}/verify/${Ttoken.token}`
        sendEmail(user.email, "e-mail verification", url)
        res.status(201).send({ message: "An Email has been sent to your account please Verify" })
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error.message })
    }
}

const verify=async(req,res)=>{
    try {
        console.log("inside verify route"); 
        const user=await User.findOne({_id:req.params.id})
        if(!user){
           return res.status(400).send({message:"invalid Link"})
        }
        const token=await Token.findOne({token:req.params.token})
        if(!token){
            return res.status(400).send({message:"invalid Link"})
        }
        const verify= await User.updateOne({_id:req.params.id},{set:{isMailVerified:true}})
        if(verify){
             const deleteToken=await Token.deleteOne({token:req.params.token})
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({message:'Verification failed'})
    }
}

module.exports = {
    userRegistration,
    verify
}