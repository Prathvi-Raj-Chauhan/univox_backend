const mongoose = require("mongoose")

const {createHmac, randomBytes} = require("node:crypto") // builtin package for hashing of the password

const {createTokenForUser} = require("../JWTservices/auth")
const userSchema = mongoose.Schema({
    
    email : {
        type: String,
        required: true,
        unique: true,
    },
    password : {
        type : String,
        required: true,
    },
    salt : {
        type: String
    },
    college: { 
        type: String,
        default: ''
    },
    branch: {
         type: String ,
         default: ''
        },
    year: {
         type: Number,
         default: 0
        },
    username: {
         type: String,
         default: ''
        },
    otp: {
        type: String,
    },
    otpCreatedAt: {
        type: Date
    },
    profilePictureURL : {
        type: String,
        defualt: ""
    }

},{timestamps: true})

userSchema.pre("save", function (next) { // this will run before saving the user

    const user = this
    if(!user.isModified("password")) return next();// check if user has modiefied the field password

    const salt = randomBytes(16).toString("hex") // a random String of length 16 generate by randomBytes from crypto module

    const hashedPassword = createHmac('sha256', salt).update(user.password).digest("hex") // update the existing user object's password and give in hex form to us

    this.salt = salt;
    this.password = hashedPassword

    next()
})
userSchema.static('matchPasswordAndGenerateToken', async function(email, password){ // a function to decrypt and the verify the password entered by the user
    const user = await this.findOne({email: email})
    if(!user) throw new Error('User Not Found!')

    const salt = user.salt

    const hashedPassword = user.password

    const userProvidedHash = createHmac('sha256', salt)
    .update(password) // hash the password(provided in the function argument) to check if it matches real user password's hash by the users salt
    .digest("hex")
    
    if(userProvidedHash !== hashedPassword){
        throw new Error('Incorrect Password or email')
    }

    // return {...user, password: undefined, salt: undefined} // instead for returning user we will return its token
    
    const token = createTokenForUser(user)
    return token;
})


const User = mongoose.model('users', userSchema)

module.exports = User