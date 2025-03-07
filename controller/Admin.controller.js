const sendemail = require("../config/mail")
const admin = require("../model/admin.model")
const otpGenerator = require('otp-generator')
const { plainToHash, HashToPlain } = require("../utils/password")
const { ForgotMail } = require("../utils/ForgotMailer")
const jwt = require('jsonwebtoken')

exports.register = async (req, res) => {
    // console.log(req.body);
    try {
        const { username, email, password, confirm_password } = req.body
        const existemail = await admin.findOne({ email: email }).countDocuments().exec()
        if (existemail > 0) {
            res.json("email is allready exist")
        } else {
            const hash = await plainToHash(password)
            const Admin = await admin.create({ username, email, password: hash, confirm_password })
            // res.json("registration successfully.....")
            req.flash("info", "your registration successfully..!")
            res.redirect('/login')
        }

    } catch (error) {
        console.log(error);
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        const existemail = await admin.findOne({ email }).countDocuments().exec()
        if (existemail > 0) {
            const existuser = await admin.findOne({ email })
            console.log(existuser);

            const match_pwd = await HashToPlain(password, existuser.password)
            if (match_pwd) {
                const payload = {
                    // username: existuser.username,
                    // email: existuser.email
                    id: existuser._id,
                    role_id: existuser.role_id
                }
                const token = jwt.sign(payload, "mykey", { expiresIn: '1h' })
                res.cookie('admin', token, { httpOnly: true, maxAge: 60 * 60 * 1000 })
                console.log('Token Set:', token)
                res.redirect('/')
            } else {
                res.json("password does not macth")
            }
        } else {
            res.json("email id does not exist")
        }
    } catch (error) {
        console.log(error);
    }
}

exports.updateprofile = async (req, res) => {
    try {
        const { email, username } = req.body
        const existemail = await admin.findOne({ email }).countDocuments().exec()
        if (existemail > 0) {
            await admin.updateOne(
                {
                    email: email
                },
                {
                    username,
                    admin_profile: req.file.filename
                }
            )
            res.redirect('/MyProfile')
        } else {
            res.json("email id not exist")
        }
    } catch (error) {
        console.log(error);
    }
}

exports.changepassowrd = async (req, res) => {
    try {
        console.log(req.body);
        const { email, password, new_pass, confirm_pass } = req.body
        const existemail = await admin.findOne({ email }).countDocuments().exec()
        if (existemail > 0) {
            const Admin = await admin.findOne({ email })
            const match = await HashToPlain(password, Admin.password)
            if (match) {
                console.log(new_pass);
                console.log(confirm_pass);

                if (new_pass === confirm_pass) {
                    const hash_pass = await plainToHash(new_pass)
                    await admin.updateOne(
                        {
                            email: email
                        },
                        {
                            password: hash_pass
                        }
                    )
                    req.flash("info", "your password has been changed..!")
                    res.redirect('/ChangePassword')
                } else {
                    res.json("new password does not match")
                }
            } else {
                res.json("password does not macth")
            }
        } else {
            res.json("email id does not exist")
        }
    } catch (error) {
        console.log(error);
    }

}

exports.forgetpassword = async (req, res) => {
    const { username, email } = req.body

    const existemail = await admin.findOne({ email }).countDocuments().exec()
    if (existemail > 0) {

        // var otp = Math.floor(Math.random() * 1000000)
        var otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
        //to enter token in database
        await admin.updateOne({ email }, { token: otp })

        const username = await admin.findOne({ email })

        await sendemail(email, "forgot password", ForgotMail(username, otp))
        req.flash('info', 'check your email....')
        res.redirect('/login')
    } else {
        req.flash('info', 'email does not exist')
        res.redirect('/login')
    }
}

exports.updatepassword = async (req, res) => {
    console.log(req.body);

    const { token, password, confirm_pass } = req.body

    const existtoken = await admin.findOne({ token }).countDocuments().exec()

    if (existtoken) {
        if (password === confirm_pass) {
            const hash_pass = await plainToHash(password)
            const Admin = await admin.findOne({ token })
            await admin.findByIdAndUpdate(
                {
                    _id: Admin._id
                },
                {
                    password: hash_pass,
                    token: ""
                }
            )
            req.flash("info", "your password updated....")
            res.redirect('/login')
        } else {
            req.flash("info", "confirm password not match...")
            res.redirect('/updatepassword')
        }
    } else {
        req.flash("info", "token incorrect")
        res.redirect('/updatepassword')
    }

}