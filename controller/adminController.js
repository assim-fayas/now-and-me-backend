const jwt = require('jsonwebtoken')
const User = require('../model/user/user')
const Admin = require('../model/admin/admin')
const Expert = require('../model/expert/expert')
const Appointment = require('../model/expert/appoinment')
const Post = require('../model/user/post')
const sendEmail = require('../service/sendEmail')


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

            sendEmail(user.email, "Account Retained",
                `dear user,
   We are happy announce that you're account is retained`)
            res.status(200).send({ message: "user unblockeddd" })
        } else {
            await User.updateOne({ _id: req.params.id }, { $set: { isBlocked: true } })
            sendEmail(user.email, "Account Suspended",
                `dear user,
        It is noticed that,you act against our community guidlines`)
            res.status(200).send({ message: "user blockeddd" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "error in block user" })
    }
}


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
            sendEmail(allexperts.email, "Account Suspended",
                `dear user,
    It is noticed that,you act against our community guidlines`)

            res.status(200).send({ message: "expert blocked" })
        } else {
            console.log("else block");
            await Expert.updateOne({ _id: req.params.id }, { $set: { isBlocked: false } })
            sendEmail(allexperts.email, "Account Retained",
                `dear user,
We are happy announce that you're account is retained`)
            res.status(200).send({ message: "expert un blocked" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Error in expert blocking" })
    }
}

const profile = async (req, res) => {
    try {
        console.log("inside admin profile");
        const admin = await Admin.findOne({})
        console.log(admin);

        if (admin) {
            return res.status(200).json({ id: admin._id, name: admin.name, email: admin.email })
        } else {
            return res.status(500).send({ message: "Error in admin profile" })
        }


    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Error in  admin Profile" })
    }
}

//editprofile



//admin dashboard
const adminDashboard = async (req, res) => {
    try {
        console.log("inside admin dashboard");
        // total user count
        const userCount = await User.find({}).count()
        //total expert count
        const ExpertCount = await Expert.find({ isVerified: true }).count()

        console.log(ExpertCount, "expert");

        //total video chat revenue
        const VideoRevenue = [
            {
                $match: {
                    bookingType: 'video',
                    status: 'consulted',
                    AppoinmentStatus: 'expired',
                },
            },
            {
                $group: {
                    _id: null,
                    totalConsultingFee: {
                        $sum: '$consultingFee',
                    },
                },
            },
        ];

        const totalVideoRevenue = await Appointment.aggregate(VideoRevenue);

        const videorevenue = totalVideoRevenue[0].totalConsultingFee
        console.log(videorevenue);

        // total chat revenue
        const chatRevenue = [
            {
                $match: {
                    bookingType: 'chat',
                    status: 'consulted',
                    AppoinmentStatus: 'expired',
                },
            },
            {
                $group: {
                    _id: null,
                    totalConsultingFee: {
                        $sum: '$consultingFee',
                    },
                },
            },
        ];

        const TotalchatRevenue = await Appointment.aggregate(chatRevenue);

        const chatrevenue = TotalchatRevenue[0].totalConsultingFee;
        console.log(chatrevenue);
        // total admin revenue
        const totalAdminRevenue = (await chatrevenue + await videorevenue) * 0.3
        console.log(totalAdminRevenue);

        // chat count
        const countOfChat = await Appointment.find({ $and: [{ bookingType: 'chat', status: 'consulted' }] }).count();
        console.log(countOfChat);
        //video chat count
        const countOfVideoChat = await Appointment.find({ $and: [{ bookingType: 'video', status: 'consulted' }] }).count();
        console.log(countOfVideoChat);
        //active appoinments
        const activeAppoinment = await Appointment.find({ $and: [{ AppoinmentStatus: "active" }] }).count()
        return res.status(200).json({ chat: countOfChat, video: countOfVideoChat, AdminRevenue: totalAdminRevenue, expertCount: ExpertCount, userCount: userCount, activeappoinment: activeAppoinment })
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "error in admin dashboard" })
    }
}


const adminPieChartData = async (req, res) => {
    try {
        console.log("inside admin piechart");
        // chat count
        const countOfChat = await Appointment.find({ $and: [{ bookingType: 'chat', status: 'consulted' }] }).count();
        console.log(countOfChat);
        //video chat count
        const countOfVideoChat = await Appointment.find({ $and: [{ bookingType: 'video', status: 'consulted' }] }).count();
        console.log(countOfVideoChat);
        return res.status(200).send([{ chat: countOfChat }, { video: countOfVideoChat }])
    } catch (error) {
        console.log(error);
    }
}

