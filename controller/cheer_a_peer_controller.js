var db = require("../config.js");
var moment = require("moment")

var Slack = require("@slack/bolt")
var dotenv = require("dotenv")

const api_app = new Slack.App({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN,
})

function CreateHeartbitsForAllInactiveEmployees(req, res) {
    const aq = "INSERT INTO heartbits (`emp_id`, `heartbits_balance`, `total_heartbits`) SELECT emp_id, 100, 0 FROM emp WHERE emp_id NOT IN (SELECT DISTINCT e.emp_id FROM emp AS e INNER JOIN heartbits AS h ON e.emp_id = h.emp_id)"

    db.query(aq,  
        (err,data) => {
        if (err){
            console.log(err)
        } else {
            console.log("done")
        }
    })
}

function GetMyHeartbitsData(req, res) {

    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM heartbits WHERE emp_id = ?"

    console.log(1)

    db.query(q, 
        [uid], 
        (err,data) => {
        if (err){
            res.send("error");
            console.log(err)
        } else {
            console.log("q1")
            console.log(data.length)
            if (data.length == 0){
                const uid = req.session.user[0].emp_id
                const q2 = "INSERT INTO heartbits (`emp_id`, `heartbits_balance`, `total_heartbits`) VALUES (?)"
                console.log(2);

                const values = [uid,100,0]
                
                db.query(q2, 
                    [values], 
                    (err,data) => {
                    if (err){
                        res.send("error");
                        console.log(err)
                    } else {
                        console.log("inserted balance")
                        const uid = req.session.user[0].emp_id
                        console.log(3)
                        const q3 = "SELECT * FROM heartbits WHERE emp_id = ?"
                
                        db.query(q3, 
                            [uid], 
                            (err,data) => {
                                if (err){
                                res.send("error");
                                } else {
                                    res.json(data);
                                }
                        })
                    }
                });

            } else {
                const uid = req.session.user[0].emp_id
                console.log(3)
                const q3 = "SELECT * FROM heartbits WHERE emp_id = ?"
        
                db.query(q3, 
                    [uid], 
                    (err,data) => {
                        if (err){
                          res.send("error");
                        } else {
                            res.json(data);
                        }
                })
            }
        }
    })
}

function CreateACheerPost(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "INSERT INTO cheer_post (`cheerer_id`, `peer_id`, `post_body`, `heartbits_given`) VALUES (?)";

    const values = [
        uid,
        req.body.peer_id,
        req.body.post_body,
        req.body.heartbits_given,
    ]

    db.query(q, 
        [values], 
        (err,data) => {
            try {
                if (err){
                   console.log(err);
                   res.send("error")
                } else {
                   console.log("success");
                //    res.send("success")
                   const cheerer_q = "UPDATE heartbits SET `heartbits_balance` = `heartbits_balance` - " + req.body.heartbits_given + " WHERE emp_id = " + uid;

                   db.query(cheerer_q, (err, data) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(data);
                        }
                    })

                    const peer_q = "UPDATE heartbits SET `total_heartbits` = `total_heartbits` + " + req.body.heartbits_given + " WHERE emp_id = " + req.body.peer_id;

                    db.query(peer_q, (err, data) => {
                        if (err) {
                            console.log(err);
                        } else {
                            const cid = req.session.user[0].company_id;
                            const q = `SELECT c.*, ch.f_name AS cheerer_f_name, ch.s_name AS cheerer_s_name, p.position_name AS cheerer_job, pe.f_name AS peer_f_name, pe.s_name AS peer_s_name, p2.position_name AS peer_job, (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_likes cl ON cp.cheer_post_id = cl.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) AS num_likes, (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_comments cc ON cp.cheer_post_id = cc.cheer_post_id WHERE cc.cheer_post_id = c.cheer_post_id) AS num_comments FROM cheer_post AS c INNER JOIN emp AS ch ON c.cheerer_id = ch.emp_id INNER JOIN emp_designation AS em ON ch.emp_id = em.emp_id INNER JOIN position AS p ON p.position_id = em.position_id INNER JOIN emp AS pe ON c.peer_id = pe.emp_id INNER JOIN emp_designation AS em2 ON pe.emp_id = em2.emp_id INNER JOIN position AS p2 ON p2.position_id = em2.position_id WHERE em.company_id = ? AND cheer_post_id = LAST_INSERT_ID()`;

                            db.query(q, [cid], (err, data) => {
                                if(err) {
                                    console.log(err);
                                } else {
                                    res.json(data);
                                    // res.send("success");
                                }
                            })

                        }
                    })
                }
            } catch(e) {
                res.send("error");
                console.log(err)
            }

    })

}

function AddCommentToCheerPost(req, res) {
    const uid = req.session.user[0].emp_id;
    const q = "INSERT INTO cheer_comments (`cheer_post_id`, `commenter_id`, `cheer_comment`, `additional_heartbits`) VALUES (?)"

    const values = [
        req.body.cheer_post_id,
        uid,
        req.body.cheer_comment,
        req.body.additional_heartbits,
    ]

    db.query(q, [values], (err, data) => {
        if (err) {
            res.send("error");
            console.log(err);
        } else {
            console.log(data)
            //const q = "SELECT * FROM cheer_comments INNER JOIN emp ON emp_id = commenter_id WHERE cheer_comments_id = LAST_INSERT_ID()";
            const q = "SELECT cd.peer_id FROM cheer_designation cd INNER JOIN cheer_post cp ON cd.cheer_post_id = cp.cheer_post_id WHERE cp.cheer_post_id = ?"

            db.query(q, [req.body.cheer_post_id], (err, data) => {
                if (err) {
                    res.send("error");
                } else {
                    //res.json(data);
                    console.log(data)
                    const peers = data

                    peers.map((p) => {

                        if (p.peer_id != uid){

                            const cheerer_q = "UPDATE heartbits SET `heartbits_balance` = `heartbits_balance` - " + req.body.additional_heartbits + " WHERE emp_id = " + uid;
            
                            db.query(cheerer_q, (err, data) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log("Deducted heartbits from employee# " + uid)
                                }
                            })
            
                            const peer_q = "UPDATE heartbits SET `total_heartbits` = `total_heartbits` + " + req.body.additional_heartbits + " WHERE emp_id = " + p.peer_id;
            
                            db.query(peer_q, (err, data) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log("Added heartbits to employee# " + p.peer_id)
                                }
                            })
                        }
                    })
                }
            })
        }
    });
}

