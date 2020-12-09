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
const userRef = db.ref("student");
const teacherRef = db.ref("teacher");
const credit = db.ref("credit");

router.post("/register", upload.single("profileImage"), async (req, res) => {
  // router.post ('/register', async (req, res) => {
  var data = JSON.parse(JSON.stringify(req.body));
  if (req.file !== undefined) {
    data.avatar = req.file.path;
  } else {
    data.avatar = "";
  }
  data.type = "student";
  userRef
    .orderByChild("email")
    .equalTo(data.email)
    .once("value", async function (snapshot) {
      if (snapshot.val() === null) {
        // check if email exists on student
        teacherRef
          .orderByChild("email")
          .equalTo(data.email)
          .once("value", async function (snapshot) {
            if (snapshot.val() === null) {
              // check if email exists on teacher
              const hashedPassword = await bcrypt.hash(req.body.password, 10);
              const response = { ...data };
              data.password = hashedPassword;
              data.isSocial = false;
              userRef.push(data);
              credit.push({ email: data.email, credit: 0, amountPaid: 0 }); // push student credit
              res.json({
                response: response,
              });
            } else res.json({ message: "Email Already Exists" });
          });
      } else res.json({ message: "Email Already Exists" });
    });
});

router.post(
  "/register_social",
  upload.single("profileImage"),
  async (req, res) => {
    console.log("\n\n\n\n\n HERE \n\n\n\n\n\n");

    // router.post ('/register', async (req, res) => {
    var data = JSON.parse(JSON.stringify(req.body));
    console.log(JSON.stringify(data, null, 2));
    if (req.file !== undefined) {
      data.avatar = req.file.path;
    } else {
      data.avatar = "";
    }
    data.type = "student";
    userRef
      .orderByChild("email")
      .equalTo(data.email)
      .once("value", async function (snapshot) {
        if (snapshot.val() === null) {
          // check if email exists on student
          teacherRef
            .orderByChild("email")
            .equalTo(data.email)
            .once("value", async function (snapshot) {
              if (snapshot.val() === null) {
                // check if email exists on teacher
                const hashedPassword = await bcrypt.hash(req.body.password, 10);
                const response = { ...data };
                response.password = hashedPassword;
                response.isSocial = true;
                userRef.push(response);
                credit.push({ email: data.email, credit: 0, amountPaid: 0 }); // push student credit
                res.json({
                  response: response,
                });
              } else res.json({ message: "Email Already Exists" });
            });
        } else res.json({ message: "Email Already Exists" });
      });
  }
);

module.exports = router;
