var express = require("express");
var imports =  {
    GetDirectory,
    GetDivision,
    GetDepartment,
} = require( "../controller/directory_controller.js");

const router = express.Router()

router.get("/getDirectory", GetDirectory);
router.get("/getDivision", GetDivision);
router.get("/getDepartment", GetDepartment)

module.exports = router;