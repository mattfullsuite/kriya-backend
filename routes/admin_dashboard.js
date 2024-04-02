var express = require("express");
var imports =  {
    GetAllDivisions,
    GetAllDepartments,
    GetAllPositions,
    GetAllSections,
} = require( "../controller/admin_dashboard_controller.js");

const router = express.Router()

router.get("/getAllDivisions", GetAllDivisions);
router.get("/getAllDepartments", GetAllDepartments);
router.get("/getAllPositions", GetAllPositions);
router.get("/getAllSections", GetAllSections);

module.exports = router;