const topPerformers = async (req, res) => {
    try {
        // Calculate total earnings by expert
        // const earningsByExpert = await Appointment.aggregate([
        //     {
        //         $group: {
        //             _id: '$expert',
        //             totalEarnings: { $sum: '$consultingFee' }
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: 'experts', // The name of the collection where 'Expert' documents are stored
        //             localField: '_id',
        //             foreignField: '_id',
        //             as: 'expertInfo'
        //         }
        //     },
        //     {
        //         $project: {
        //             expertName: { $arrayElemAt: ['$expertInfo.name', 0] }, // Replace 'name' with the actual field name in your 'Expert' model
        //             totalEarnings: 1
        //         }
        //     },
        //     {
        //         $sort: { totalEarnings: -1 } // Sort by descending totalEarnings
        //     }
        // ]).exec();

        // Calculate total earnings by expert and booking type
        const earningsByExpertAndBookingType = await Appointment.aggregate([
            {
                $group: {
                    _id: {
                        expert: '$expert',
                        bookingType: '$bookingType'
                    },
                    totalEarnings: { $sum: '$consultingFee' }
                }
            },
            {
                $lookup: {
                    from: 'experts', // The name of the collection where 'Expert' documents are stored
                    localField: '_id.expert',
                    foreignField: '_id',
                    as: 'expertInfo'
                }
            },
            {
                $project: {
                    expertName: { $arrayElemAt: ['$expertInfo.name', 0] }, // Replace 'name' with the actual field name in your 'Expert' model
                    bookingType: '$_id.bookingType',
                    totalEarnings: 1
                }
            },
            {
                $sort: { totalEarnings: -1 } // Sort by descending totalEarnings
            },
            {
                $group: {
                    _id: '$_id.expert',
                    expertName: { $first: '$expertName' },
                    earningsByBookingType: {
                        $push: {
                            bookingType: '$bookingType',
                            totalEarnings: '$totalEarnings'
                        }
                    },
                    totalEarnings: { $sum: '$totalEarnings' } // Calculate the total sum of earnings
                }
            },
            {
                $sort: { totalEarnings: -1 } // Sort by ascending totalEarnings
            },
            {
                $limit: 3 // Limit the results to three documents
            }
        ]).exec();


        return res.status(200).json({ earningsByExpertAndBookingType });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while fetching top performers.' });
    }
}



const unverifiedExpert = async (req, res) => {
    try {
        console.log(" inside unverified expert");
        const unverifiedExperts = await Expert.aggregate([
            {
                $match: { isVerified: false }
            },
            {
                $project: {
                    name: 1,
                    experience: 1,
                    specialization: { $arrayElemAt: ['$specialization', 0] },
                    joined: 1
                }
            }
        ]);
        console.log(unverifiedExperts);
        return res.status(200).json({ unverifiedExperts });


    } catch (error) {
        console.log(error);
    }
}


const sendwarningMail = async (req, res) => {
    try {
        console.log("inside warning mail");
        const userId = req.params.id
        const postId = req.params.postId

        const user = await User.findOne({ _id: userId })
        const post = await Post.findOne({ _id: postId })

        if (post) {
            const userEmail = user.email
            const userPost = post.content
            sendEmail(userEmail, "NOW&ME WARNING EMAIL",

                `dear user,

              ${userPost}  
   
              your post is against our community guideline.
              we are kindly requesting you to review post`)

            return res.status(200).send({ message: "Email send successfully" })

        }


    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Error in Email Sending " })
    }
}

const blockPost = async (req, res) => {
    try {
        console.log("inside blockpost");

        const postId = req.params.postId
        const userId = req.params.id
        const user = await User.findOne({ _id: userId })
        const post = await Post.findOne({ _id: postId })

        if (post.block == true) {
            const blockPost = await Post.updateOne({ _id: postId }, { $set: { block: false } })
            if (blockPost) {
                return res.status(200).send({ message: "Post Un Blocked " })
            }


        }
        const blockPost = await Post.updateOne({ _id: postId }, { $set: { block: true } })

        if (blockPost) {
            console.log("blockkk", blockPost);

            sendEmail(user.email, "your post Is blocked",

                `dear user,

          ${post.content}  

          your post is against our community guideline.
          
      `)

            return res.status(200).send({ message: "Post Blocked and Email send successfully" })
        }
    } catch (error) {

        console.log(error);
    }
}

module.exports = {
    adminlogin,
    listUsers,
    blockUser,
    listExperts,
    blockExpert,
    profile,
    adminDashboard,
    adminPieChartData,
    topPerformers,
    unverifiedExpert,
    sendwarningMail,
    blockPost


}