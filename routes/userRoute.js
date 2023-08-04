const express = require('express')
const userRoute = express.Router()

// controller
const userController = require("../controller/userController")


userRoute.post('/register', userController.userRegistration)




userRoute.get('/user/:id/verify/:token',userController.verify)


module.exports = userRoute
