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
    OriginalAddCommentToCheerPost,
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
    GetModifiedCheersPost,

    //Likes Details
    GetLikesDetails,

    //Comments Modal
    GetCommentsDetails,

    //Posts Modal
    GetPostDetails,

    //Tagged Modal
    GetTaggedDetails,

    //Insert Comments
    AddCommentToCheerPost,

    //Posts Based on Number of Engagements
    GetMostPopularCheersPost,

    //Cheer Posts to You
    GetMyCheersPost,

    //Get Hashtags
    GetHashtags,
    GetTopTenHashtags
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

//Likes Details
router.post("/cap-getLikesDetails", GetLikesDetails);

//Comments Details
router.post("/cap-getCommentsDetails", GetCommentsDetails);

//Post Details
router.post("/cap-getPostDetails", GetPostDetails);

//Tagged Details
router.post("/cap-getTaggedDetails", GetTaggedDetails);

//Add Comment
router.post("/cap-insertOriginalComment", OriginalAddCommentToCheerPost)

//Other Timeline Data
router.get("/cap-getMostEngagedPosts", GetMostPopularCheersPost)
router.get("/cap-getMyRecentPosts", GetMyCheersPost)

//Hashtags
router.get("/cap-getHashtags", GetHashtags);
router.get("/cap-getTopTenHashtags", GetTopTenHashtags);


module.exports = router;