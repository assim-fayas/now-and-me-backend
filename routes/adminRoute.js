const express = require('express')
const adminRoute = express.Router()
//Controller
const adminController = require("../controller/adminController")

//Admin Login
adminRoute.post('/login', adminController.adminlogin)

//user
adminRoute.get('/listUsers', adminController.listUsers)
adminRoute.post('/user/block/:id', adminController.blockUser)
adminRoute.post('/expert/block/:id', adminController.blockExpert)
adminRoute.post('/sendmail/:id/:postId', adminController.sendwarningMail)
adminRoute.post('/blockPost/:id/:postId', adminController.blockPost)

//experts
adminRoute.get('/listExperts', adminController.listExperts)
adminRoute.post('/expert/block/:id', adminController.sendwarningMail)

//profile
adminRoute.get('/adminProfile', adminController.profile)
//dashboard
adminRoute.get('/dashboard', adminController.adminDashboard)
adminRoute.get('/adminPie', adminController.adminPieChartData)
adminRoute.get('/topperformers', adminController.topPerformers)
adminRoute.get('/expertRequest', adminController.unverifiedExpert)




module.exports = adminRoute