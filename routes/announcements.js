var express = require("express");
var imports =  {
    AllAnnouncements,
} = require( "../controller/announcements_controller.js");

const router = express.Router()

router.get('/getAllAnnouncements', AllAnnouncements);

module.exports = router;