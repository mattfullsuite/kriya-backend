var db = require("../config.js");
var moment = require("moment");

function GetAllLeaves(req, res){
    var cid = req.session.user[0].company_id
    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id WHERE em.company_id = ?"

    db.query(q, cid, (err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function GetAllPaidLeaves(req, res){
    var cid = req.session.user[0].company_id
    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id WHERE l.use_pto_points > 0 AND em.company_id = ?"

    db.query(q, cid, (err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function GetAllBetweenDateLeaves(req, res){
    var cid = req.session.user[0].company_id
    const lf = req.body.leave_from;
    const lt = req.body.leave_to;

    console.log(lf)
    console.log(lt)

    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id WHERE (leave_from > ?) AND (leave_to < ?) AND em.company_id = ?"

    db.query(q, [lf, lt, cid], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function GetAllPaidBetweenDateLeaves(req, res){
    var cid = req.session.user[0].company_id
    const lf = req.body.leave_from;
    const lt = req.body.leave_to;

    console.log(lf)
    console.log(lt)

    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id WHERE (leave_from > ?) AND (leave_to < ?) AND use_pto_points > 0 AND em.company_id = ?"

    db.query(q, [lf, lt, cid], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function GetAllOvertimes(req, res){
    var cid = req.session.user[0].company_id
    const q = "SELECT * FROM overtime AS o INNER JOIN emp AS e ON o.requester_id = e.emp_id INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id WHERE em.company_id = ?"

    db.query(q, cid, (err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

//Revamped Version

function GetAllCompanyMasterlist(req, res){
    const {searchterm = ""} = req.query;
    var cid = req.session.user[0].company_id;

    var st = `%${searchterm}%`

    const q = `SELECT * FROM emp AS e
    INNER JOIN emp_designation ed ON e.emp_id = ed.emp_id 
    INNER JOIN emp_shift AS es ON e.emp_num = es.emp_num
    INNER JOIN position AS p ON ed.position_id = p.position_id
    WHERE ed.company_id = ? AND 
    CONCAT(e.emp_num, e.f_name, e.s_name, e.m_name, e.work_email, e.personal_email, 
        e.p_address, e.c_address, e.emp_status, e.emergency_contact_name, e.emergency_contact_num,
        e.sex, e.civil_status, p.position_name, es.shift_type) 
        LIKE ? 
        AND (e.date_separated IS NULL OR CURDATE() < e.date_separated) 
        ORDER BY e.emp_num ASC`

    db.query(q, [cid, st], (err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function GetAllCompanyLeaves(req, res){
    const { searchterm = "", ispaid = 0, startdate = `1990-01-01`, lastdate = `2050-01-01`} = req.query;
    var cid = req.session.user[0].company_id

    var sd = moment(startdate).format("YYYY-MM-DD")
    var ld = moment(lastdate).format("YYYY-MM-DD")
    var st = `%${searchterm}%`

    console.log("isPaid: ", ispaid)
    console.log("startDate: ", sd)
    console.log("lastDate: ", ld)
    console.log("searchTerm: ", st)

    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id WHERE em.company_id = ? AND l.use_pto_points >= ? AND (l.leave_from > ?) AND (l.leave_from < ?) AND CONCAT(e.emp_num, e.f_name, e.s_name, l.leave_type) LIKE ?"

    db.query(q, [cid, ispaid, sd, ld, st], (err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function GetAllCompanyPTOs(req, res){
    const {searchterm = ""} = req.query;
    var cid = req.session.user[0].company_id;

    var st = `%${searchterm}%`

    const q = "SELECT * FROM leave_credits lc INNER JOIN emp e ON lc.emp_id = e.emp_id INNER JOIN emp_designation ed ON e.emp_id = ed.emp_id WHERE ed.company_id = ? AND (e.date_separated IS NULL OR CURDATE() < e.date_separated) AND CONCAT(e.emp_num, e.f_name, e.s_name, e.m_name, e.emp_status) LIKE ?"

    db.query(q, [cid, st], (err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function GetAllCompanyOvertime(req, res){
    const { searchterm = "", startdate = `1990-01-01`, lastdate = `2050-01-01`} = req.query;
    var cid = req.session.user[0].company_id

    var sd = moment(startdate).format("YYYY-MM-DD")
    var ld = moment(lastdate).format("YYYY-MM-DD")
    var st = `%${searchterm}%`

    console.log("startDate: ", sd)
    console.log("lastDate: ", ld)
    console.log("searchTerm: ", st)

    const q = `SELECT * FROM overtime AS o 
    INNER JOIN emp AS e ON o.requester_id = e.emp_id 
    INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id 
    WHERE em.company_id = ? AND (o.overtime_date > ?) AND (o.overtime_date < ?) AND CONCAT(e.emp_num, e.f_name, e.s_name, o.overtime_type) LIKE ?`

    db.query(q, [cid, sd, ld, st], (err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}


module.exports = {
    GetAllLeaves,
    GetAllPaidLeaves,
    GetAllBetweenDateLeaves,
    GetAllPaidBetweenDateLeaves,
    GetAllOvertimes,

    //Company Revamped Reports
    GetAllCompanyLeaves,
    GetAllCompanyPTOs,
    GetAllCompanyOvertime,
    GetAllCompanyMasterlist
}