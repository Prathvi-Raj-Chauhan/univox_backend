const express = require('express')

const app = express()

const {handleUserRegistration, handleUserLogin, handleAccountSetup, handleAccountUpdate, handleSendingOtp, handleVerifyingOtp} = require('../controllers/userCotrollers')

const ROUTER = express.Router()

const storage = multer.memoryStorage() // now we will not write in disk but store in memory only until upload
const upload = multer({ storage: storage })

ROUTER.post('/register',handleUserRegistration)
ROUTER.post('/login',handleUserLogin)
ROUTER.patch('/setup', upload.single("profilePicture"), handleAccountSetup )
ROUTER.patch('/update', upload.single("profilePicture"), handleAccountUpdate )

ROUTER.post('/register/sendotp', handleSendingOtp)
ROUTER.post('/register/verifyotp', handleVerifyingOtp)


module.exports = ROUTER


