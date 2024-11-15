var express = require("express");
const router = express.Router();

var imports = ({
  GetPayrollNotifRecordInfo,
  CreatePayrollNotifDraft,
  CreatePayrollNotifDraftDate,
  CheckPayrollNotifRecords,
  DeletePayrollNotifDraft,
} = require("../../controller/manage_payroll/payroll_notif_controller"));

router.get(
  "/mp-pn-GetPayrollNotifRecordInfo/:empID",
  GetPayrollNotifRecordInfo
);
router.post(
  "/mp-pn-CreatePayrollNotifDraft",
  DeletePayrollNotifDraft,
  CreatePayrollNotifDraftDate,
  CreatePayrollNotifDraft
);
router.get("/mp-pn-CheckPayrollNotifDraft/:action", CheckPayrollNotifRecords);
router.delete(
  "/mp-pn-DeletePayrollNotifDraft/:action",
  DeletePayrollNotifDraft
);

module.exports = router;
