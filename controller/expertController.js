const Expert = require('../model/expert/expert')
const Token = require('../model/user/token')
const ActivateJoin = require('../model/user/activateJoin')
const Appointment = require('../model/expert/appoinment')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const crypto = require('crypto')
const sendEmail = require('../service/sendEmail')
const { log } = require('console')

//expert registration
const expertRegistration1 = async (req, res) => {
    try {
        console.log("inside expert registration");
        console.log(req.body);

        console.log(req.body);
        const { name, email, contact, password, profileImage, governmentId, city, dob } = req.body;

        const check = await Expert.findOne({ email: email })
        if (check) {
            return res.status(400).send({ message: "Email alredy taken" })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const expert = new Expert({
            name: name,
            email: email,
            password: hashedPassword,
            contact: contact,
            profileImage: profileImage,
            governmentId: governmentId,
            city: city,
            dob: dob
        })
        const saved = await expert.save()
        console.log(saved, " expert saved");
        const objectId = saved._id
        const expertid = objectId.toHexString();

        if (saved) {
            return res.status(200).json({ expertid })
        } else {
            return res.status(404).send({ message: "Error in expert registration1" })
        }
        // const token = crypto.randomBytes(32).toString("hex")
        // const Ttoken = await new Token({
        //     userId: saved._id,
        //     token: token
        // }).save();
        // await Expert.findOne({ email: email })
        // console.log("after saved");
        // const url = `${process.env.FRONT_END_URL}experts/expert/${expert._id}/verify/${Ttoken.token}`
        // console.log(url, "url");
        // sendEmail(expert.email, "NOW AND ME MAIL VERIFICATION", url)
        // return res.status(200).send({ message: "An Email has been sent to your account please Verify" })

    } catch (error) {
        res.status(500).send({ message: "Error in expert registration1" })
        console.log(error);
    }
}
const expertRegistration2 = async (req, res) => {
    try {
        console.log("inside expert registration2");
        console.log(req.body);
        console.log(req.body.id);
        const expertid = req.body.id
        const verifyExpert = await Expert.findOne({ _id: expertid })
        if (!verifyExpert) {
            return res.status(403).send({ message: "please compleate first stage of registration" })
        }
        const { form2: { educationalQualification, educationalInstitute, specialization, experience, certification } } = req.body;

        const updateExpert = await Expert.updateOne(
            { _id: expertid },
            {
                $set: {
                    educationalQualification: educationalQualification,
                    educationalInstitute: educationalInstitute,
                    specialization: specialization,
                    experience: experience,
                    certification: certification,
                },
            }
        );
        console.log(updateExpert);
        if (updateExpert) {
            return res.status(200).json({ expertid })
        } else {
            return res.status(404).send({ message: "Error in expert registration2" })
        }


    } catch (error) {
        res.status(500).send({ message: "Error in expert registration2" })
        console.log(error);
    }
}

// registration form3

const expertRegistration3 = async (req, res) => {
    try {
        console.log("inside expert registration3");
        console.log(req.body);
        console.log(req.body.id);
        const expertid = req.body.id

        const verifyExpert = await Expert.findOne({ _id: expertid })
        if (!verifyExpert) {
            return res.status(403).send({ message: "please compleate second stage of registration " })
        }
        const { form3: { shortBio, websiteLinks, services, hourlySessionCharge, languages, idealClient } } = req.body;

        const updateExpert = await Expert.updateOne({ _id: expertid }, { $set: { bio: shortBio, websiteLink: websiteLinks, services: services, hourlySessionCharge: hourlySessionCharge, languages: languages, idealClient: idealClient } })

        if (updateExpert) {
            return res.status(200).send({ message: "Expert registration 3 compleated" })
        } else {
            return res.status(404).send({ message: "Error in expert registration2" })
        }


    } catch (error) {
        res.status(500).send({ message: "Error in expert registration2" })
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




const expertlisting = async (req, res) => {
    try {
        const userId = req.headers.userId
        console.log("inside expertlisting");
        const allExperts = await Expert.find({ isVerified: false })
        if (allExperts) {
            res.status(200).json({ allExperts, userId })
        } else {
            res.status(404).send({ message: "Error in Expert Listing" })
        }

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Error in expertListing" })
    }
}



const viewExpert = async (req, res) => {
    try {
        const expertId = req.params.id
        if (!expertId) {
            res.status(403).send({ message: "un autharized access" })
        }
        const expertt = await Expert.findById({ _id: expertId })
        if (!expertt) {
            console.log(expertt)
            res.status(404).send({ message: "Error in expert viewing" })
        } else {

            const activeSessionCount = await Appointment.find({
                expert: expertId,
                bookingType: 'video',
                isConsulted: true
            }).count()


            const addSessionCount = await Expert.updateOne({ _id: expertId }, { $set: { sessionCount: activeSessionCount } })

            if (addSessionCount) {

                const expert = await Expert.findById({ _id: expertId })
                res.status(200).json(expert)
            }
        }
    } catch (error) {
        res.status(500).send({ message: "Error in expert viewing" })
        console.log(error);
    }
}
const expertProfile = async (req, res) => {
    try {
        console.log("inside expert profile");
        const expertId = req.headers.expertId
        console.log("expert idddd", expertId);
        return
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "error in  Expert profile" })

    }
}


const activateJoinButton = async (req, res) => {
    try {
        console.log("inside activateJoinButton");

        const { appoinmentId, slot_date, slot_time, link, user } = req.body
        //check if link is alredy shared

        const check = await ActivateJoin.findOne({ appointment: appoinmentId })
        if (check) {
            return res.status(405).send({ message: "you have already shared the link" })
        } else {


            const details = new ActivateJoin({
                appointment: appoinmentId,
                user: user,
                slot_date: slot_date,
                slot_time: slot_time,
                link: link
            })
            await details.save()

            return res.status(200).send({ message: "Link shared Successfully" })
        }
    } catch (error) {
        console.log(error);
    }
}

const deactivateJoinButton = async (req, res) => {
    try {
        console.log("inside deactivate join button");
        const appoinmentId = req.params.id
        console.log(appoinmentId);
        const check = await ActivateJoin.findOne({ appointment: appoinmentId })
        console.log("checkkkkk", check);
        if (check) {
            const deleteLink = await ActivateJoin.deleteOne({ appointment: appoinmentId })
            if (deleteLink) {
                return res.status(200).send({ message: "Link revoked successfully" })
            } else {
                return res.status(500).send({ message: "error in revoking the link" })
            }

        } else {
            return res.status(404).send({ message: "No Active link found" })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "error in revoking the link" })
    }

}

