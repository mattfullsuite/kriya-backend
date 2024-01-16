var express = require("express");
var imports =  {
    HomeHandler, 
    LoginHandler, 
    Logout, 
    processLogin
} = require( "../controller/authentication_controller.js");

const router = express.Router()

router.get('/', HomeHandler);
router.get("/login", LoginHandler);
router.post("/processlogin", processLogin);
router.get('/logout', Logout);

module.exports = router;