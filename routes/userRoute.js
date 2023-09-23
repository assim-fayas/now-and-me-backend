const express = require('express')
const userRoute = express.Router()

// controller
const userController = require("../controller/userController")
const ProfileController=require("../controller/profileController")
const authMiddleware = require("../middlewares/auth")
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
userRoute.get('/thoughtSingleUser',authMiddleware,userController.thoughtsOfSingleUser)

//profile
userRoute.get('/userDetails',authMiddleware,ProfileController.userDetails)
userRoute.put('/updateProfile',authMiddleware,ProfileController.updateProfile)













module.exports = userRoute
