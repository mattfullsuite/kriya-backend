var express = require("express");
const router = express.Router();
const {
  CreateRecurrringPay,
  GetAllRecurrringPay,
  GetCertainRecurrringPay,
  UpdateRecurrringPay,
  GetActiveEmployeesRP,
  GetRecurringPayItems,
} = require("../../controller/manage_payroll/recurring_pay_controller");

router.get("/rp-GetAllRecurringPay", GetAllRecurrringPay);
router.get("/rp-GetCertainRecurrringPay", GetCertainRecurrringPay);
router.get("/rp-GetActiveEmployeesRP", GetActiveEmployeesRP);
router.post("/rp-CreateRecurrringPay", CreateRecurrringPay);
router.patch("/rp-UpdateRecurrringPay", UpdateRecurrringPay);
router.get("/rp-GetRecurringPayItems", GetRecurringPayItems);

module.exports = router;
