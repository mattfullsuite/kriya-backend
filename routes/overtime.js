var express = require("express");
var imports =  {
    FileOvertime,
} = require( "../controller/overtime_controller.js");

const router = express.Router()

router.post("/fileOvertime", FileOvertime);


module.exports = router;