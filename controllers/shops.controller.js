const cloudinary = require('cloudinary').v2

const User = require("../models/users.model")
const Shop = require('../models/shop.model')
const Book = require("../models/books.model")
const Session = require('../models/sessions.model')

module.exports.getCreateShopPage = (req, res) => {
    res.render('shop/create_shop')
}
module.exports.postCreateShop = async (req, res) => {
    try {
        
        //Form ...
        let shop = new Shop()
        shop.nameShop = req.body.nameShop
        shop.userId = req.signedCookies.userId
        shop.save()

        await User.findByIdAndUpdate(req.signedCookies.userId, {shopId : shop._id})
        const user = await User.findById(req.signedCookies.userId)
        if(user.shopId){
            res.redirect('/shops/' + user.shopId)
        }
        else{
            res.redirect('/shops')
        }
    } catch (error) {
        console.log(error.message)
    }
    
}
module.exports.getShopById = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id)
        if(req.signedCookies.userId){
            const user = await User.findById(req.signedCookies.userId)
            res.render('shop/shop', {
                shop : shop,
                user : user,
                list : shop.books
            })
        }
        res.render('shop/shop', {
            shop : shop,
            list : shop.books
        })
    } catch (error) {
        console.log(error.message)
    }
}
module.exports.getAddBookPage = (req, res) => {
    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_CLOUD_KEY,
        api_secret: process.env.API_SECRET_CLOUD_KEY
    })
    res.render('shop/addbook')
}
module.exports.postAddBook = async (req, res) => {
    cloudinary.uploader.upload(req.file.path , async function(error, result) { 
        try {
            const {title, description} = req.body
            const shop = await Shop.findById(req.params.id)
            let book = new Book()
            book.title = title
            book.description = description
            book.image = "https://loremflickr.com/320/240"
            book.coverUrl =  result.url

            shop.books.push(book)
            await shop.save()

            res.redirect('/shops/' + req.params.id + '/books')
        } catch (error) {
            console.log(error.message)
        }
    })
}
module.exports.addToCartFromShop = async (req, res, next) => {
    try {
        const bookId = req.params.bookId
        const shopId = req.params.shopId
        const sessionId = req.signedCookies.sessionId

        if(!sessionId){
            res.redirect('/shops/' + shopId + '/books')
            return
        }
        await Session.findByIdAndUpdate(sessionId, {
            $inc : {
                ['cart.' + bookId] : 1
            }
        })
        const sess = await Session.findById(sessionId)

        const count = sess.cart[bookId]

        res.cookie('shopId', shopId, {
            signed : true
        })
        res.redirect('/shops/' + shopId+ '/books')
    } catch (error) {
        console.log(error.message)
    }
}
