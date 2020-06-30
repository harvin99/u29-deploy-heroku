const express = require('express')
const multer = require('multer')
//For file upload
const upload = multer({dest: './public/bookcovers/'})

const shopsController = require('../controllers/shops.controller')

const router = express.Router()

router.get('/create_shop', shopsController.getCreateShopPage)
router.post('/create_shop', shopsController.postCreateShop)
router.get('/:id/books', shopsController.getShopById)
router.get('/:id/books/addbook', shopsController.getAddBookPage)
router.post('/:id/books/addbook', upload.single('bookcover'), shopsController.postAddBook)
router.get('/:shopId/books/:bookId', shopsController.addToCartFromShop)

module.exports = router