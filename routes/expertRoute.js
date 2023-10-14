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

//expertlisting in userside
expertRoute.get('/expertListing', authMiddleware, expertController.expertlisting)
expertRoute.post('/viewExpert/:id', expertController.viewExpert)

//slots
expertRoute.post('/addslote', expertMiddleware, slotAndBookingController.addSlots)

//profile
expertRoute.get('/expertProfile', expertMiddleware, expertController.expertProfile)

module.exports = expertRoute