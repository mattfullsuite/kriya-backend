var express = require("express");
const router = express.Router();

var imports = ({
  GetPayrollNotifRecordInfo,
  CreatePayrollNotifDraft,
  CreatePayrollNotifDraftDate,
} = require("../../controller/manage_payroll/create_upload_controller"));

router.get(
  "/mp-cu-GetPayrollNotifRecordInfo/:empID",
  GetPayrollNotifRecordInfo
);
// router.post("/mp-cu-CreatePayrollNotifDraft", CreatePayrollNotifDraft);
router.post(
  "/mp-cu-CreatePayrollNotifDraft",
  CreatePayrollNotifDraftDate,
  CreatePayrollNotifDraft
);

module.exports = router;