async function appendMentions (peersArr) {
    let tempArr = []

    peersArr.map((p) => {
        const email_q = "SELECT work_email FROM emp WHERE emp_id = ?";

        db.query(email_q, [p.id], (err, data) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Added email of employee# " + p.id)
                tempArr.push(`<@${data[0].work_email.substring(0, data[0].work_email.indexOf("@"))}>`)
            }
        })
    })

    console.log("TEMP ARR", tempArr)

    return tempArr;
}

async function ModifiedCreateACheerPost(req, res){
    const uid = req.session.user[0].emp_id
    const q = "INSERT INTO cheer_post (`cheerer_id`, `post_body`, `hashtags`) VALUES (?)";

    const values = [
        uid,
        req.body.post_body,
        req.body.hashtags,
    ]

    const hb_given = req.body.heartbits_given
    const peers = req.body.peer_id

    let peerEmails = [];

    await db.query(q, [values], (err, data) => {
        if (err) {
            console.log("Error 1: ", err);
        } else {
            console.log("Level 1: Success")

            var tempArr = [];

            const q2 = "INSERT INTO cheer_designation (`cheer_post_id`,`peer_id`, `heartbits_given`) VALUES ((SELECT `cheer_post_id` FROM `cheer_post` ORDER BY cheer_post_id DESC LIMIT 1), ?, ?)";
                
            peers.map((p) => {
                db.query(q2, [p.id, hb_given], (err, data) => {
                    if (err) {
                        console.log("Error 2: ", err);
                    } else {
                        console.log("Level 2: Success")
                    }
                })

                const cheerer_q = "UPDATE heartbits SET `heartbits_balance` = `heartbits_balance` - " + hb_given + " WHERE emp_id = " + uid;

                db.query(cheerer_q, (err, data) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Deducted heartbits from employee# " + uid)
                    }
                })

                const peer_q = "UPDATE heartbits SET `total_heartbits` = `total_heartbits` + " + hb_given + " WHERE emp_id = " + p.id;

                db.query(peer_q, (err, data) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Added heartbits to employee# " + p.id)
                    }
                })

                // const email_q = "SELECT work_email FROM emp WHERE emp_id = ?";

                // db.query(email_q, [p.id], (err, data) => {
                //     if (err) {
                //         console.log(err);
                //     } else {
                //         console.log("Added email of employee# " + p.id)
                //         peerEmails.push(`<@${data[0].work_email.substring(0, data[0].work_email.indexOf("@"))}>`)
                //         console.log("INSIDE: ", peerEmails)
                //     }
                // })
            })
            res.send("success")    
        }
    })

    //Slack API Configuration

    console.log("PEER EMAILS", peerEmails)

    const fn = req.session.user[0].f_name;
    const sn = req.session.user[0].s_name;

    const peerNames = []

    peers.map((p) => {
        peerNames.push(p.display)
    })

    const mentionedPeers = peerNames.join(", ")

    const email1 = req.session.user[0].work_email.substring(0, req.session.user[0].work_email.indexOf("@"))

    console.log("Mentioned Peers", mentionedPeers)

    const mentionedEmails = peerEmails.join(", ")

    const blocks = [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "A new cheer has been posted!"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    //"text": `*<@${email1}>* > *${mentionedEmails}*\n${hb_given} heartbits gained!\n ${req.body.post_body}`
                    "text": `*${fn} ${sn}* > *${mentionedPeers}*\n${hb_given} heartbits gained!\n ${req.body.post_body}`
                }
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "plain_text",
                        "emoji": true,
                        "text": `${moment().format("MMM DD YYYY")}`
                    }
                ]
            },
    ]

    await api_app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: process.env.SLACK_CHANNEL,
        text: "New Cheer Post!",
        blocks,
    })

}

function GetMostRecentCheer(req, res) {
    const uid = req.session.user[0].company_id;
    const q = "SELECT * FROM cheer_post AS cp INNER JOIN cheer_designation cd ON cp.cheer_post_id = cd.cheer_post_id INNER JOIN emp AS e ON cheerer_id = e.emp_id INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id INNER JOIN position AS p ON em.position_id = p.position_id WHERE em.company_id = ? ORDER BY cheer_post_id DESC LIMIT 1"

    db.query(q, [uid], (err, data) => {
        if (err) {
            res.send("error");
        } else {
            res.json(data);
        }
    })
}

function GetCheersPost(req, res) {
    const cid = req.session.user[0].company_id;
    const q = `SELECT c.*, ch.f_name AS cheerer_f_name, ch.s_name AS cheerer_s_name, p.position_name AS cheerer_job, pe.f_name AS peer_f_name, pe.s_name AS peer_s_name, p2.position_name AS peer_job, (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_likes cl ON cp.cheer_post_id = cl.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) AS num_likes, (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_comments cc ON cp.cheer_post_id = cc.cheer_post_id WHERE cc.cheer_post_id = c.cheer_post_id) AS num_comments FROM cheer_post AS c INNER JOIN emp AS ch ON c.cheerer_id = ch.emp_id INNER JOIN emp_designation AS em ON ch.emp_id = em.emp_id INNER JOIN position AS p ON p.position_id = em.position_id INNER JOIN emp AS pe ON c.peer_id = pe.emp_id INNER JOIN emp_designation AS em2 ON pe.emp_id = em2.emp_id INNER JOIN position AS p2 ON p2.position_id = em2.position_id WHERE em.company_id = ? ORDER BY posted_at DESC`

    db.query(q, [cid], (err, data) => {
        if (err) {
            res.send("error");
        } else {
            res.json(data)
        }
    })
}

function GetPeers(req, res) {
    const cid = req.session.user[0].company_id;
    const uid = req.session.user[0].emp_id;
    const q = "SELECT * FROM emp AS e INNER JOIN emp_designation AS em ON em.emp_id = e.emp_id WHERE em.company_id = ? AND e.emp_id != ? AND e.date_separated IS NULL ORDER BY e.f_name"

    db.query(q, [cid, uid], (err, data) => {
        if (err) {
            res.send("error");
        } else {
            res.json(data);
        }
    });
}

//SELECT (SELECT COUNT(cheerer_id) FROM cheer_post WHERE cheerer_id = 1) AS total_given, (SELECT COUNT(peer_id) FROM cheer_post WHERE cheerer_id = 1) AS total_received, (SELECT SUM(heartbits_given) FROM cheer_post WHERE peer_id = 1) AS total_points FROM cheer_post GROUP BY total_points
function GetMyTotals(req, res) {
    const uid = req.session.user[0].emp_id;
    const q = "SELECT (SELECT COUNT(cheerer_id) FROM cheer_post WHERE cheerer_id = ?) AS total_given, (SELECT COUNT(peer_id) FROM cheer_post WHERE peer_id = ?) AS total_received, (SELECT SUM(heartbits_given) FROM cheer_post WHERE cheerer_id = ?) AS total_points FROM cheer_post GROUP BY total_points"

    db.query(q, [uid, uid, uid], (err, data) => {
        if (err) {
            res.send("error");
        } else {
            res.json(data);
        }
    });
}

