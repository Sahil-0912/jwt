const jwt = require('jsonwebtoken')
exports.VerfifyUser = async (req, res, next) => {
    try {
        const token = req?.cookies?.admin
        console.log("token................");
        console.log(token);

        if (!token) {
            res.redirect('/LoginPage')
        }

        const verifytoken = jwt.verify(token, "mykey")
        if (!verifytoken) {
            res.redirect('/LoginPage')
        }
        console.log("verifytoken...............");
        console.log(verifytoken);
        req.user = verifytoken
        next()

    } catch (error) {
        console.log(error);
    }
}


exports.isAdmin = async (req, res, next) => {
    try {
        const { role_id } = req.user
        if (role_id === 1) {
            next()
        } else {
            res.josn("you are not admin!!!")
        }
    } catch (error) {
        console.log(error);
    }
}

exports.isUser = async (req, res, next) => {
    try {
        const { role_id } = req.user
        if (role_id === 0) {
            next()
        } else {
            res.josn("you are not user!!!")
        }
    } catch (error) {
        console.log(error);
    }
}


exports.isCommon = async (req, res, next) => {
    try {
        const { role_id } = req.user
        if (role_id === 0 || role_id === 1) {
            next()
        } else {
            res.josn("you are not user!!!")
        }
    } catch (error) {
        console.log(error);
    }
}