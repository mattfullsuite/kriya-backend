var db = require("../config.js");
var moment = require("moment");

function GetMostRecentMood(req, res) {
    var uid = req.session.user[0].emp_id

    const q = "SELECT * FROM pulse_mood WHERE emp_id = ? ORDER BY date_of_entry DESC LIMIT 1"

    db.query(q, [uid, moment()], (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

function GetMoodsForDay(req, res) {
    var uid = req.session.user[0].emp_id

    const q = "SELECT * FROM pulse_mood WHERE emp_id = ? AND date_of_entry = ?"

    db.query(q, [uid, moment()], (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

function GetMoodsForWeek(req, res){

    //.subtract(1, 'months')
    var uid = req.session.user[0].emp_id

    const startOfWeek = moment().startOf('week').format('YYYY-MM-DD hh:mm');
    const endOfWeek   = moment().endOf('week').format('YYYY-MM-DD hh:mm');

    const q = "SELECT * FROM pulse_mood WHERE emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?) ORDER BY date_of_entry"

    db.query(q, [uid, startOfWeek, endOfWeek], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function GetMoodsLastWeek(req, res){
    var uid = req.session.user[0].emp_id

    const startOfWeek = moment().subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD hh:mm');
    const endOfWeek   = moment().subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD hh:mm');

    const q = "SELECT * FROM pulse_mood WHERE emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?) ORDER BY date_of_entry"

    db.query(q, [uid, startOfWeek, endOfWeek], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function GetMoodsRecentMonth(req, res){
    var uid = req.session.user[0].emp_id

    const startOfMonth = moment().startOf('month').format('YYYY-MM-DD hh:mm');
    const endOfMonth   = moment().endOf('month').format('YYYY-MM-DD hh:mm');

    const q = "SELECT * FROM pulse_mood WHERE emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?) ORDER BY date_of_entry"

    db.query(q, [uid, startOfMonth, endOfMonth], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

module.exports = {
    GetMostRecentMood,
    GetMoodsForDay,
    GetMoodsForWeek,
    GetMoodsLastWeek,
    GetMoodsRecentMonth,
};