var express = require("express");
var imports =  {
    AddTaskNotes,
    GetNoteDetails,
    InsertTaskNotes
} = require( "../controller/task_notes_controller.js");

const router = express.Router()

router.post("/tc-insertTaskNotes", InsertTaskNotes)
router.post("/tc-addTaskNotes", AddTaskNotes);
router.post("/tc-getTaskNotes", GetNoteDetails);

module.exports = router;