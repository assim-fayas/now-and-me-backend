const express=require('express')
const expertRoute=express.Router()


//expert controller
const expertController=require('../controller/expertController')


//experts routes

//expert login,registration
expertRoute.post('/register1',expertController.expertRegistration1)
expertRoute.post('/register2',expertController.expertRegistration2)
expertRoute.post('/register3',expertController.expertRegistration3)
expertRoute.post('/login',expertController.expertLogin)
expertRoute.post('/otp',expertController.otp)
expertRoute.post('/changePassword',expertController.changePassword)
//user mail authentication
expertRoute.get('/expert/:id/verify/:token',expertController.verify)
expertRoute.post('/verifyOtp',expertController.verifyOtp)




module.exports=expertRoute