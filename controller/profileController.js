
const User = require('../model/user/user')


const userDetails = async (req, res) => {
    try {
        console.log("inside userDetails");
        const user = req.headers.userId
        if (!user) {
            return res.status(401).send({ message: "user un authenticated" })
        }
        const userDetails = await User.findOne({ _id: user }).select('name bio location joined image pronouns gender')
        console.log(userDetails);
        if (userDetails) {
            return res.status(200).json({ userDetails })
        } else {
            return res.status(404).send({ message: "error in fetching user details" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "error in fetching user details" })
    }
}

const updateProfile = async (req, res) => {
    try {
        console.log("inside userDetails");

        // let image = req.file.filename
        // console.log("image", image);
        // console.log("image", req.body);


        const user = req.headers.userId
        const { name, gender, bio, location, pronouns, image } = req.body
        if (!user) {
            return res.status(401).send({ message: "user un authenticated" })
        }
        const updateProfile = await User.updateOne({ _id: user }, { $set: { name: name, gender: gender, bio: bio, location: location, image: image, pronouns: pronouns } })
        if (updateProfile) {
            res.status(200).send({ message: "Profile updated successfully" })
        } else {
            res.status(404).send({ message: "Perror in updating userprofile" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "error in updating userprofile" })

    }
}


module.exports = {
    userDetails,
    updateProfile
}