function OriginalAddCommentToCheerPost(req, res) {
    const uid = req.session.user[0].emp_id;
    const q = "INSERT INTO cheer_comments (`cheer_post_id`, `commenter_id`, `cheer_comment`) VALUES (?)"

    const values = [
        req.body.cheer_post_id,
        uid,
        req.body.cheer_comment
    ]

    db.query(q, [values], (err, data) => {
        if (err) {
            res.send("error");
            console.log(err);
        } else {
            const q = "SELECT * FROM cheer_comments INNER JOIN emp ON emp_id = commenter_id WHERE cheer_comments_id = LAST_INSERT_ID()";


            db.query(q,[], (err, data) => {
                if (err) {
                    res.send("error");
                } else {
                    res.json(data);
                }
            })
        }
    });
}

function LikeACheerPost(req, res) {
    const uid = req.session.user[0].emp_id;
    const q = "INSERT INTO cheer_likes (`cheer_post_id`, `liker_id`) VALUES (?)"

    const values = [
        req.body.post_id,
        uid
    ]

    db.query(q, [values], (err, data) => {
        if (err) {
            res.send("error");
            console.log(err);
        } else {
            res.json(data);
            console.log(data)
        }
    });
}

function CheckIfLikedAlready(req, res){
    const uid = req.session.user[0].emp_id;
    const q = "SELECT cheer_post_id FROM cheer_likes WHERE liker_id = ?"

    db.query(q, [uid], (err, data) => {
        if (err) {
            res.send("error");
        } else {
            res.json(data);
        }
    });
}

function UnlikeACheerPost(req, res) {
    const uid = req.session.user[0].emp_id;
    const post_id = req.body.post_id;
    const q = "DELETE FROM cheer_likes WHERE cheer_post_id = " + post_id + "  AND liker_id = " + uid;
  
    db.query(q, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        // res.json("success");
        console.log(data)
      }
    });
}

function GetAllComments(req, res){
    const q = "SELECT * FROM cheer_comments INNER JOIN emp ON emp_id = commenter_id"

    db.query(q, (err, data) => {
        if (err) {
            res.send("error");
        } else {
            res.json(data);
        }
    });
}

function GetAllLikes(req, res){
    const q = "SELECT * FROM cheer_likes cl INNER JOIN emp e ON e.emp_id = cl.liker_id INNER JOIN emp_designation em ON em.emp_id = e.emp_id INNER JOIN position p ON em.position_id = p.position_id "

    db.query(q, (err, data) => {
        if (err) {
            res.send("error");
        } else {
            res.json(data);
            console.log("LIKES: " + JSON.stringify(data));
        }
    });
}

function GetAllDistinctComments(req, res){
    const q = "SELECT DISTINCT(cheer_post_id) FROM cheer_comments INNER JOIN emp ON emp_id = commenter_id"

    db.query(q, (err, data) => {
        if (err) {
            res.send("error");
        } else {
            res.json(data);
            // console.log(data);
        }
    });
}

function GetDeptReceivers(req, res){
    const cid = req.session.user[0].company_id;
    const q =  `SELECT de.dept_name, COUNT(de.dept_id) AS cheerer_num FROM cheer_post cp LEFT JOIN emp_designation ed ON ed.emp_id = cp.cheerer_id LEFT JOIN position p ON ed.position_id = p.position_id LEFT JOIN dept de ON de.dept_id = p.dept_id WHERE ed.company_id = ? GROUP BY de.dept_name`

    db.query(q, [cid], (err, data) => {
        if (err) {
            res.send("error");
        } else {
            res.json(data);
            // console.log(data);
        }
    });
}

function GetDeptPeers(req, res){
    const cid = req.session.user[0].company_id;
    const q =  `SELECT de.dept_name, COUNT(de.dept_id) AS cheerer_num FROM cheer_post cp LEFT JOIN emp_designation ed ON ed.emp_id = cp.peer_id LEFT JOIN position p ON ed.position_id = p.position_id LEFT JOIN dept de ON de.dept_id = p.dept_id WHERE ed.company_id = ? GROUP BY de.dept_name`

    db.query(q, [cid], (err, data) => {
        if (err) {
            res.send("error");
        } else {
            res.json(data);
            // console.log(data);
        }
    });
}

function GetDeptGivenAndReceived(req, res){
    const cid = req.session.user[0].company_id;
    const q =  `SELECT dept_name, SUM(cheers_total) AS total_cheers FROM (SELECT de.dept_name AS dept_name, COUNT(de.dept_id) AS cheers_total FROM cheer_post cp LEFT JOIN emp_designation ed ON ed.emp_id = cp.cheerer_id LEFT JOIN position p ON ed.position_id = p.position_id LEFT JOIN dept de ON de.dept_id = p.dept_id WHERE ed.company_id = ? GROUP BY de.dept_name UNION ALL SELECT de.dept_name AS dept_name, COUNT(de.dept_id) AS cheers_total FROM cheer_post cp LEFT JOIN emp_designation ed ON ed.emp_id = cp.peer_id LEFT JOIN position p ON ed.position_id = p.position_id LEFT JOIN dept de ON de.dept_id = p.dept_id WHERE ed.company_id = ? GROUP BY de.dept_name) t GROUP BY dept_name ORDER BY total_cheers DESC`

    db.query(q, [cid, cid], (err, data) => {
        if (err) {
            res.send("error");
        } else {
            res.json(data);
            // console.log(data);
        }
    });
}

function GetDataForNotifications(req,res){
    const q = "(SELECT ec.f_name AS c_f_name, ec.s_name AS c_s_name, cp.heartbits_given, ep.f_name AS p_f_name, ep.s_name AS p_f_name, cp.posted_at FROM cheer_post cp INNER JOIN emp ec ON ec.emp_id = cp.peer_id INNER JOIN emp ep ON ep.emp_id = cp.cheerer_id)"

    db.query(q, (err, data) => {
        if (err) {
            res.send("error");
        } else {
            res.json(data);
        }
    });
}

