const express = require('express')

const app = express()

const {handleUserRegistration, handleUserLogin, handleAccountSetup, handleAccountUpdate} = require('../controllers/userCotrollers')

const ROUTER = express.Router()

ROUTER.post('/register',handleUserRegistration)
ROUTER.post('/login',handleUserLogin)
ROUTER.patch('/setup', handleAccountSetup )
ROUTER.patch('/update',handleAccountUpdate )


module.exports = ROUTER


