const express = require('express')

const app = express()

const {handleUserRegistration, handleUserLogin, handleAccountSetup, handleAccountUpdate, handleSendingOtp, handleVerifyingOtp} = require('../controllers/userCotrollers')

const ROUTER = express.Router()

ROUTER.post('/register',handleUserRegistration)
ROUTER.post('/login',handleUserLogin)
ROUTER.patch('/setup', handleAccountSetup )
ROUTER.patch('/update',handleAccountUpdate )

ROUTER.post('/register/sendotp', handleSendingOtp)
ROUTER.post('/register/verifyotp', handleVerifyingOtp)


module.exports = ROUTER


