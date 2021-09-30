const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");

const Firebase = require("firebase-admin");
const db = Firebase.database();
const studentRef = db.ref("student");
const teacherRef = db.ref("teacher");

router.post("/login", async (req, res) => {
  var data = JSON.parse(JSON.stringify(req.body));

  studentRef
    .orderByChild("email")
    .equalTo(data.email)
    .once("value", async function (snapshot) {
      if (snapshot.val() === null) {
        teacherRef
          .orderByChild("email")
          .equalTo(data.email)
          .once("value", async function (snapshot) {
            if (snapshot.val() === null) {
              res.json({ message: "L'e-mail n'existe pas" });
            } else {
              const val = snapshot.val();
              var key = Object.keys(snapshot.val())[0];

              if (await bcrypt.compare(req.body.password, val[key].password)) {
                snapshot.forEach(async function (childSnapshot) {
                  const clone = { ...childSnapshot.val() };
                  const nodeRef = db.ref("teacher/" + childSnapshot.key);

                  clone.token = req.body.token;
                  await nodeRef.update(clone);
                  res.json(childSnapshot);
                });
              } else
                res.json({
                  message: "Identifiants non valides",
                  success: false,
                });
            }
          });
      } else {
        const val = snapshot.val();
        var key = Object.keys(snapshot.val())[0];

        if (await bcrypt.compare(req.body.password, val[key].password)) {
          console.log("compared");
          snapshot.forEach(async function (childSnapshot) {
            const clone = { ...childSnapshot.val() };
            const nodeRef = db.ref("student/" + childSnapshot.key);
            clone.token = req.body.token;
            await nodeRef.update(clone);
            res.json(childSnapshot);
          });
        } else
          res.json({
            message: "Identifiants non valides",
            success: false,
          });
      }
    });
});

router.post("/login_social", async (req, res) => {
  var data = JSON.parse(JSON.stringify(req.body));

  studentRef
    .orderByChild("email")
    .equalTo(data.email)
    .once("value", async function (snapshot) {
      if (snapshot.val() === null) {
        teacherRef
          .orderByChild("email")
          .equalTo(data.email)
          .once("value", async function (snapshot) {
            if (snapshot.val() === null) {
              //Then register as a social account

              res.json({
                success: true,
                message:
                  "Remplissez le formulaire De à Compléter l'enregistrement.",
                isSocial: true,
              });
            } else {
              const val = snapshot.val();
              var key = Object.keys(snapshot.val())[0];
              // If Teacher Email Exists As A Social Account
              if (val[key].isSocial) {
                snapshot.forEach(async function (childSnapshot) {
                  const clone = { ...childSnapshot.val() };
                  const nodeRef = db.ref("teacher/" + childSnapshot.key);

                  clone.token = req.body.token;
                  await nodeRef.update(clone);
                  return res.json(childSnapshot);
                });
              } // If Teacher Email Exists Then Check If It's Not A Social Account
              else
                res.json({
                  message:
                    "E-mail enregistré en tant que compte non social Veuillez saisir le mot de passe",
                  success: false,
                });
            }
          });
      } else {
        const val = snapshot.val();
        var key = Object.keys(snapshot.val())[0];
        // If Student Email Exists But As A  Social Account
        if (val[key].isSocial) {
          console.log("compared");
          snapshot.forEach(async function (childSnapshot) {
            const clone = { ...childSnapshot.val() };
            console.log(JSON.stringify(childSnapshot.key, null, 2));
            const nodeRef = db.ref("student/" + childSnapshot.key);
            clone.token = req.body.token;
            await nodeRef.update(clone);
            return res.json(childSnapshot);
          });
        }
        // If Student Email Exists As A Non Socail Account
        else
          res.json({
            message:
              "E-mail enregistré en tant que compte non social Veuillez saisir le mot de passe",
            success: false,
          });
      }
    });
});
module.exports = router;
