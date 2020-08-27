const express = require ('express');
const router = express.Router ();


const Firebase = require ('firebase-admin');
const db = Firebase.database ();
const studentRef = db.ref ('student');
const teacherRef = db.ref ('teacher');
const creditRoute = db.ref('credit');
const ratingRoute = db.ref('rating');
const chatRef = db.ref('chat');
router.get ('/get_student', async (req, res) => {


    studentRef.once('value',async function(snapshot){

        console.log(snapshot.val());

    });



    });

module.exports = router;
