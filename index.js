require('dotenv').config();

const express = require("express")
const mongoose = require("mongoose")
const path = require("path")
// mongoose.connect('mongodb://127.0.0.1:27017/college-forum')
mongoose.connect(process.env.MONGODB_URI)
.then(() => { console.log("mongodb connected successfully ") })
.catch((e) => { console.log("error in conncecting to mongo db", e) })

const userRoute = require("./routes/userRoute")
const postRoute = require("./routes/postRoute")
const commentRoute = require("./routes/commentRoute")
const app = express()
const PORT = process.env.PORT || 8000;

app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use('/uploads', express.static(path.resolve('./public/uploads')))
app.use('/user', userRoute)
app.use('/post', postRoute)
app.use('/comment', commentRoute)


app.listen(PORT, '0.0.0.0',() => console.log(`Server Started successfully at PORT - ${PORT}`))