var express = require("express");
var imports =  {
    GetMyHeartbitsData,
    CreateACheerPost,
    GetRecentCheers,
    GetPeers,
    GetMostRecentCheer,
    GetMyTotals,
} = require( "../controller/cheer_a_peer_controller.js");

const router = express.Router()

router.get("/cap-getMyHeartbits", GetMyHeartbitsData);
router.post("/cap-cheerAPeer", CreateACheerPost);
router.get("/cap-getRecentCheers", GetRecentCheers);
router.get("/cap-getPeers", GetPeers);
router.get("/cap-getMostRecentCheer", GetMostRecentCheer);
router.get("/cap-getTotals", GetMyTotals);

module.exports = router;