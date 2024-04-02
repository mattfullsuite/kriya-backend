var express = require("express");
var imports =  {
    GetAllCompanies,
    GetAllLiveAccounts
} = require( "../controller/superadmin_dashboard_controller.js");

const router = express.Router()

router.get("/getAllCompanies", GetAllCompanies);
router.get("/getAllLiveAccounts", GetAllLiveAccounts)

module.exports = router;