var express = require("express");
var imports =  {
    GetDirectory,
    GetDirectory2,
    GetDivision,
    GetDepartment,
    GetDownlineCount,
} = require( "../controller/directory_controller.js");

const router = express.Router()

router.get("/getDirectory", GetDirectory);
router.get("/getDivision", GetDivision);
router.get("/getDepartment", GetDepartment);
router.get("/getDownlineCount", GetDownlineCount);


module.exports = router;