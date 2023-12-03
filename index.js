const connectDb=require('./db/Connect')
const express=require('express')
var cors = require('cors')
require('dotenv').config();

// connection with mongo
connectDb(process.env.DB_URL)

// app and port
const app=express();
const port= process.env.PORT || 4000;

// Using to resolve cors blocking policy
app.use(cors())
app.use(express.json())

// Middlewares
app.use(express.urlencoded({extended:true}))
app.use(express.json())

// Available Routes
app.use('/api/auth',require("./routes/Auth"))
app.use('/api/notes',require("./routes/Notes"))



app.get('/',(req,res)=>{
    res.send("<h1>Hello World</h1>")
})


// running port
app.listen(port,()=>{
    console.log("iNotebook App is succesfully running on port " + port)
})

