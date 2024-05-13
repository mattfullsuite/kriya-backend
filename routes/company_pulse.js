var express = require("express");
var imports =  {
    GetCompanyMoodPulse
} = require( "../controller/company_pulse_controller.js");

const router = express.Router()

router.get("/cp-getCompanyPulse", GetCompanyMoodPulse);

module.exports = router;