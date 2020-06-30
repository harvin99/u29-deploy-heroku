const express = require('express')

const router = express.Router()

const registerControllers = require('../controllers/register.controller')
const userValidate = require('../validate/users.validate')

router.get('/create_user', registerControllers.createUser)

router.post('/create_user', userValidate.validatePostCreateUser , registerControllers.postCreateUser)

module.exports = router