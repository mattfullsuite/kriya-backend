var db = require("../config.js");

function AllAnnouncements(req, res) {

    const q = "SELECT * FROM announcements AS a INNER JOIN emp AS e ON a.emp_id=e.emp_id LIMIT 3" 
    db.query(q,(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
};

function DeleteAnnouncement(req, res) {

}

module.exports = {
  AllAnnouncements,
};