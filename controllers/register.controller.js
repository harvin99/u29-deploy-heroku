const bcrypt = require('bcrypt')
const cloudinary = require('cloudinary').v2

const User = require('../models/users.model')


module.exports.createUser = (req, res) => {
  res.render("create_user");
};
module.exports.postCreateUser = async (req, res) => {
  try {
      const existEmailUser = await User.findOne({ email: req.body.email })
    if (existEmailUser) {
      res.render("create_user", {
        values: req.body,
        errors: ["Email was exist !"]
      });
      return;
    }
    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(req.body.password, salt)
    let user = new User()

    user.name = req.body.name
    user.email = req.body.email
    user.phone = req.body.phone
    user.password = hashedPassword
    user.isAdmin = false
    user.wrongLoginCount = 0
    user.avatarUrl = '/avatar_default.jpg'

    user.save()
    
    if(!req.signedCookies.userId)
    //Not admin create account 
      res.redirect('/auth/login')
    else
      //If admin create account
      res.redirect("/users");
  } catch (error) {
    console.log(error.message)
  }
};
