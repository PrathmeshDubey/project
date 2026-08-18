const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js")

router
.route("/signup")
.get( userController.renderSignupForm)
.post( wrapAsync (userController.signup));


router
.route("/login")
.get(userController.renderLoginForm)
// .post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: '/login', failureFlash: true,}) , userController.login);
router.post(
    "/login",
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true
    }),
    async (req, res) => {

        req.flash(
            "success",
            "Welcome back to Wanderlust!"
        );

        res.redirect("/listings");
    }
);


// router.get("/logout", userController.logout);
router.get("/logout", (req, res, next) => {

    req.logout((err) => {

        if (err) {
            return next(err);
        }

        req.flash(
            "success",
            "You have been logged out successfully!"
        );

        res.redirect("/listings");
    });
});

module.exports = router;