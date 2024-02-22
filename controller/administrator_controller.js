var db = require("../config.js");
const bcrypt = require("bcryptjs");

function AdminLoginHandler(req, res) {
    if (req.session.user) {
        res.send({ loggedIn: true, user: req.session.user });
    } else {
        res.send({ loggedIn: false });
    }
}

function AdminLogout(req, res) {
    if (req.session.user) {
      res.clearCookie('userId');
      res.clearCookie('HRISUserCookie');
      req.session.destroy();
      res.send({loggedIn: false})
    }
};

function AdminLogin(req, res) {
    const work_email = req.body.work_email;
    const password = req.body.password;
  
    db.query(
      //"SELECT * FROM emp WHERE work_email = ?",
      "SELECT * FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id WHERE e.work_email = ? AND e.emp_role = 0",
      [work_email],
      (err, result) => {
        if (err) {
          res.send(err);
        } else if (result.length > 0) {
          console.log(result[0].password);
          const hash = result[0].password;
  
          bcrypt.compare(password, hash, (err, match) => {
            if (err) console.log(err);
            else {
              if (match) {
                req.session.user = result;
                console.log(req.session.user);
                res.send(result[0]);
              } else {
                res.send("error");
              }
            }
          });
        }
        else {
          res.send("error");
        }
      }
    )
};

module.exports = 
{ 
  AdminLoginHandler, 
  AdminLogout, 
  AdminLogin 
};