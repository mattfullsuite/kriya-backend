var express = require("express");
var imports =  {
    GetDevicesOfCompany,
    AddNewDevice,
    GetDeviceDetails,
    GetDeviceHistory,

    GetCategoryOfDevicesPerCompany,
    CountDevicesPerCategory,
    UploadAccountabilityData,
    
    GetMyDevices,
    GetSomeoneDevices,

    //COunt
    GetAssignedDevices,
    GetUnassignedDevices,

    GetDeviceCategoryPerCompany,
    AddNewDeviceCategory,
} = require( "../controller/device_management_controller.js");

const router = express.Router()

router.get("/dm-getDevicesOfCompany", GetDevicesOfCompany);

router.get("/dm-getMyDevices", GetMyDevices);
router.get("/dm-getDeviceHistory", GetDeviceHistory)
router.get("/dm-getSomeoneDevices/:emp_id", GetSomeoneDevices);

router.post("/dm-addNewDevice", AddNewDevice);
router.get("/dm-retrieveDeviceDetails", GetDeviceDetails);
router.get("/dm-getCategoryOfDevices", GetCategoryOfDevicesPerCompany)
router.get("/dm-countDevicesPerCategory", CountDevicesPerCategory)
router.post("/dm-uploadAccountabilityData", UploadAccountabilityData)

router.get("/dm-getAssignedDevices", GetAssignedDevices);
router.get("/dm-getUnassignedDevices", GetUnassignedDevices);

router.get("/dm-getDeviceCategoryPerCompany", GetDeviceCategoryPerCompany);
router.post("/dm-addNewDeviceCategory", AddNewDeviceCategory)

module.exports = router;