const express = require("express");
const router = express.Router();
const multer = require("multer");
const bcrypt = require("bcrypt");
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

const Firebase = require("firebase-admin");
const db = Firebase.database();

router.post(
  "/update_profile_pic",
  upload.single("profileImage"),
  async (req, res) => {
    var data = JSON.parse(JSON.stringify(req.body));

    console.log("data " + JSON.stringify(req.file));

    let dbRef = null;

    if (data.userType === "student") dbRef = db.ref("student");
    else dbRef = await db.ref("teacher");
    console.log(dbRef);
    dbRef
      .orderByChild("email")
      .equalTo(data.email)
      .once("value", async function (snapshot) {
        if (snapshot.val() === null) {
          res.json({ success: false });
        }
        snapshot.forEach(async function (childSnapshot) {
          if (childSnapshot.val() === null) {
            res.json({ success: false });
          }

          const clone = { ...childSnapshot.val() };
          clone.avatar = req.file.path;
          let updatePath = null;
          if (data.userType === "student")
            updatePath = db.ref("student/" + childSnapshot.key);
          else updatePath = db.ref("teacher/" + childSnapshot.key);

          try {
            updatePath.update(clone);
            res.json({
              success: true,
              avatar: req.file.path,
              message: "Photo de profil mise à jour",
            });
          } catch (error) {
            res.json({ success: false });
          }
        });
      });
  }
);

module.exports = router;
