var express = require("express");
var imports =  {
    CreateHeartbitsForAllInactiveEmployees,
    GetMyHeartbitsData,
    CreateACheerPost,
    ModifiedCreateACheerPost,
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
    GetDeptGivenAndReceived,
    GetAllLikes,
    GetDataForNotifications,
    GetDataForMyNotifications,
    GetDataForMyNotificationsLimited,
    GetMentionPeers,
    GetAllTimeLeaderboards,
    GetMonthlyLeaderboards,
    GetWeeklyLeaderboards,
    GetMyRecentCheersWidget,
    GetModifiedCheersPost
} = require( "../controller/cheer_a_peer_controller.js");

const router = express.Router()

router.post("/cap-createHeartbits", CreateHeartbitsForAllInactiveEmployees);
router.get("/cap-getMyHeartbits", GetMyHeartbitsData);
router.post("/cap-cheerAPeer", CreateACheerPost);
router.post("/cap-modifiedCheerAPeer", ModifiedCreateACheerPost);
router.get("/cap-getRecentCheers", GetRecentCheers);
router.get("/cap-getPeers", GetPeers);
router.get("/cap-getMentionPeers", GetMentionPeers);
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
router.get("/cap-getAllLikesOfPost", GetAllLikes);
router.get("/cap-getDataForNotifications", GetDataForNotifications);
router.get("/cap-getDataForMyNotifications", GetDataForMyNotifications);
router.get("/cap-getDataForMyNotificationsLimited", GetDataForMyNotificationsLimited);
router.get("/cap-getAllTimeLeaderboards", GetAllTimeLeaderboards);
router.get("/cap-getMonthlyLeaderboards", GetMonthlyLeaderboards);
router.get("/cap-getWeeklyLeaderboards", GetWeeklyLeaderboards);
router.get("/cap-getMyRecentCheersWidget", GetMyRecentCheersWidget);
router.get("/cap-getModifiedCheerPosts", GetModifiedCheersPost)

module.exports = router;