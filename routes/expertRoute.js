const express=require('express')
const expertRoute=express.Router()


//expert controller
const expertController=require('../controller/expertController')

//experts routes

expertRoute.post('/register',expertController.expertRegistration)




module.exports=expertRoute