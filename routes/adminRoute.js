const express = require('express')
const adminRoute = express.Router()



//Controller
const adminController=require("../controller/adminController")

//Admin Login
adminRoute.post('/login',adminController.adminlogin)




















module.exports = adminRoute