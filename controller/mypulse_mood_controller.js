var db = require("../config.js");
var moment = require("moment");

function InsertMoodEntry(req, res) {
    var uid = req.session.user[0].emp_id;
    var me = req.body.chosenMood;

    console.log(JSON.stringify(req.body.chosenMood))
    const values = [me, uid]

    const q = "INSERT INTO pulse_mood (`mood_entry`, `emp_id`) VALUES (?)"

    db.query(q, [values], (err, data) => {
        if (err){
            console.log(err)
        } else {
            console.log("Added.")
        }
    })
}

function GetMostRecentMood(req, res) {
    var uid = req.session.user[0].emp_id

    const q = "SELECT * FROM pulse_mood WHERE emp_id = ? ORDER BY date_of_entry DESC"

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

function GetAverageMoodForWeek(req, res){
    var uid = req.session.user[0].emp_id

    const startOfWeek = moment().startOf('week').format('YYYY-MM-DD hh:mm');
    const endOfWeek   = moment().endOf('week').format('YYYY-MM-DD hh:mm');

    const q = "SELECT AVG(mood_entry) AS mood_average FROM pulse_mood WHERE emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)"

    db.query(q, [uid, startOfWeek, endOfWeek], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function GetAverageMoodForLastWeek(req, res){
    var uid = req.session.user[0].emp_id

    const startOfWeek = moment().subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD hh:mm');
    const endOfWeek   = moment().subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD hh:mm');

    const q = "SELECT AVG(mood_entry) AS mood_average FROM pulse_mood WHERE emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)"

    db.query(q, [uid, startOfWeek, endOfWeek], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function GetAverageMoodForMonth(req, res){
    var uid = req.session.user[0].emp_id

    const startOfMonth = moment().startOf('month').format('YYYY-MM-DD hh:mm');
    const endOfMonth   = moment().endOf('month').format('YYYY-MM-DD hh:mm');

    const q = "SELECT AVG(mood_entry) AS mood_average FROM pulse_mood WHERE emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)"

    db.query(q, [uid, startOfMonth, endOfMonth], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function GetMostRecentMoodsLimited(req, res) {
    var uid = req.session.user[0].emp_id

    const q = "SELECT * FROM pulse_mood WHERE emp_id = ? ORDER BY date_of_entry DESC LIMIT 5"

    db.query(q, [uid, moment()], (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

module.exports = {
    GetMostRecentMood,
    GetMoodsForDay,
    GetMoodsForWeek,
    GetMoodsLastWeek,
    GetMoodsRecentMonth,
    InsertMoodEntry,
    GetAverageMoodForWeek,
    GetAverageMoodForMonth,
    GetMostRecentMoodsLimited,
    GetAverageMoodForLastWeek,
};