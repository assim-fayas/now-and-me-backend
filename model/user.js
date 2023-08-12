const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
name:{
    type:String,
    required:true
},
password:{
    type:String,
    required:true
},
email:{ 
    type:String,
    required:true,
    unique:true
},
gender:{
    type:String,
    default:null   
},
dob:{
    type:Date,
    default:null
},
bio:{
    type:String,
    default:null
},

location:{
type:String,
default:null
},

isMailVerified:{
    type:Boolean,
    default:false
},
isBlocked:{
type:Boolean,
default:false
},
otp:{
type:Number,
default:false
}
},
{
timestamps:{
    createdAt:'joined',
    updatedAt:'updated'

},
})

module.exports=mongoose.model("User",userSchema)