function GetMentionPeers(req, res) {
    const cid = req.session.user[0].company_id;
    const uid = req.session.user[0].emp_id;
    const q = `SELECT e.emp_id AS id, CONCAT(e.f_name, " ", e.s_name) AS display FROM emp AS e INNER JOIN emp_designation AS em ON em.emp_id = e.emp_id WHERE em.company_id = ? AND e.emp_id != ? AND e.date_separated IS NULL ORDER BY e.f_name;`

    db.query(q, [cid, uid], (err, data) => {
        if (err) {
            res.send("error");
        } else {
            res.json(data);
        }
    });
}

function GetHashtags(req, res) {
    const cid = req.session.user[0].company_id;
    //const uid = req.session.user[0].emp_id;
    const q = `SELECT DISTINCT hashtags AS display FROM cheer_post WHERE hashtags IS NOT NULL`

    db.query(q, (err, data) => {
        if (err) {
            res.send("error");
        } else {
            res.json(data);
        }
    });
}


function GetAllTimeLeaderboards(req, res) {
    const cid = req.session.user[0].company_id;
    const q = `SELECT e.emp_id, e.emp_pic, e.f_name, e.s_name, e.emp_num, SUM(cd.heartbits_given) AS total_heartbits FROM cheer_post cp INNER JOIN cheer_designation cd ON cp.cheer_post_id = cd.cheer_post_id INNER JOIN emp e ON e.emp_id = cd.peer_id INNER JOIN emp_designation ed ON e.emp_id = ed.emp_id WHERE ed.company_id = ? GROUP BY e.emp_id, e.emp_pic, e.f_name, e.s_name ORDER BY total_heartbits DESC`

    db.query(q, [cid], (err, data) => {
        if (err) {
            res.send("error");
        } else {
            res.json(data);
        }
    });
}

function GetMonthlyLeaderboards(req, res) {
    const cid = req.session.user[0].company_id;
    const q = `SELECT e.emp_id, e.emp_pic, e.emp_num, e.f_name, e.s_name, SUM(cd.heartbits_given) AS total_heartbits FROM cheer_post cp INNER JOIN cheer_designation cd ON cp.cheer_post_id = cd.cheer_post_id INNER JOIN emp e ON e.emp_id = cd.peer_id INNER JOIN emp_designation ed ON e.emp_id = ed.emp_id WHERE ed.company_id = ? AND MONTH(cp.posted_at) = MONTH(CURRENT_TIMESTAMP ()) AND YEAR(cp.posted_at) = YEAR(CURRENT_TIMESTAMP ()) GROUP BY e.emp_id, e.emp_pic, e.f_name, e.s_name ORDER BY total_heartbits DESC;`

    db.query(q, [cid], (err, data) => {
        if (err) {
            res.send("error");
        } else {
            res.json(data);
        }
    });
}

function GetWeeklyLeaderboards(req, res) {
    const cid = req.session.user[0].company_id;
    const q = `SELECT e.emp_id, e.emp_pic, e.f_name, e.s_name, e.emp_num, SUM(cd.heartbits_given) AS total_heartbits FROM cheer_post cp INNER JOIN cheer_designation cd ON cp.cheer_post_id = cd.cheer_post_id INNER JOIN emp e ON e.emp_id = cd.peer_id INNER JOIN emp_designation ed ON e.emp_id = ed.emp_id WHERE ed.company_id = ? AND WEEK(cp.posted_at) = WEEK(CURRENT_TIMESTAMP ()) AND YEAR(cp.posted_at) = YEAR(CURRENT_TIMESTAMP ()) GROUP BY e.emp_id, e.emp_pic, e.f_name, e.s_name ORDER BY total_heartbits DESC;`

    db.query(q, [cid], (err, data) => {
        if (err) {
            res.send("error");
        } else {
            res.json(data);
        }
    });
}

function GetModifiedCheersPost(req, res) {
    const cid = req.session.user[0].company_id;
    //const q = `SELECT c.*, ch.f_name AS cheerer_f_name, ch.s_name AS cheerer_s_name, p.position_name AS cheerer_job, pe.f_name AS peer_f_name, pe.s_name AS peer_s_name, p2.position_name AS peer_job, (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_likes cl ON cp.cheer_post_id = cl.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) AS num_likes, (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_comments cc ON cp.cheer_post_id = cc.cheer_post_id WHERE cc.cheer_post_id = c.cheer_post_id) AS num_comments FROM cheer_post AS c INNER JOIN emp AS ch ON c.cheerer_id = ch.emp_id INNER JOIN emp_designation AS em ON ch.emp_id = em.emp_id INNER JOIN position AS p ON p.position_id = em.position_id INNER JOIN emp AS pe ON c.peer_id = pe.emp_id INNER JOIN emp_designation AS em2 ON pe.emp_id = em2.emp_id INNER JOIN position AS p2 ON p2.position_id = em2.position_id WHERE em.company_id = ? ORDER BY posted_at DESC`
    const q = `SELECT c.*, MAX(cd.heartbits_given) AS hb_given, MAX(ch.f_name) AS cheerer_f_name, MAX(ch.s_name) AS cheerer_s_name, MAX(p.position_name) AS cheerer_job, MAX(pe.f_name) AS peer_f_name, MAX(pe.s_name) AS peer_s_name, MAX(p2.position_name) AS peer_job, (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_likes cl ON cp.cheer_post_id = cl.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) AS num_likes, (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_comments cc ON cp.cheer_post_id = cc.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) AS num_comments, (SELECT COUNT(ccp.cheer_post_id) FROM cheer_designation ccp WHERE ccp.cheer_post_id = c.cheer_post_id) AS num_tagged FROM cheer_post AS c INNER JOIN cheer_designation cd ON c.cheer_post_id = cd.cheer_post_id INNER JOIN emp AS ch ON c.cheerer_id = ch.emp_id INNER JOIN emp_designation AS em ON ch.emp_id = em.emp_id INNER JOIN position AS p ON p.position_id = em.position_id INNER JOIN emp AS pe ON cd.peer_id = pe.emp_id INNER JOIN emp_designation AS em2 ON pe.emp_id = em2.emp_id INNER JOIN position AS p2 ON p2.position_id = em2.position_id WHERE em.company_id = ? GROUP BY c.cheer_post_id ORDER BY posted_at DESC`
    db.query(q, [cid], (err, data) => {
        if (err) {
            res.send("error");
        } else {
            res.json(data)
        }
    })
}

//Open Likes Modal

