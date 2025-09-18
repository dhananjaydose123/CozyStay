const express = require('express');
const router = express.Router();
const User = require('../models/user');
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware');
const userController = require('../controllers/users.js');

// RenderSignUp
router.get("/signup", userController.renderSignup);

// signup
router.post("/signup", wrapAsync(userController.signup));

// RenderLogin
router.get("/login", userController.renderLogin);

// Login
router.post("/login", saveRedirectUrl, passport.authenticate("local", { failureRedirect: '/login', failureFlash: true }), userController.login);

// Logout
router.get("/logout", userController.logout);

module.exports = router;

