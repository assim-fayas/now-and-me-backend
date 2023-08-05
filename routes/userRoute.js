const express = require('express')
const userRoute = express.Router()

// controller
const userController = require("../controller/userController")

//user routes

//user login,registrations
userRoute.post('/register', userController.userRegistration)
userRoute.post('/login',userController.userLogin)


//user mail authentication
userRoute.get('/user/:id/verify/:token',userController.verify)


module.exports = userRoute
