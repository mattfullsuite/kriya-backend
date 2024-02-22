var express = require("express");
var imports =  {
    AdminLoginHandler, 
    AdminLogout, 
    AdminLogin
} = require( "../controller/administrator_controller.js");

const router = express.Router()

router.get("/ts-login", AdminLoginHandler);
router.post("/ts-processlogin", AdminLogin);
router.get('/ts-logout', AdminLogout);

module.exports = router;