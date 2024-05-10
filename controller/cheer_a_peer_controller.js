var db = require("../config.js");

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
                const q2 = "INSERT INTO heartbits (`emp_id`, `heartbits_balance`) VALUES (?)"
                console.log(2);

                const values = [uid,0]
                
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
        if (err){
           console.log(err)
        } else {
           console.log(data)
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

function GetPeers(req, res) {
    const cid = req.session.user[0].company_id;
    const q = "SELECT * FROM emp AS e INNER JOIN emp_designation AS em ON em.emp_id = e.emp_id WHERE em.company_id = ? ORDER BY e.f_name"

    db.query(q, [cid], (err, data) => {
        if (err) {
            res.send("error");
        } else {
            res.json(data);
        }
    });
}





module.exports = { 
    GetMyHeartbitsData,
    CreateACheerPost,
    GetRecentCheers,
    GetPeers,
    GetMostRecentCheer,
}