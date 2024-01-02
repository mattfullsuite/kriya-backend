var db = require("../../config.js");
const bcrypt = require("bcryptjs");

module.exports = function processLogin(req, res) {
  const work_email = req.body.work_email;
  const password = req.body.password;

  db.query(
    "SELECT * FROM emp WHERE work_email = ?",
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
  );

  //   const work_email = req.body.work_email
  //   const password = req.body.password

  //   const q = "SELECT * FROM emp WHERE work_email = ?"

  //   db.query(q, [work_email], (err, result) => {
  //     if(err) {
  //         res.send(err)
  //     }
  //     else if( result == 1) {
  //         // const hash = result[0].password
  //         console.log(result[0].password)

  // bcrypt.compare(password, hash, (err, match) => {

  //     if(err) console.log(err)
  //     else {
  //         if(match) {
  //             req.session.user = result
  //             console.log(req.session.user)
  //             res.send(result[0]);
  //         }
  //         else {
  //             res.send({ message: "Wrong username/password combination"})
  //         }
  //     }
  // })
  //     }
  //   })
};
