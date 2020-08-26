const express = require ('express');
const router = express.Router ();
const multer = require ('multer');
const bcrypt = require ('bcrypt');
const storage = multer.diskStorage ({
  destination: function (req, file, cb) {
    cb (null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb (null, new Date ().getTime () + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  // if (file.mimeType === 'image/jpeg' || file.mimeType === 'image/png')
  cb (null, true);
  //else {
  //cb (Error('Invalid File Format'), false);
  // }
};
const upload = multer ({
  storage: storage,
  // limits: {
  //   fileSize: 1024 * 1024 * 5,
  // },
  fileFilter: fileFilter,
});


const Firebase = require ('firebase-admin');
const db = Firebase.database ();
const userRef = db.ref ('student');
const teacherRef = db.ref ('teacher');
router.post ('/register', upload.single ('profileImage'), async (req, res) => {
  // router.post ('/register', async (req, res) => {
  var data = JSON.parse (JSON.stringify (req.body));
  data.avatar = req.file.path;
  data.type = 'student';
  userRef
    .orderByChild ('email')
    .equalTo (data.email)
    .once ('value', async function (snapshot) {
      if (snapshot.val () === null) {
        teacherRef
          .orderByChild ('email')
          .equalTo (data.email)
          .once ('value', async function (snapshot) {
            if (snapshot.val () === null) {
              const hashedPassword = await bcrypt.hash (req.body.password, 10);
              const response = {...data};
              data.password = hashedPassword;
              await userRef.push (data, function (err) {
                if (err) res.send (err);
                else
                  res.json ({
                    response: response,
                  });
              });
            } else res.json ({messge: 'Email Already Exists'});
          });
      } else res.json ({messge: 'Email Already Exists'});
    });

  // console.log(req.body.password);
  //    Student.find ({email: req.body.email})
  //    .exec ()
  //    .then (async doc => {
  //      if (doc.length === 0) {
  //        const hashedPassword = await bcrypt.hash (req.body.password, 10);
  //        const student = new Student ({
  //          email: req.body.email,
  //          password: hashedPassword,
  //          firstName: req.body.firstName,
  //          lastName: req.body.lastName,
  //          dateOfBirth: req.body.dateOfBirth,
  //          educationLevel: req.body.educationLevel,
  //          city: req.body.city,
  //          phoneNumber: req.body.phoneNumber,
  //          username: req.body.username,
  //          avatar: req.file.path,
  //        });

  //        try {
  //          const newStudent = await student.save ();

  //          res.json (newStudent);
  //          console.log ('response');
  //        } catch (error) {
  //          console.log (error.message);

  //          res.json ({message: error.message + 'From server'});
  //        }
  //      } else res.json ({message: 'Email Already Registered'});
  //    })
  //    .catch (err => console.log(err.message)
  //      //res.json ({message: err.message})
  //      );
});

module.exports = router;
