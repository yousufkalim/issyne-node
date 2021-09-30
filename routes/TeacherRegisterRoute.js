const express = require("express");
const router = express.Router();
const multer = require("multer");
const bcrypt = require("bcrypt");

const Firebase = require("firebase-admin");
const db = Firebase.database();
const userRef = db.ref("teacher");
const studentRef = db.ref("student");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  // if (file.mimeType === 'image/jpeg' || file.mimeType === 'image/png')
  cb(null, true);
  //else {
  //cb (Error('Invalid File Format'), false);
  // }
};
const upload = multer({
  storage: storage,
  // limits: {
  //   fileSize: 1024 * 1024 * 5,
  // },
  fileFilter: fileFilter,
});

router.get("/find", async (req, res) => {
  try {
    userRef.once("value", async function (snapshot) {
      if (snapshot.val() === null)
        res.json({ message: "Aucune donnée disponible" });
      else {
        const response = [];
        snapshot.forEach(function (childSnapshot) {
          response.push(childSnapshot.val());
        });
        res.json({ response });
      }
    });
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.post(
  "/register",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "idCard", maxCount: 1 },
    { name: "kbis", maxCount: 1 },
    { name: "diploma", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const profile = req.files["profileImage"][0];
      const idCardFile = req.files["idCard"][0];
      const kbisFile = req.files["kbis"][0];
      const diplomaFile = req.files["diploma"][0];
      var data = JSON.parse(JSON.stringify(req.body));
      data.avatar = profile.path;
      data.idCard = idCardFile.path;
      data.kbis = kbisFile.path;
      data.diploma = diplomaFile.path;
      data.isActive = true;
      data.rating = 3;
      data.isSocial =
        req.body.isSocial === "false" || req.body.isSocial === false
          ? false
          : true;
      data.type = "teacher";
      userRef
        .orderByChild("email")
        .equalTo(data.email)
        .once("value", async function (snapshot) {
          if (snapshot.val() === null) {
            studentRef
              .orderByChild("email")
              .equalTo(data.email)
              .once("value", async function (snapshot) {
                if (snapshot.val() === null) {
                  const hashedPassword = await bcrypt.hash(
                    req.body.password,
                    10
                  );
                  const response = { ...data };
                  data.password = hashedPassword;
                  await userRef.push(data, function (err) {
                    if (err) res.send(err);
                    else
                      res.json({
                        response: response,
                      });
                  });
                } else res.json({ messge: "L'email existe déjà" });
              });
          } else res.json({ messge: "L'email existe déjà" });
        });
    } catch (error) {
      res.json({ message: error.message });
    }
  }
);

router.post(
  "/register_social",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "idCard", maxCount: 1 },
    { name: "kbis", maxCount: 1 },
    { name: "diploma", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const profile = req.files["profileImage"][0];
      const idCardFile = req.files["idCard"][0];
      const kbisFile = req.files["kbis"][0];
      const diplomaFile = req.files["diploma"][0];
      var data = JSON.parse(JSON.stringify(req.body));
      data.avatar = profile.path;
      data.idCard = idCardFile.path;
      data.kbis = kbisFile.path;
      data.diploma = diplomaFile.path;
      data.isActive = true;
      data.rating = 3;
      data.isSocial =
        req.body.isSocial === "false" || req.body.isSocial === false
          ? false
          : true;
      data.type = "teacher";
      userRef
        .orderByChild("email")
        .equalTo(data.email)
        .once("value", async function (snapshot) {
          if (snapshot.val() === null) {
            studentRef
              .orderByChild("email")
              .equalTo(data.email)
              .once("value", async function (snapshot) {
                if (snapshot.val() === null) {
                  const hashedPassword = await bcrypt.hash(
                    req.body.password,
                    10
                  );
                  const response = { ...data };
                  data.password = hashedPassword;
                  await userRef.push(data, function (err) {
                    if (err) res.send(err);
                    else
                      res.json({
                        response: response,
                      });
                  });
                } else res.json({ messge: "L'email existe déjà" });
              });
          } else res.json({ messge: "L'email existe déjà" });
        });
    } catch (error) {
      res.json({ message: "Tous les champs sont requis" });
  }
  });
module.exports = router;
