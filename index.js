//NOW & ME

// importing express,mongoose,cors,cookieparser modules
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieparser = require('cookie-parser')
const app = express()
require("dotenv").config()
// cors connection
// app.use(cors, ({
//     credentials: true,
//     origin: ['http://localhost:4200/']
// }))

app.use(cookieparser())
app.use(express.json())

//user route  
const userRoute=require('./routes/userRoute')
app.route('/user',userRoute)

//admin route
const adminRoute=require('./routes/adminRoute')
app.route('/admin',adminRoute)

//expert route
const expertRoute=require('./routes/expertRoute')
app.route('/expert',expertRoute)

//port listning
const port = process.env.PORT||5000

// database connection 
const Ddb_url = process.env.DB_URL
mongoose.connect(Ddb_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to the database");
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
})
    .catch(error => {
        console.error("Error connecting to the database:", error);
    });


  