function GetLikesDetails(req, res){
    const cheer_post_id = req.body.cheer_post_id
    const q = `SELECT * FROM cheer_likes cl INNER JOIN emp e ON e.emp_id = cl.liker_id INNER JOIN emp_designation em ON em.emp_id = e.emp_id INNER JOIN position p ON em.position_id = p.position_id WHERE cheer_post_id = ?`
  
    db.query(q, [cheer_post_id], (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
}

//Open Comments Modal

function GetCommentsDetails(req, res){
    const cheer_post_id = req.body.cheer_post_id
    //const q = `SELECT * FROM cheer_likes cl INNER JOIN emp e ON e.emp_id = cl.liker_id INNER JOIN emp_designation em ON em.emp_id = e.emp_id INNER JOIN position p ON em.position_id = p.position_id WHERE cheer_post_id = ?`
    const q = "SELECT * FROM cheer_comments INNER JOIN emp ON emp_id = commenter_id WHERE cheer_post_id = ?"

    db.query(q, [cheer_post_id], (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
}

//Open Posts Modal

function GetPostDetails(req, res){
    const cheer_post_id = req.body.cheer_post_id
    //const q = `SELECT * FROM cheer_likes cl INNER JOIN emp e ON e.emp_id = cl.liker_id INNER JOIN emp_designation em ON em.emp_id = e.emp_id INNER JOIN position p ON em.position_id = p.position_id WHERE cheer_post_id = ?`
    const q = `SELECT c.*, cd.heartbits_given AS hb_given, ch.f_name AS cheerer_f_name, ch.s_name AS cheerer_s_name, p.position_name AS cheerer_job, pe.f_name AS peer_f_name, pe.s_name AS peer_s_name, p2.position_name AS peer_job, (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_likes cl ON cp.cheer_post_id = cl.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) AS num_likes, (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_comments cc ON cp.cheer_post_id = cc.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) AS num_comments, (SELECT COUNT(ccp.cheer_post_id) FROM cheer_designation ccp WHERE ccp.cheer_post_id = c.cheer_post_id) AS num_tagged FROM cheer_post AS c INNER JOIN cheer_designation cd ON c.cheer_post_id = cd.cheer_post_id INNER JOIN emp AS ch ON c.cheerer_id = ch.emp_id INNER JOIN emp_designation AS em ON ch.emp_id = em.emp_id INNER JOIN position AS p ON p.position_id = em.position_id INNER JOIN emp AS pe ON cd.peer_id = pe.emp_id INNER JOIN emp_designation AS em2 ON pe.emp_id = em2.emp_id INNER JOIN position AS p2 ON p2.position_id = em2.position_id WHERE c.cheer_post_id = ? ORDER BY posted_at DESC LIMIT 1`

    db.query(q, [cheer_post_id], (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
}

//Open Tagged Modal

function GetTaggedDetails(req, res){
    const cheer_post_id = req.body.cheer_post_id
    const q = `SELECT * FROM cheer_designation cd INNER JOIN emp e ON e.emp_id = cd.peer_id INNER JOIN emp_designation em ON em.emp_id = e.emp_id INNER JOIN position p ON em.position_id = p.position_id WHERE cd.cheer_post_id = ?`
  
    db.query(q, [cheer_post_id], (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
}

//Peers Who Cheered You Component

function GetRecentCheers(req, res) {
    const uid = req.session.user[0].emp_id;
    const q = "SELECT * FROM cheer_post AS c INNER JOIN cheer_designation AS cd ON c.cheer_post_id = cd.cheer_post_id INNER JOIN emp AS e ON c.cheerer_id = e.emp_id INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id INNER JOIN position AS p ON p.position_id = em.position_id WHERE cd.peer_id = ? ORDER BY c.cheer_post_id DESC LIMIT 4"

    db.query(q, [uid], (err, data) => {
        if (err) {
            res.send("error");
        } else {
            res.json(data)
        }
    })
}

//Transaction History Limited and All

function GetDataForMyNotifications(req,res){
    const uid = req.session.user[0].emp_id;
    //const q = "(SELECT cp.*, ec.f_name AS c_f_name, ec.s_name AS c_s_name, ep.f_name AS p_f_name, ep.s_name AS p_s_name FROM cheer_post cp INNER JOIN cheer_designation cd ON cp.cheer_post_id = cd.cheer_post_id INNER JOIN emp ec ON ec.emp_id = cd.peer_id INNER JOIN emp ep ON ep.emp_id = cp.cheerer_id WHERE cp.cheerer_id = ? OR cd.peer_id = ? ORDER BY posted_at DESC)"
    const q = `(SELECT cp.*, cd.heartbits_given AS hb_given, ec.f_name AS c_f_name, ec.s_name AS c_s_name, ep.f_name AS p_f_name, ep.s_name AS p_s_name FROM cheer_post cp INNER JOIN cheer_designation cd ON cp.cheer_post_id = cd.cheer_post_id INNER JOIN emp ec ON ec.emp_id = cd.peer_id INNER JOIN emp ep ON ep.emp_id = cp.cheerer_id WHERE cp.cheerer_id = ? OR cd.peer_id = ? ORDER BY posted_at DESC);`

    db.query(q, [uid, uid], (err, data) => {
        if (err) {
            res.send("error");
        } else {
            res.json(data);
        }
    });
}

function GetDataForMyNotificationsLimited(req,res){
    const uid = req.session.user[0].emp_id;
    //const q = "(SELECT cp.*, ec.f_name AS c_f_name, ec.s_name AS c_s_name, ep.f_name AS p_f_name, ep.s_name AS p_s_name FROM cheer_post cp INNER JOIN cheer_designation cd ON cp.cheer_post_id = cd.cheer_post_id INNER JOIN emp ec ON ec.emp_id = cd.peer_id INNER JOIN emp ep ON ep.emp_id = cp.cheerer_id WHERE cp.cheerer_id = ? OR cd.peer_id = ? ORDER BY posted_at DESC LIMIT 5)"
    const q = `(SELECT cp.*, cd.heartbits_given AS hb_given, ec.f_name AS c_f_name, ec.s_name AS c_s_name, ep.f_name AS p_f_name, ep.s_name AS p_s_name FROM cheer_post cp INNER JOIN cheer_designation cd ON cp.cheer_post_id = cd.cheer_post_id INNER JOIN emp ec ON ec.emp_id = cd.peer_id INNER JOIN emp ep ON ep.emp_id = cp.cheerer_id WHERE cp.cheerer_id = ? OR cd.peer_id = ? ORDER BY posted_at DESC LIMIT 5);`
    db.query(q, [uid, uid], (err, data) => {
        if (err) {
            res.send("error");
        } else {
            res.json(data);
        }
    });
}

//Recent Cheers Widget in Cheer Wall

function GetMyRecentCheersWidget(req, res) {
    const uid = req.session.user[0].emp_id;
    const q = `SELECT * FROM cheer_post cp INNER JOIN cheer_designation cd ON cp.cheer_post_id = cd.cheer_post_id INNER JOIN emp e ON e.emp_id = cp.cheerer_id INNER JOIN emp_designation em ON e.emp_id = em.emp_id INNER JOIN position p ON p.position_id = em.position_id WHERE cd.peer_id = ? ORDER BY cp.posted_at DESC LIMIT 5`

    db.query(q, [uid], (err, data) => {
        if (err) {
            res.send("error");
        } else {
            res.json(data);
        }
    });
}

//Most Popular 

function GetMostPopularCheersPost(req, res) {
    const cid = req.session.user[0].company_id;
    //const q = `SELECT c.*, ch.f_name AS cheerer_f_name, ch.s_name AS cheerer_s_name, p.position_name AS cheerer_job, pe.f_name AS peer_f_name, pe.s_name AS peer_s_name, p2.position_name AS peer_job, (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_likes cl ON cp.cheer_post_id = cl.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) AS num_likes, (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_comments cc ON cp.cheer_post_id = cc.cheer_post_id WHERE cc.cheer_post_id = c.cheer_post_id) AS num_comments FROM cheer_post AS c INNER JOIN emp AS ch ON c.cheerer_id = ch.emp_id INNER JOIN emp_designation AS em ON ch.emp_id = em.emp_id INNER JOIN position AS p ON p.position_id = em.position_id INNER JOIN emp AS pe ON c.peer_id = pe.emp_id INNER JOIN emp_designation AS em2 ON pe.emp_id = em2.emp_id INNER JOIN position AS p2 ON p2.position_id = em2.position_id WHERE em.company_id = ? ORDER BY posted_at DESC`
    //const q = `SELECT c.*, MAX(cd.heartbits_given) AS hb_given, MAX(ch.f_name) AS cheerer_f_name, MAX(ch.s_name) AS cheerer_s_name, MAX(p.position_name) AS cheerer_job, MAX(pe.f_name) AS peer_f_name, MAX(pe.s_name) AS peer_s_name, MAX(p2.position_name) AS peer_job, (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_likes cl ON cp.cheer_post_id = cl.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) AS num_likes, (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_comments cc ON cp.cheer_post_id = cc.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) AS num_comments, (SELECT COUNT(ccp.cheer_post_id) FROM cheer_designation ccp WHERE ccp.cheer_post_id = c.cheer_post_id) AS num_tagged FROM cheer_post AS c INNER JOIN cheer_designation cd ON c.cheer_post_id = cd.cheer_post_id INNER JOIN emp AS ch ON c.cheerer_id = ch.emp_id INNER JOIN emp_designation AS em ON ch.emp_id = em.emp_id INNER JOIN position AS p ON p.position_id = em.position_id INNER JOIN emp AS pe ON cd.peer_id = pe.emp_id INNER JOIN emp_designation AS em2 ON pe.emp_id = em2.emp_id INNER JOIN position AS p2 ON p2.position_id = em2.position_id WHERE em.company_id = ? GROUP BY c.cheer_post_id ORDER BY posted_at DESC`

    const q = `SELECT c.*, MAX(cd.heartbits_given) AS hb_given, MAX(ch.f_name) AS cheerer_f_name, MAX(ch.s_name) AS cheerer_s_name, MAX(p.position_name) AS cheerer_job, MAX(pe.f_name) AS peer_f_name, MAX(pe.s_name) AS peer_s_name, MAX(p2.position_name) AS peer_job, (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_likes cl ON cp.cheer_post_id = cl.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) AS num_likes, (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_comments cc ON cp.cheer_post_id = cc.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) AS num_comments,

    (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_likes cl ON cp.cheer_post_id = cl.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) + (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_comments cc ON cp.cheer_post_id = cc.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) AS num_engagements,
    
    (SELECT COUNT(ccp.cheer_post_id) FROM cheer_designation ccp WHERE ccp.cheer_post_id = c.cheer_post_id) AS num_tagged FROM cheer_post AS c INNER JOIN cheer_designation cd ON c.cheer_post_id = cd.cheer_post_id INNER JOIN emp AS ch ON c.cheerer_id = ch.emp_id INNER JOIN emp_designation AS em ON ch.emp_id = em.emp_id INNER JOIN position AS p ON p.position_id = em.position_id INNER JOIN emp AS pe ON cd.peer_id = pe.emp_id INNER JOIN emp_designation AS em2 ON pe.emp_id = em2.emp_id INNER JOIN position AS p2 ON p2.position_id = em2.position_id WHERE em.company_id = ? GROUP BY c.cheer_post_id ORDER BY num_engagements DESC`
    
    db.query(q, [cid], (err, data) => {
        if (err) {
            res.send("error");
        } else {
            res.json(data)
        }
    })
}

//My Cheers  

function GetMyCheersPost(req, res) {
    const uid = req.session.user[0].emp_id;
    
    const q = `SELECT c.*, cd.peer_id AS my_id, MAX(cd.heartbits_given) AS hb_given, MAX(ch.f_name) AS cheerer_f_name, MAX(ch.s_name) AS cheerer_s_name, MAX(p.position_name) AS cheerer_job, MAX(pe.f_name) AS peer_f_name, MAX(pe.s_name) AS peer_s_name, MAX(p2.position_name) AS peer_job, (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_likes cl ON cp.cheer_post_id = cl.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) AS num_likes, (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_comments cc ON cp.cheer_post_id = cc.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) AS num_comments, (SELECT COUNT(ccp.cheer_post_id) FROM cheer_designation ccp WHERE ccp.cheer_post_id = c.cheer_post_id) AS num_tagged FROM cheer_post AS c INNER JOIN cheer_designation cd ON c.cheer_post_id = cd.cheer_post_id INNER JOIN emp AS ch ON c.cheerer_id = ch.emp_id INNER JOIN emp_designation AS em ON ch.emp_id = em.emp_id INNER JOIN position AS p ON p.position_id = em.position_id INNER JOIN emp AS pe ON cd.peer_id = pe.emp_id INNER JOIN emp_designation AS em2 ON pe.emp_id = em2.emp_id INNER JOIN position AS p2 ON p2.position_id = em2.position_id WHERE cd.peer_id = ? GROUP BY c.cheer_post_id ORDER BY posted_at DESC`
    
    db.query(q, [uid], (err, data) => {
        if (err) {
            res.send("error");
        } else {
            res.json(data)
        }
    })
}

//Get Hashtags and Their Heartbits

function GetTopTenHashtags(req, res) {
    const uid = req.session.user[0].emp_id;
    
    const q = `SELECT hashtags, SUM(cd.heartbits_given) AS sum_hb FROM cheer_post cp INNER JOIN cheer_designation cd ON cp.cheer_post_id = cd.cheer_post_id WHERE hashtags IS NOT NULL GROUP BY hashtags ORDER BY sum_hb DESC LIMIT 5`
    
    db.query(q, (err, data) => {
        if (err) {
            res.send("error");
        } else {
            res.json(data)
        }
    })
}

// PAGINATION OPTIMIZED

function GetModifiedPaginatedCheersPost(req, res) {
    var cid = req.session.user[0].company_id;

    const { limit = 10, page = 1 } = req.query;

    const q1 = `SELECT COUNT(*) AS count FROM (SELECT c.*, MAX(cd.heartbits_given) AS hb_given, MAX(ch.f_name) AS cheerer_f_name, MAX(ch.s_name) AS cheerer_s_name, MAX(p.position_name) AS cheerer_job, MAX(pe.f_name) AS peer_f_name, MAX(pe.s_name) AS peer_s_name, MAX(p2.position_name) AS peer_job, (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_likes cl ON cp.cheer_post_id = cl.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) AS num_likes, (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_comments cc ON cp.cheer_post_id = cc.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) AS num_comments, (SELECT COUNT(ccp.cheer_post_id) FROM cheer_designation ccp WHERE ccp.cheer_post_id = c.cheer_post_id) AS num_tagged FROM cheer_post AS c INNER JOIN cheer_designation cd ON c.cheer_post_id = cd.cheer_post_id INNER JOIN emp AS ch ON c.cheerer_id = ch.emp_id INNER JOIN emp_designation AS em ON ch.emp_id = em.emp_id INNER JOIN position AS p ON p.position_id = em.position_id INNER JOIN emp AS pe ON cd.peer_id = pe.emp_id INNER JOIN emp_designation AS em2 ON pe.emp_id = em2.emp_id INNER JOIN position AS p2 ON p2.position_id = em2.position_id WHERE em.company_id = ? GROUP BY c.cheer_post_id ORDER BY posted_at DESC) a`

    db.query(q1, [cid], (err, data1) => {
        if (err){ 
            return res.json(err)
        } else { 
            const q2 = `SELECT c.*, MAX(cd.heartbits_given) AS hb_given, MAX(ch.f_name) AS cheerer_f_name, MAX(ch.s_name) AS cheerer_s_name, MAX(p.position_name) AS cheerer_job, MAX(pe.f_name) AS peer_f_name, MAX(pe.s_name) AS peer_s_name, MAX(p2.position_name) AS peer_job, (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_likes cl ON cp.cheer_post_id = cl.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) AS num_likes, (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_comments cc ON cp.cheer_post_id = cc.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) AS num_comments, (SELECT COUNT(ccp.cheer_post_id) FROM cheer_designation ccp WHERE ccp.cheer_post_id = c.cheer_post_id) AS num_tagged FROM cheer_post AS c INNER JOIN cheer_designation cd ON c.cheer_post_id = cd.cheer_post_id INNER JOIN emp AS ch ON c.cheerer_id = ch.emp_id INNER JOIN emp_designation AS em ON ch.emp_id = em.emp_id INNER JOIN position AS p ON p.position_id = em.position_id INNER JOIN emp AS pe ON cd.peer_id = pe.emp_id INNER JOIN emp_designation AS em2 ON pe.emp_id = em2.emp_id INNER JOIN position AS p2 ON p2.position_id = em2.position_id WHERE em.company_id = ? GROUP BY c.cheer_post_id ORDER BY posted_at DESC LIMIT ? OFFSET ? `
            
            let parsedLimit = parseInt(limit);
            let parsedPage = parseInt(page);
        
            let offset = (parsedPage - 1) * parsedLimit;

            const totalCount = data1[0].count
            const totalPages = Math.ceil(totalCount / parsedLimit);

            console.log("REQ QUERY: ", req.query)
            console.log("Parsed Limit: ", parsedLimit)
            console.log("OFFSITE",  offset)

            let pagination = {
                page: parsedPage,
                total_pages: totalPages,
                total: parseInt(totalCount),
                limit: parsedLimit,
                offset,
            };

            db.query(q2, [cid, parsedLimit, offset], (err, data2) => {
                if (err){ 
                    return res.json(err)
                } else { 
                    return res.json({ data2, pagination })
                }
            });
        }
    });
  
}

// PAGINATION OPTIMIZED

function GetPaginatedMyCheersPost(req, res) {
    const uid = req.session.user[0].emp_id;

    const { limit = 10, page = 1 } = req.query;

    const q1 = `SELECT COUNT(*) AS count FROM (SELECT c.*, cd.peer_id AS my_id, MAX(cd.heartbits_given) AS hb_given, MAX(ch.f_name) AS cheerer_f_name, MAX(ch.s_name) AS cheerer_s_name, MAX(p.position_name) AS cheerer_job, MAX(pe.f_name) AS peer_f_name, MAX(pe.s_name) AS peer_s_name, MAX(p2.position_name) AS peer_job, (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_likes cl ON cp.cheer_post_id = cl.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) AS num_likes, (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_comments cc ON cp.cheer_post_id = cc.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) AS num_comments, (SELECT COUNT(ccp.cheer_post_id) FROM cheer_designation ccp WHERE ccp.cheer_post_id = c.cheer_post_id) AS num_tagged FROM cheer_post AS c INNER JOIN cheer_designation cd ON c.cheer_post_id = cd.cheer_post_id INNER JOIN emp AS ch ON c.cheerer_id = ch.emp_id INNER JOIN emp_designation AS em ON ch.emp_id = em.emp_id INNER JOIN position AS p ON p.position_id = em.position_id INNER JOIN emp AS pe ON cd.peer_id = pe.emp_id INNER JOIN emp_designation AS em2 ON pe.emp_id = em2.emp_id INNER JOIN position AS p2 ON p2.position_id = em2.position_id WHERE cd.peer_id = ? GROUP BY c.cheer_post_id ORDER BY posted_at DESC) a`

    db.query(q1, [uid], (err, data1) => {
        if (err){ 
            return res.json(err)
        } else { 
            const q2 = `SELECT c.*, cd.peer_id AS my_id, MAX(cd.heartbits_given) AS hb_given, MAX(ch.f_name) AS cheerer_f_name, MAX(ch.s_name) AS cheerer_s_name, MAX(p.position_name) AS cheerer_job, MAX(pe.f_name) AS peer_f_name, MAX(pe.s_name) AS peer_s_name, MAX(p2.position_name) AS peer_job, (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_likes cl ON cp.cheer_post_id = cl.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) AS num_likes, (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_comments cc ON cp.cheer_post_id = cc.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) AS num_comments, (SELECT COUNT(ccp.cheer_post_id) FROM cheer_designation ccp WHERE ccp.cheer_post_id = c.cheer_post_id) AS num_tagged FROM cheer_post AS c INNER JOIN cheer_designation cd ON c.cheer_post_id = cd.cheer_post_id INNER JOIN emp AS ch ON c.cheerer_id = ch.emp_id INNER JOIN emp_designation AS em ON ch.emp_id = em.emp_id INNER JOIN position AS p ON p.position_id = em.position_id INNER JOIN emp AS pe ON cd.peer_id = pe.emp_id INNER JOIN emp_designation AS em2 ON pe.emp_id = em2.emp_id INNER JOIN position AS p2 ON p2.position_id = em2.position_id WHERE cd.peer_id = ? GROUP BY c.cheer_post_id ORDER BY posted_at DESC LIMIT ? OFFSET ? `
            
            let parsedLimit = parseInt(limit);
            let parsedPage = parseInt(page);
        
            let offset = (parsedPage - 1) * parsedLimit;

            const totalCount = data1[0].count
            const totalPages = Math.ceil(totalCount / parsedLimit);

            console.log("REQ QUERY: ", req.query)
            console.log("Parsed Limit: ", parsedLimit)
            console.log("OFFSITE",  offset)

            let pagination = {
                page: parsedPage,
                total_pages: totalPages,
                total: parseInt(totalCount),
                limit: parsedLimit,
                offset,
            };

            db.query(q2, [uid, parsedLimit, offset], (err, data2) => {
                if (err){ 
                    return res.json(err)
                } else { 
                    return res.json({ data2, pagination })
                }
            });
        }
    });
}

function GetPaginatedMostEngagedPosts(req, res) {
    var cid = req.session.user[0].company_id;

    const { limit = 10, page = 1 } = req.query;

    const q1 = `SELECT COUNT(*) AS count FROM (
        SELECT c.*, MAX(cd.heartbits_given) AS hb_given, MAX(ch.f_name) AS cheerer_f_name, MAX(ch.s_name) AS cheerer_s_name, MAX(p.position_name) AS cheerer_job, MAX(pe.f_name) AS peer_f_name, MAX(pe.s_name) AS peer_s_name, MAX(p2.position_name) AS peer_job, (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_likes cl ON cp.cheer_post_id = cl.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) AS num_likes, (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_comments cc ON cp.cheer_post_id = cc.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) AS num_comments,

    (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_likes cl ON cp.cheer_post_id = cl.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) + (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_comments cc ON cp.cheer_post_id = cc.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) AS num_engagements,
    
    (SELECT COUNT(ccp.cheer_post_id) FROM cheer_designation ccp WHERE ccp.cheer_post_id = c.cheer_post_id) AS num_tagged FROM cheer_post AS c INNER JOIN cheer_designation cd ON c.cheer_post_id = cd.cheer_post_id INNER JOIN emp AS ch ON c.cheerer_id = ch.emp_id INNER JOIN emp_designation AS em ON ch.emp_id = em.emp_id INNER JOIN position AS p ON p.position_id = em.position_id INNER JOIN emp AS pe ON cd.peer_id = pe.emp_id INNER JOIN emp_designation AS em2 ON pe.emp_id = em2.emp_id INNER JOIN position AS p2 ON p2.position_id = em2.position_id WHERE em.company_id = ? GROUP BY c.cheer_post_id ORDER BY num_engagements DESC
    ) a`

    db.query(q1, [cid], (err, data1) => {
        if (err){ 
            return res.json(err)
        } else { 
            const q2 = `SELECT c.*, MAX(cd.heartbits_given) AS hb_given, MAX(ch.f_name) AS cheerer_f_name, MAX(ch.s_name) AS cheerer_s_name, MAX(p.position_name) AS cheerer_job, MAX(pe.f_name) AS peer_f_name, MAX(pe.s_name) AS peer_s_name, MAX(p2.position_name) AS peer_job, (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_likes cl ON cp.cheer_post_id = cl.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) AS num_likes, (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_comments cc ON cp.cheer_post_id = cc.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) AS num_comments,

            (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_likes cl ON cp.cheer_post_id = cl.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) + (SELECT COUNT(*) FROM cheer_post cp INNER JOIN cheer_comments cc ON cp.cheer_post_id = cc.cheer_post_id WHERE cp.cheer_post_id = c.cheer_post_id) AS num_engagements,
            
            (SELECT COUNT(ccp.cheer_post_id) FROM cheer_designation ccp WHERE ccp.cheer_post_id = c.cheer_post_id) AS num_tagged FROM cheer_post AS c INNER JOIN cheer_designation cd ON c.cheer_post_id = cd.cheer_post_id INNER JOIN emp AS ch ON c.cheerer_id = ch.emp_id INNER JOIN emp_designation AS em ON ch.emp_id = em.emp_id INNER JOIN position AS p ON p.position_id = em.position_id INNER JOIN emp AS pe ON cd.peer_id = pe.emp_id INNER JOIN emp_designation AS em2 ON pe.emp_id = em2.emp_id INNER JOIN position AS p2 ON p2.position_id = em2.position_id WHERE em.company_id = ? GROUP BY c.cheer_post_id ORDER BY num_engagements DESC
            LIMIT ? OFFSET ? `
            
            let parsedLimit = parseInt(limit);
            let parsedPage = parseInt(page);
        
            let offset = (parsedPage - 1) * parsedLimit;

            const totalCount = data1[0].count
            const totalPages = Math.ceil(totalCount / parsedLimit);

            console.log("REQ QUERY: ", req.query)
            console.log("Parsed Limit: ", parsedLimit)
            console.log("OFFSITE",  offset)

            let pagination = {
                page: parsedPage,
                total_pages: totalPages,
                total: parseInt(totalCount),
                limit: parsedLimit,
                offset,
            };

            db.query(q2, [cid, parsedLimit, offset], (err, data2) => {
                if (err){ 
                    return res.json(err)
                } else { 
                    return res.json({ data2, pagination })
                }
            });
        }
    });
}


module.exports = { 
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

    //Likes Modal
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

    //Hashtags
    GetHashtags,

    GetTopTenHashtags,

    //Paginated Optimized
    GetModifiedPaginatedCheersPost,
    GetPaginatedMyCheersPost,
    GetPaginatedMostEngagedPosts
}