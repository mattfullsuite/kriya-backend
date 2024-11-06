var express = require("express");
const router = express.Router();

var imports = ({
  GetPayrollNotifRecordInfo,
} = require("../../controller/manage_payroll/create_upload_controller"));

router.get(
  "/mp-cu-GetPayrollNotifRecordInfo/:empID",
  GetPayrollNotifRecordInfo
);

module.exports = router;
