const USER = require('../models/userModel')

const JWT = require("jsonwebtoken")

const SECRET_KEY = "!@#$%^&*()_*&^%$#!@#$%^&*()"

async function handleUserRegistration(req, res){
    const {email, password} = req.body
    await USER.create({
        
        email: email,
        password: password,
    })
    try {
        const token  = await USER.matchPasswordAndGenerateToken(email, password)
        console.log("************registration Successful***********")
        return res.json({
            userToken: token
        })
    } catch (error) {
        return res.status(401).json({
            Error: "Incorrect Email or Password"
        })
    }
    
}

async function handleUserLogin(req, res){
    const{email, password} = req.body
    const user = await USER.findOne({email: email})
    if(!user) return res.json({"Error" : "Not account exists with given email"})
    
    try {
        const token  = await USER.matchPasswordAndGenerateToken(email, password)
        console.log("************Login Successful***********")
        return res.json({
            userToken: token
        })
    } catch (error) {
        return res.status(401).json({
            Error: "Incorrect Email or Password"
        })
    }
}

async function handleAccountSetup(req, res) {
    const { userId, college, branch, year, username } = req.body;

    if (!userId) return res.status(401).json({ error: 'userId missing' });

    try {
        // const decoded = jwt.verify(token, 'SECRET_KEY');
        // const userId = decoded.id;

        const user = await USER.findByIdAndUpdate(
            userId,
            { college, branch, year, username },
            { new: true }
        );

        if (!user) return res.status(404).json({ error: 'User not found' });

        const userToken = JWT.sign(
      {
        _id: user._id,
        email: user.email,
        college: user.college,
        branch: user.branch,
        year: user.year,
        username: user.username,
      },
      SECRET_KEY,
      { expiresIn: '1h' }
    );
        console.log(" ********sucess registation ********")
        return res.json({ status: 'success', userToken });
    } catch (err) {
        console.error(err);
        return res.status(401).json({ error: 'Invalid userId' });
    }
}

async function handleAccountUpdate(req, res) {
    const { userId, college, branch, year, username, email } = req.body;

    if (!userId) return res.status(401).json({ error: 'userId missing' });

    try {
        // const decoded = jwt.verify(token, 'SECRET_KEY');
        // const userId = decoded.id;

        const user = await USER.findByIdAndUpdate(
            userId,
            { college, branch, year, username , email},
            { new: true }
        );

        if (!user) return res.status(404).json({ error: 'User not found' });

        const userToken = JWT.sign(
      {
        _id: user._id,
        email: user.email,
        college: user.college,
        branch: user.branch,
        year: user.year,
        username: user.username,
      },
      SECRET_KEY,
      { expiresIn: '1h' }
    );
        console.log(" ********sucess updation ********")
        return res.json({ status: 'success', userToken });
    } catch (err) {
        console.error(err);
        return res.status(401).json({ error: 'Invalid userId' });
    }
}



module.exports = {
    handleUserRegistration,
    handleUserLogin,
    handleAccountSetup,
    handleAccountUpdate
}