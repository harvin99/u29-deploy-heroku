const Session = require('../models/sessions.model')
const Book = require('../models/books.model')
const Transaction = require('../models/transactions.model')
const Shop = require('../models/shop.model')

module.exports.addToCart = async (req, res, next) => {
    try {
        const bookId = req.params.bookId
        const sessionId = req.signedCookies.sessionId

        if(!sessionId){
            res.redirect('/books')
            return
        }
        await Session.findByIdAndUpdate(sessionId, {
            $inc : {
                ['cart.' + bookId] : 1
            }
        })
        const sess = await Session.findById(sessionId)
        const count = sess.cart[bookId]
        res.redirect('/books')
    } catch (error) {
        console.log(error.message)
    }
}
module.exports.getCart = async (req, res) => {
    try {
        var sessions = await Session.findById(req.signedCookies.sessionId)
        var sumBook = 0
        var listBook = []
        const shop = await Shop.findById(req.signedCookies.shopId)
        if(shop){
            for(bookId in sessions.cart){
                var book = shop.books.find(book => book._id.toString() === bookId) ?
                    shop.books.find(book => book._id.toString() === bookId) :
                    await Book.findById(bookId)
                var bookData = {
                    id:book._id,
                    bookTitle: book.title,
                    cover: book.coverUrl ? book.coverUrl : book.image,
                    amount: sessions.cart[bookId]
                }
                listBook.push(bookData)
                sumBook += sessions.cart[bookId]
            }
        }
        else {
            for(bookId in sessions.cart){
                var book = await Book.findById(bookId)
                var bookData = {
                    id:book._id,
                    bookTitle: book.title,
                    cover: book.coverUrl ? book.coverUrl : book.image,
                    amount: sessions.cart[bookId]
                }
                listBook.push(bookData)
                sumBook += sessions.cart[bookId]
            }
        }
        res.render('cart', {
            listBook : listBook
        })
    } catch (error) {
        console.log(error.message)
    }
}
module.exports.postCart = async (req, res) => {
    try {
        //If User Signed in
        if(req.signedCookies.userId){
            const session = await Session.findById(req.signedCookies.sessionId)
            for(bookId in session.cart){
                    let rent = new Transaction()
                    rent.userId = req.signedCookies.userId
                    rent.bookId = bookId
                    rent.amount = session.cart[bookId]
                    rent.isComplete = false
                    rent.save()
            }
            res.redirect('/transactions')
        }
        else{
            res.redirect('/auth/login')
        }
    } catch (error) {
        console.log(error.message)
    }
}