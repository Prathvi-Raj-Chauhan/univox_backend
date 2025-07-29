const JWT = require("jsonwebtoken")

const secretKey = "!@#$%^&*()_*&^%$#!@#$%^&*()"

function createTokenForUser(user){
    const payload = {
        email: user.email,
        profilePicURL: user.profilePicURL,
        college: user.college,
        branch: user.branch,
        year: user.year,
        username: user.username,
        _id: user._id,
        verified: user.verified
    }
    const token = JWT.sign(payload, secretKey, {
        expiresIn: "10d" // expires in 1 hour
    })
    return token
}


function validateTokenAndReturnUserObject(token){
    const payload = JWT.verify(token, secretKey)
    return payload
}

module.exports = {
    createTokenForUser,
    validateTokenAndReturnUserObject
}