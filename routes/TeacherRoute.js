const express = require("express");
const router = express.Router();
const multer = require("multer");
const bcrypt = require("bcrypt");

const Firebase = require("firebase-admin");
const { route } = require("./ChatRoute");
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

router.post("/get_teacher", async (req, res) => {
  try {
    console.warn(JSON.stringify(req.body));
    userRef
      .orderByChild("email")
      .equalTo(req.body.email)
      .once("value", async function (snapshot) {
        if (snapshot.val() != null) {
          snapshot.forEach(function (childSnapshot) {
            res.json(childSnapshot.val());
          });
        } else {
          res.json({ success: false, message: "something went wrong" });
        }
      });
  } catch (error) {
    res.json({ success: false, message: "something went wrong" });
  }
});

const upload = multer({
  storage: storage,
  // limits: {
  //   fileSize: 1024 * 1024 * 5,
  // },
  fileFilter: fileFilter,
});

router.post(
  "/update_teacher",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "idCard", maxCount: 1 },
    { name: "kbis", maxCount: 1 },
    { name: "diploma", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      var data = JSON.parse(JSON.stringify(req.body));

      if (req.files["profileImage"] != undefined) {
        const profile = req.files["profileImage"][0];
        data.avatar = profile.path;
      }
      if (req.files["idCard"] != undefined) {
        const idCardFile = req.files["idCard"][0];
        data.idCard = idCardFile.path;
      }
      if (req.files["kbis"] != undefined) {
        const kbisFile = req.files["kbis"][0];
        data.kbis = kbisFile.path;
      }
      if (req.files["diploma"] != undefined) {
        const diplomaFile = req.files["diploma"][0];
        data.diploma = diplomaFile.path;
      }

      userRef
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
                await bcrypt.compare(
                  data.password,
                  snapshot.val()[key].password
                )
              ) {
                hashedPassword = await bcrypt.hash(data.newpass, 10);

                console.log("here");
              } else
                return await res.json({
                  success: false,
                  message: "Incorrect Password",
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
              .ref("teacher/" + key)
              .update(snapShotClone.data);
            return res.json({
              success: true,
              message: "Profile Updated Successfully",
            });
          } else {
            return res.json({
              success: false,
              message: "invalid email",
            });
          }
        });
    } catch (error) {
      console.log(error.message);
      res.json({ message: error.message });
    }
  }
);

router.post("/change_status", async (req, res) => {
  try {
    console.warn(JSON.stringify(req.body));
    userRef
      .orderByChild("email")
      .equalTo(req.body.email)
      .once("value", async function (snapshot) {
        if (snapshot.val() != null) {
          snapshot.forEach(function (childSnapshot) {
            if (childSnapshot.val().email === req.body.email) {
              const ref = db.ref("teacher/" + childSnapshot.key);

              const clone = { ...childSnapshot.val() };
              clone.isActive = req.body.status;
              ref.update(clone);
              res.json({ success: true, message: "Status changes" });
            }
          });
        } else {
          res.json({ success: false, message: "something went wrong" });
        }
      });
  } catch (error) {
    res.json({ success: false, message: "something went wrong" });
  }
});
module.exports = router;
