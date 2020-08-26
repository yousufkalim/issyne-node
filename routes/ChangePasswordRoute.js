const express = require("express");
const router = express.Router();
const Firebase = require("firebase-admin");
var nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

const db = Firebase.database();

const teacherDb = db.ref("teacher");
const studentDb = db.ref("student");

router.post("/forgot_password", async function (req, res) {
  teacherDb
    .orderByChild("email")
    .equalTo(req.body.email)
    .once("value", async function (snapshot) {
      if (snapshot.val() === null) {
        // email does not exist on teacher side
        studentDb
          .orderByChild("email")
          .equalTo(req.body.email)
          .once("value", async function (snapshot) {
            if (snapshot.val() === null) {
              // the email does not exist
              res.json({ success: false, message: "The email does not exist" });
            } else {
              console.log("student");

              snapshot.forEach(async function (childsnapshot) {
                var randomPassword = Math.random().toString(36).slice(-8);
                const hashedPassword = await bcrypt.hash(randomPassword, 10);
                const clone = { ...childsnapshot.val() };
                clone.password = hashedPassword;
                const updatePasswordRef = db.ref(
                  "student/" + childsnapshot.key
                );
                updatePasswordRef.update(clone);
                sendEmail(req.body.email, randomPassword, res);
              });
            } // student email exists
          });
      } else {
        console.log("teacher");

        snapshot.forEach(async function (childsnapshot) {
          var randomPassword = Math.random().toString(36).slice(-8);
          const hashedPassword = await bcrypt.hash(randomPassword, 10);
          const clone = { ...childsnapshot.val() };
          clone.password = hashedPassword;
          const updatePasswordRef = db.ref("teacher/" + childsnapshot.key);
          updatePasswordRef.update(clone);
          sendEmail(req.body.email, randomPassword, res);
        });
      } // email exists on teacher side
    });
});

function sendEmail(email, password, res) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "yousaf.falcon321@gmail.com",
      pass: "yousafFalcon123",
    },
  });

  var mailOptions = {
    from: "yousaf.falcon321@gmail.com",
    to: "yousaf.butt25@yahoo.com",
    subject: "Your New Password Is",
    text: password,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      res.json({ success: false, message: "Something Went Wrong" });
    } else {
      res.json({ success: true, message: "Password Changed" });

      console.log("Email sent: " + info.response);
    }
  });
}

module.exports = router;
