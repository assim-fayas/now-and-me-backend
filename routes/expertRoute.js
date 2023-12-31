const express = require('express')
const expertRoute = express.Router()


//expert controller
const expertController = require('../controller/expertController')
const slotAndBookingController = require('../controller/slotBooking')

// middlewares
const authMiddleware = require("../middlewares/auth")
const expertMiddleware = require("../middlewares/expertAuth")


//experts routes

//expert login,registration
expertRoute.post('/register1', expertController.expertRegistration1)
expertRoute.post('/register2', expertController.expertRegistration2)
expertRoute.post('/register3', expertController.expertRegistration3)
expertRoute.post('/login', expertController.expertLogin)
expertRoute.post('/otp', expertController.otp)
expertRoute.post('/changePassword', expertController.changePassword)
//user mail authentication
expertRoute.get('/expert/:id/verify/:token', expertController.verify)
expertRoute.post('/verifyOtp', expertController.verifyOtp)
expertRoute.post('/verifyExpert/:id', expertController.ExpertVerification)

//expertlisting in userside
expertRoute.get('/expertListing', authMiddleware, expertController.expertlisting)
expertRoute.post('/viewExpert/:id', expertController.viewExpert)
expertRoute.post('/filterExpert/:name', expertController.expertFiltering)

//slots and appoinments
expertRoute.post('/addslote', expertMiddleware, slotAndBookingController.addSlots)
expertRoute.get('/appoinmentVideo', expertMiddleware, slotAndBookingController.getAppoinments)
expertRoute.get('/previousappoinmentVideo', expertMiddleware, slotAndBookingController.getpreviousvideoAppoinments)
expertRoute.post('/changeAppoinmentStatus/:id', slotAndBookingController.changeAppoinmentStatus)


//profile
expertRoute.get('/expertProfile', expertMiddleware, expertController.expertProfile)
expertRoute.post('/updateExpertProfile/:id', expertMiddleware, expertController.updateExpertProfile)

//activate and deactivate user joinvideo
expertRoute.post('/activateJoinButton', expertMiddleware, expertController.activateJoinButton)
expertRoute.delete('/DeActivateJoinButton/:id', expertMiddleware, expertController.deactivateJoinButton)

// rating
expertRoute.post('/addrating/:id', expertController.expertRating)

//dashboard
expertRoute.get('/dashboard', expertMiddleware, expertController.expertDashboard)


module.exports = expertRoute