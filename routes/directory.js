var express = require("express");
var imports =  {
    GetDirectory,
    GetDirectory2,
    GetDivision,
    GetDepartment,
} = require( "../controller/directory_controller.js");

const router = express.Router()

router.get("/getDirectory", GetDirectory);
router.get("/getDirectory2", GetDirectory2);
router.get("/getDivision", GetDivision);
router.get("/getDepartment", GetDepartment)

module.exports = router;