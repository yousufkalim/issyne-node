const express = require ('express');
const router = express.Router ();
const Firebase = require ('firebase-admin');
const {param} = require ('./ChatRoute');

router.post ('/report_teacher', async function (req, res) {
  var data = JSON.parse (JSON.stringify (req.body));
    console.log(data)
  if (data.report === undefined || data.report.length === 0) {
    // CHECK IF THE TEXT SENT WAS EMPTY
    res.json ({
      success: false,
      message: 'You need to give reason in order to submit',
    });
  }
  const reportRef = Firebase.database ().ref ('report_teacher');
  const param = {
    studentEmail: data.studentEmail,
    teacherEmail: data.teacherEmail,
    report: data.report,
  };
  try {
    reportRef.push (param);
    res.json ({success: true, message: 'report submitted'});
  } catch (err) {
    res.json ({success: false, message: 'something went wrong try again'});
  }
});

module.exports = router;
