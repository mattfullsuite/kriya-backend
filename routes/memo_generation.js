var express = require("express");
const upload = require('../upload.js');

var imports =  {
    GenerateMemos,
    IgnoreMemo,
    SentEmailStatus,

    GetAllNamesOfViolators,
    GetUndertimesOfViolator,
    GetAWOLsOfViolator,
    GetUnpaidLeavesOfProbationary,
    GetLatesOfViolator,

    GetAllMemosOfViolator,
    SendEmailToViolator
} = require( "../controller/memo_generation_controller.js");

const router = express.Router()

router.post("/mg-generateMemos", GenerateMemos);
router.post("/mg-ignoreMemo", IgnoreMemo);
router.post("/mg-sentEmailStatus", SentEmailStatus);

router.get("/mg-getAllMemosOfViolators", GetAllMemosOfViolator);
router.get("/mg-getAllViolators", GetAllNamesOfViolators);
router.get("/mg-getUndertimesOfUser", GetUndertimesOfViolator);
router.get("/mg-getAWOLsOfUser", GetAWOLsOfViolator);
router.get("/mg-getUnpaidLeavesOfUser", GetUnpaidLeavesOfProbationary);
router.get("/mg-getLatesOfUser", GetLatesOfViolator);

router.post("/mg-sendEmailLetter", upload.single('file'), SendEmailToViolator)

module.exports = router;