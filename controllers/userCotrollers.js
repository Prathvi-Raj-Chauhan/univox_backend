const USER = require('../models/userModel')

const JWT = require("jsonwebtoken")
const {createHmac} = require("node:crypto") // builtin package for hashing of the password
const SECRET_KEY = process.env.JWT_SECRET
const {createTokenForUser} = require("../JWTservices/auth")
const nodemailer = require("nodemailer")

const {v2: cloudinary} = require("cloudinary")

cloudinary.config();

function uploadToCloudinary(fileBuffer, filename) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'univox_users', public_id: filename },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
}

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
    if(!user) return res.status(404).json({"Error" : "No account exists with given email"})
    
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

        let profilePictureURL = '';
        if (req.file) {
            try {
            // Use original filename or generate your own
            const filename = `${Date.now()}-${req.file.filename}`;
            profilePictureURL = await uploadToCloudinary(req.file.buffer, filename);
            } catch (err) {
            return res.status(500).json({ status: "fail", message: "Image upload failed", error: err });
            }
        }

        const user = await USER.findByIdAndUpdate(
            userId,
            { college, branch, year, username, profilePictureURL },
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
        profilePictureURL: profilePictureURL,
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
        let profilePictureURL = req.body.profilePictureURL;
        if (req.file) {
            try {
            // Use original filename or generate your own
            const filename = `${Date.now()}-${req.file.filename}`;
            profilePictureURL = await uploadToCloudinary(req.file.buffer, filename);
            } catch (err) {
            return res.status(500).json({ status: "fail", message: "Image upload failed", error: err });
            }
        }

        const user = await USER.findByIdAndUpdate(
            userId,
            { college, branch, year, username , email, profilePictureURL},
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
        profilePictureURL: profilePictureURL
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

async function handleSendingOtp(req, res){
    const { email } = req.body;

    try {
    const user = await USER.findOne({ email });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated OTP:", otp);
    const salt = user.salt
    const hashedOTP = createHmac('sha256', salt).update(otp).digest("hex")
    user.otp = hashedOTP;
    user.otpCreatedAt = new Date(); // current date
    console.log("Before saving user");
    await user.save();
        console.log("User updated with OTP");
    await sendEmail(email, otp);
console.log("OTP email sent");
    return res.json({ message: 'OTP sent successfully' });
    } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to send OTP' });
    }
}
async function sendEmail(email, otp) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'prcunivox@gmail.com',
      pass: 'udtl yswv qugx dhyc',
    },
  });

  await transporter.sendMail({
    from: 'Univox <prcunivox@gmail.com>',
    to: email,
    subject: 'Your OTP for Univox',
    text: `Your OTP is ${otp}. It is valid for 1 hour.`,
  });
}

async function handleVerifyingOtp(req, res){
    const { email, otp } = req.body;

  try {
    const user = await USER.findOne({ email });

    const salt = user.salt
    const hashedOTP = createHmac('sha256', salt).update(otp).digest("hex")
    
    if (!user || user.otp !== hashedOTP) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if OTP expired (after 1 hour)
    const now = Date.now();
    const otpCreated = new Date(user.otpCreatedAt).getTime();
    const diff = now - otpCreated;

    if (diff > 60 * 60 * 1000) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    // OTP is valid — clear OTP fields
    user.otp = null;
    user.otpCreatedAt = null;
    await user.save();

    // Issue JWT token

    const token = createTokenForUser(user)

    return res.json({"token" : token});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to verify OTP' });
  }
}

module.exports = {
    handleUserRegistration,
    handleUserLogin,
    handleAccountSetup,
    handleAccountUpdate,
    handleSendingOtp,
    handleVerifyingOtp
}