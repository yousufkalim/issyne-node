const express = require("express");
const router = express.Router();
const Firebase = require("firebase-admin");

router.post("/report_teacher", async function (req, res) {
  var data = JSON.parse(JSON.stringify(req.body));
  console.log(data);
  if (data.report === undefined || data.report.length === 0) {
    // CHECK IF THE TEXT SENT WAS EMPTY
    res.json({
      success: false,
      message: "Vous devez justifier la soumission",
    });
  }
  const reportRef = Firebase.database().ref("report_teacher");
  const param = {
    studentEmail: data.studentEmail,
    teacherEmail: data.teacherEmail,
    report: data.report,
    chatKey: data.chatKey,
  };
  try {
    reportRef.push(param);
    res.json({ success: true, message: "rapport soumis" });
  } catch (err) {
    res.json({
      success: false,
      message: "quelque chose s'est mal passé essaie encore",
    });
  }
});

module.exports = router;
