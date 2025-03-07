const router = require('express').Router()
const { VerfifyUser } = require('../middleware/auth')
const Category = require('../model/Category.model')
const CategoryModel = require('../model/Category.model')
const Product = require('../model/Product.model')
const SubCat = require('../model/SubCat.Model')
const adminmodel = require('../model/admin.model')
const jwt = require('jsonwebtoken')




router.get('/', VerfifyUser, (req, res) => {
    // res.render('pages/index')
    res.render('Pages/index')
})
router.get('/AddCategory', VerfifyUser, (req, res) => {
    // res.render('Pages/AddCategory', {
    //     title: "AddCategory"
    // })
    res.render('Pages/AddCategory')
})

router.get('/Viewcategory', async (req, res) => {
    const Category = await CategoryModel.find()
    res.render('Pages/Viewcategory',
        {
            Category,
            title: 'ViewCategory'
        },

    )
})

router.get('/UpdateCategory', async (req, res) => {
    const { id } = req.query
    console.log("id", id);
    const Category = await CategoryModel.findById(id)
    res.render('Pages/UpdateCategory',
        {
            Category,
            title: 'UpdateCategory'

        })

})

router.get('/login', async (req, res) => {
    res.render('Pages/login', { message: req.flash('info') })
})

router.get('/register', async (req, res) => {
    res.render('Pages/register', { message: req.flash('info') })
})

router.get('/logout', (req, res) => {
    res.clearCookie('admin')
    res.redirect('/login')
})

router.get('/MyProfile', VerfifyUser, async (req, res) => {
    const { id } = req.user
    const singleadmin = await adminmodel.findById(id)
    console.log(singleadmin);
    res.render('Pages/MyProfile', { admin: singleadmin })
})

router.get('/ChangePassword', async (req, res) => {
    const token = req.cookies.admin;
    const verifyToken = jwt.verify(token, "mykey")

    const email = await adminmodel.findById(verifyToken.id)
    res.render('Pages/ChangePassword', { email, message: req.flash('info') })
})

router.get('/updatepassword', async (req, res) => {
    res.render('Pages/updatepassword', { message: req.flash("info") })
})



router.get('/AddSubCategory', VerfifyUser, async (req, res) => {
    const categories = await Category.find()
    res.render('Pages/AddSubCategory', { categories })
})


router.get('/ViewSubCategory', async (req, res) => {
    const subcategories = await SubCat.find().populate('category')
    res.render('Pages/ViewSubCategory', { subcategories })
})


router.get('/UpdateSubCategory', async (req, res) => {
    const { id } = req.query
    const categories = await Category.find()
    const subcategories = await SubCat.findById(id).populate('category')
    res.render('Pages/UpdateSubCategory', { categories, subcategories })
})

// product

router.get('/AddProduct', VerfifyUser, async (req, res) => {
    const categories = await Category.find()
    const { cat_id } = req.query;
    var subcategories;
    var selectcategory = req.query.cat_id || ""

    if (cat_id) {
        subcategories = await SubCat.find({ category: cat_id })
    }

    res.render('Pages/AddProduct', { categories, subcategories, selectcategory })
})

router.get('/ViewProduct', async (req, res) => {
    const categories = await Category.find()
    const subcategories = await SubCat.find()
    const product = await Product.find().populate('category').populate('sub_cat')
    res.render('Pages/ViewProduct', { product, categories, subcategories })
})

router.get('/UpdateProduct', async (req, res) => {
    const { id, cat_id } = req.query
    const categories = await Category.find()
    const product = await Product.findById(id).populate('category').populate('sub_cat');
    var subcategories;
    if (cat_id) {
        subcategories = await SubCat.find({ category: cat_id })
    } else {
        subcategories = await SubCat.find({ category: product.category.id })
    }

    var selectcat;
    if (cat_id) {
        selectcat = cat_id
    } else {
        selectcat = product.category ? product.category._id.toString() : ""
    }
    res.render('Pages/UpdateProduct', { categories, product, subcategories, selectcat, selected_subcat: product?.sub_cat?._id })
})

module.exports = router 