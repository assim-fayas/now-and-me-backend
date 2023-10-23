const express = require('express')
const userRoute = express.Router()

// controller
const userController = require("../controller/userController")
const ProfileController = require("../controller/profileController")
const chatController = require("../controller/chatController")
const slotAndBookingController = require('../controller/slotBooking')


//middleware
const authMiddleware = require("../middlewares/auth")
const expertMiddleware = require("../middlewares/expertAuth")


//user routes

//user login,registrations
userRoute.post('/register', userController.userRegistration)
userRoute.post('/login', userController.userLogin)
userRoute.post('/otp', userController.otp)
userRoute.post('/changePassword', userController.changePassword)
//user mail authentication
userRoute.get('/user/:id/verify/:token', userController.verify)
userRoute.post('/veryfyOtp', userController.veryfyOtp)
userRoute.get('/check', userController.check)
userRoute.get('/listUsers', expertMiddleware, userController.allUsers)

//community
userRoute.post('/thoughts', authMiddleware, userController.postThoughts)
userRoute.get('/listThoughts', authMiddleware, userController.showPosts)
userRoute.post('/addLike/:id', authMiddleware, userController.addLike)
userRoute.get('/commentsAndLikeCount', authMiddleware, userController.getLikesandComments)
userRoute.post('/editPost/:id', authMiddleware, userController.editPost)
userRoute.post('/updatePost/:id', authMiddleware, userController.updatepost)
userRoute.post('/deletePost/:id', authMiddleware, userController.deletePost)
userRoute.post('/flagPost/:id', authMiddleware, userController.flagpost)
userRoute.post('/postComment', authMiddleware, userController.postComment)
userRoute.get('/getComments', authMiddleware, userController.getAllComments)
userRoute.post('/deleteComment/:id', authMiddleware, userController.deleteComment)
userRoute.post('/editComment/:id', authMiddleware, userController.editComment)
userRoute.patch('/updateComment/:id', authMiddleware, userController.updateComment)
userRoute.get('/thoughtSingleUser', authMiddleware, userController.thoughtsOfSingleUser)
userRoute.get('/getFlaggedPosts', userController.flagedPosts)
userRoute.post('/getSingleTHoughts/:id', userController.getSingleTHoughts)


//profile
userRoute.get('/userDetails', authMiddleware, ProfileController.userDetails)
userRoute.put('/updateProfile', authMiddleware, ProfileController.updateProfile)

//chats

userRoute.post('/sendMessage', chatController.sendMessage)
userRoute.get('/showChats/receiverId/:receiver/senderId/:sender', chatController.fetchChats)
userRoute.get('/IsChatActive', authMiddleware, chatController.ActiveChats)
userRoute.get('/previousChats', authMiddleware, chatController.previousChats)


// slots and  appoinment
userRoute.get('/getSlots/:id', slotAndBookingController.getAllSlots)
userRoute.post('/addAppoinment', slotAndBookingController.addAppoinment)
userRoute.get('/appoinmentVideo', authMiddleware, slotAndBookingController.getAppoinments)
userRoute.get('/previousappoinmentVideo', authMiddleware, slotAndBookingController.getpreviousvideoAppoinments)

//actvate join for videocall
userRoute.get('/activateJoinButton', authMiddleware, userController.getAllactivateJoinButton)





module.exports = userRoute
