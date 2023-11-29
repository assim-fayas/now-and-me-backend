//NOW & ME

// importing express,mongoose,cors,cookieparser modules
const express = require('express')
const cors = require('cors')
const cookieparser = require('cookie-parser')
const app = express()
const expertRoute = require('./routes/expertRoute')
const adminRoute = require('./routes/adminRoute')
const userRoute = require('./routes/userRoute')
const http = require('http').createServer(app); // Create HTTP server
const dbconnect = require("./config/connection");
const intializeSocket = require('./socket.io/socket')
require("dotenv").config()
dbconnect.dbconnect();
// cors connection
// cors connection
app.use(cors({
    credentials: true,
    origin: ['http://localhost:4200', 'https://nowandme.netlify.app']
}))

app.use(cookieparser())
app.use(express.json())


//user route  

app.use('', userRoute)

//admin route

app.use('/admin', adminRoute)

//expert route

app.use('/experts', expertRoute)



// database connection 
// const Ddb_url = process.env.DB_URL;


// Start the server
const server = http.listen(process.env.PORT, () => {
    console.log("Server started listening to port");
});

intializeSocket(server)

