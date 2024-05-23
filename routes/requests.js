var express = require("express");
var imports =  {
    GetAllEmployeesOfCompany,
    SubmitComplaint,
    SubmitAnonymousComplaint,
    AllHR,
} = require( "../controller/requests_controller.js");

const router = express.Router()

router.get("/req-allemployees", GetAllEmployeesOfCompany);
router.post("/submitComplaint", SubmitComplaint);
router.post("/submitAnonymousComplaint", SubmitAnonymousComplaint);
router.get("/getAllHR", AllHR);

module.exports = router;