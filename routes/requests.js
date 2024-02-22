var express = require("express");
var imports =  {
    SubmitComplaint,
    SubmitAnonymousComplaint,
    AllHR,
} = require( "../controller/requests_controller.js");

const router = express.Router()

router.post("/submitComplaint", SubmitComplaint);
router.post("/submitAnonymousComplaint", SubmitAnonymousComplaint);
router.get("/getAllHR", AllHR);

module.exports = router;