const expertRating = async (req, res) => {
    try {
        console.log("inside expertlisting");
        const ExpertId = req.params.id;
        const value = req.body.value;
        const expert = await Expert.findOne({ _id: ExpertId });

        if (!expert) {
            return res.status(404).send({ message: "No user found" });
        } else {
            expert.ratingValue.push(value);
            await expert.save(); // Wait for the expert document to be saved

            console.log("after saving");

            const totalCountOfRating = expert.ratingValue.length;
            console.log("totalCountOfRating", totalCountOfRating);

            // Use reduce to calculate the sum of values in the array
            const totalSumOfValues = expert.ratingValue.reduce((accumulator, currentValue) => {
                return accumulator + currentValue;
            }, 0);

            console.log("Sum", totalSumOfValues);

            const rating = Math.round(totalSumOfValues / totalCountOfRating);

            if (!isNaN(rating)) {
                const addRating = await Expert.updateOne({ _id: ExpertId }, { $set: { rating: rating } });

                if (addRating) {
                    return res.status(200).send({ message: "Rating added successfully" });
                } else {
                    return res.status(500).send({ message: "Error in rating adding" });
                }
            } else {
                return res.status(500).send({ message: "Error in calculating the rating" });
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Error in rating adding" });
    }
};




module.exports = {
    expertRegistration1,
    expertRegistration2,
    expertRegistration3,
    expertLogin,
    verify,
    otp,
    verifyOtp,
    changePassword,
    expertlisting,
    viewExpert,
    expertProfile,
    activateJoinButton,
    deactivateJoinButton,
    expertRating

}