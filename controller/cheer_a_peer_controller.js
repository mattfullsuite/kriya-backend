var db = require("../config.js");

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
                   console.log("error");
                   res.send("error")
                } else {
                   console.log("success");
                //    res.send("success")
                   const cheerer_q = "UPDATE heartbits SET `heartbits_balance` = `heartbits_balance` - " + req.body.heartbits_given + " WHERE emp_id = " + uid;

                   db.query(cheerer_q, (err, data) => {
                        if (err) {
                            console.log("error");
                        } else {
                            console.log(data);
                        }
                    })

                    const peer_q = "UPDATE heartbits SET `total_heartbits` = `total_heartbits` + " + req.body.heartbits_given + " WHERE emp_id = " + req.body.peer_id;

                    db.query(peer_q, (err, data) => {
                        if (err) {
                            console.log("error");
                        } else {
                            res.send("success");
                        }
                    })
                }
            } catch(e) {
                res.send("error");
            }

    })

}

function GetMostRecentCheer(req, res) {
    const uid = req.session.user[0].company_id;
    const q = "SELECT * FROM cheer_post AS cp INNER JOIN emp AS e ON cheerer_id = e.emp_id INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id INNER JOIN position AS p ON em.position_id = p.position_id WHERE em.company_id = ? ORDER BY cheer_post_id DESC LIMIT 1"

    db.query(q, [uid], (err, data) => {
        if (err) {
            res.send("error");
        } else {
            res.json(data);
        }
    })
}

function GetRecentCheers(req, res) {
    const uid = req.session.user[0].emp_id;
    const q = "SELECT * FROM cheer_post AS c INNER JOIN emp AS e ON c.cheerer_id = e.emp_id INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id INNER JOIN position AS p ON p.position_id = em.position_id WHERE c.peer_id = ? ORDER BY c.cheer_post_id DESC LIMIT 4"

    db.query(q, [uid], (err, data) => {
        if (err) {
            res.send("error");
        } else {
            res.json(data)
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

function AddCommentToCheerPost(req, res) {
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
        //res.json("success");
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
            console.log(data);
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
            console.log(data);
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
            console.log(data);
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
            console.log(data);
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
            console.log(data);
        }
    });
}

//SELECT dept_name, SUM(cheers_total) AS total_cheers FROM (SELECT de.dept_name AS dept_name, COUNT(de.dept_id) AS cheers_total FROM cheer_post cp LEFT JOIN emp_designation ed ON ed.emp_id = cp.cheerer_id LEFT JOIN position p ON ed.position_id = p.position_id LEFT JOIN dept de ON de.dept_id = p.dept_id WHERE ed.company_id = 1 GROUP BY de.dept_name UNION ALL SELECT de.dept_name AS dept_name, COUNT(de.dept_id) AS cheers_total FROM cheer_post cp LEFT JOIN emp_designation ed ON ed.emp_id = cp.peer_id LEFT JOIN position p ON ed.position_id = p.position_id LEFT JOIN dept de ON de.dept_id = p.dept_id WHERE ed.company_id = 1 GROUP BY de.dept_name) t GROUP BY dept_name



module.exports = { 
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
}