const express = require('express')
const { default: mongoose } = require('mongoose')
const path = require('path')
const app = express()
const jwt = require('jsonwebtoken')
const adminmodel = require('./model/admin.model')


require('dotenv').config()
const PORT = process.env.PORT || 5000


const Category = require('./routes/Category.routes')
const view = require('./routes/view.routes')
const adminrouter = require('./routes/admin.router')
const subcatrouter = require('./routes/SubCat.Route')
const productrouter = require('./routes/Product.Routes')

const cookieParser = require('cookie-parser')
const flash = require('express-flash')
const session = require('express-session')






app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.set('view engine', 'ejs')
// app.use('/public', express.static('uploads'))


app.use(express.static('public'))
app.use('/public', express.static('uploads/product'))
app.use('/profile', express.static('uploads/admin'))
app.use(cookieParser())
app.use(session(
    {
        secret: "my secret key",
        resave: false,
        saveUninitialized: true
    }
))
app.use(flash())

app.use(async (req, res, next) => {
    try {

        res.locals.req = req;
        res.locals.res = res;
        next();

    } catch (error) {
        console.log(error);
        res.redirect('/login');
    }
});

require('./config/db').dbconnect()


app.use('/', view)
app.use('/api/category', Category)
app.use('/api/admin', adminrouter)
app.use('/api/subcategory', subcatrouter)
app.use('/api/product', productrouter)




// mongoose.connect('mongodb+srv://sahil123:sahil123@sahil.eumlk.mongodb.net/rnw')

app.use(async (req, res, next) => {
    if (req.path === "/login" || req.path === "/register") {
      return next();
    }
  
    const token = req.cookies.admin;
    if (!token) {
      return res.redirect("/login");
    }
  
    try {
      const verifyToken = jwt.verify(token, "mykey");
      const SingleAdmin = await AdminModel.findById(verifyToken.id);
      // console.log("single", SingleAdmin);
      res.locals.req = req;
      res.locals.res = res;
      res.locals.SingleAdmin = SingleAdmin;
      next();
    } catch (error) {
      console.log(error);
      res.clearCookie("admin"); // Agar token invalid hai, to cookie hatao
      return res.redirect("/login");
    }
  });
  app.use("/", view);


app.listen(PORT, () => console.log(`Example app listening on PORT http://localhost:${PORT}`))