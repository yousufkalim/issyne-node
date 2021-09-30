const express = require("express");
const router = express.Router();
const multer = require("multer");
const bcrypt = require("bcrypt");

const Firebase = require("firebase-admin");
const db = Firebase.database();
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

router.post(
  "/update_student",
  upload.single("profileImage"),
  async (req, res) => {
    // router.post ('/register', async (req, res) => {
    var data = JSON.parse(JSON.stringify(req.body));
    if (req.file != undefined) {
      data.avatar = req.file.path;
    }
    studentRef
      .orderByChild("email")
      .equalTo(data.email)
      .once("value", async function (snapshot) {
        if (snapshot.val() != null) {
          let hashedPassword = null;

          const key = Object.keys(snapshot.val())[0];
          let snapShotClone = { ...snapshot.val() };
          // Check if both passwords were given.
          if (data.password != undefined && data.newpass != undefined) {
            // Authenticate Password
            if (
              await bcrypt.compare(data.password, snapshot.val()[key].password)
            ) {
              hashedPassword = await bcrypt.hash(data.newpass, 10);

              console.log("here");
            } else
              return await res.json({
                success: false,
                message: "Mot de passe incorrect",
              });
          } else {
            //  await res.json({ success: false });
          }
          if (hashedPassword != null) {
            delete data["newpass"];
            data.password = hashedPassword;
          }
          snapShotClone = { data };
          await Firebase.database()
            .ref("student/" + key)
            .update(snapShotClone.data);
          return res.json({
            success: true,
            message: "Mise à jour du profil réussie",
          });
        } else {
          return res.json({
            success: false,
            message: "Email invalide",
          });
        }
      });
  }
);
module.exports = router;
