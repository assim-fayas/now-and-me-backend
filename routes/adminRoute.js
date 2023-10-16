const express = require('express')
const adminRoute = express.Router()



//Controller
const adminController = require("../controller/adminController")

//Admin Login
adminRoute.post('/login', adminController.adminlogin)

//user
adminRoute.get('/listUsers', adminController.listUsers)
adminRoute.post('/user/block/:id', adminController.blockUser)


//experts
adminRoute.get('/listExperts', adminController.listExperts)
adminRoute.post('/expert/block/:id', adminController.blockExpert)

//profile
adminRoute.get('/adminProfile', adminController.profile)


//dashboard
adminRoute.get('/dashboard', adminController.adminDashboard)
adminRoute.get('/adminPie', adminController.adminPieChartData)




















module.exports = adminRoute