var express = require("express");
var imports =  {
    CreateHeartbitsForAllInactiveEmployees,
    GetMyHeartbitsData,
    CreateACheerPost,
    GetRecentCheers,
    GetPeers,
    GetMostRecentCheer,
    GetMyTotals,
    AddCommentToCheerPost,
    GetCheersPost,
    LikeACheerPost,
    CheckIfLikedAlready,
    UnlikeACheerPost,
    GetAllComments,
    GetAllDistinctComments,
    GetDeptReceivers,
    GetDeptPeers,
    GetDeptGivenAndReceived
} = require( "../controller/cheer_a_peer_controller.js");

const router = express.Router()

router.post("/cap-createHeartbits", CreateHeartbitsForAllInactiveEmployees);
router.get("/cap-getMyHeartbits", GetMyHeartbitsData);
router.post("/cap-cheerAPeer", CreateACheerPost);
router.get("/cap-getRecentCheers", GetRecentCheers);
router.get("/cap-getPeers", GetPeers);
router.get("/cap-getMostRecentCheer", GetMostRecentCheer);
router.get("/cap-getTotals", GetMyTotals);
router.post("/cap-addCommentToCheerPost", AddCommentToCheerPost)
router.get("/cap-getCheers", GetCheersPost);
router.post("/cap-likeACheerPost", LikeACheerPost);
router.get("/cap-getAllLikes", CheckIfLikedAlready);
router.post("/cap-unlikeACheerPost", UnlikeACheerPost);
router.get("/cap-getAllComments", GetAllComments);
router.get("/cap-getAllDistinctComments", GetAllDistinctComments);
router.get("/cap-getAllDeptReceivers", GetDeptReceivers);
router.get("/cap-getAllDeptPeers", GetDeptPeers);
router.get("/cap-getAllGivenAndReceived", GetDeptGivenAndReceived);

module.exports = router;