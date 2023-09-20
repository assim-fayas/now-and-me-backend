const Expert = require('../model/expert/expert')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

//expert registration
const expertRegistration = async (req, res) => {
    try {
        console.log("inside user registration");
        const { name, email, mobile, password}=req.body;
        console.log(req.body);
        const check=await Expert.findOne({email:email})
        if(!check){
           return  res.status(400).send({message:"Email alredy taken"})
        }
        const hashedPassword= await bcrypt.hash(password,10)
        const expert=new Expert({
            name:name,
            email:email,
            mobile:mobile,
            password:hashedPassword
        })
        const saved=await expert.save()
res.status(200).json({"message":" new expert added"})

    } catch (error) {
        res.status(500).send({ message: error })
    }
}


module.exports = {
    expertRegistration
}