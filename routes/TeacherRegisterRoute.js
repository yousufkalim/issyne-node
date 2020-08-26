const express = require ('express');
const router = express.Router ();
const multer = require ('multer');
const bcrypt = require ('bcrypt');

const Firebase = require ('firebase-admin');
const db = Firebase.database ();
const userRef = db.ref ('teacher');
const studentRef = db.ref ('student');
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

router.get ('/find', async (req, res) => {
  try {
    userRef.once ('value', async function (snapshot) {
      if (snapshot.val () === null) res.json ({message: 'No Data Found'});
      else {
        const response = [];
        snapshot.forEach (function (childSnapshot) {
          response.push (childSnapshot.val ());
        });
        res.json ({response});
      }
    });
  } catch (error) {
    res.json ({message: error.message});
  }
});

router.post (
  '/register',
  upload.fields ([
    {name: 'profileImage', maxCount: 1},
    {name: 'idCard', maxCount: 1},
    {name: 'kbis', maxCount: 1},
    {name: 'diploma', maxCount: 1},
  ]),
  async (req, res) => {
    try {
      const profile = req.files['profileImage'][0];
      const idCardFile = req.files['idCard'][0];
      const kbisFile = req.files['kbis'][0];
      const diplomaFile = req.files['diploma'][0];
      var data = JSON.parse (JSON.stringify (req.body));
      data.avatar = profile.path;
      data.idCard = idCardFile.path;
      data.kbis = kbisFile.path;
      data.diploma = diplomaFile.path;
      data.isActive = true;
      data.rating = 3;
      data.type = 'teacher';
      userRef
        .orderByChild ('email')
        .equalTo (data.email)
        .once ('value', async function (snapshot) {
          if (snapshot.val () === null) {
            studentRef
              .orderByChild ('email')
              .equalTo (data.email)
              .once ('value', async function (snapshot) {
                if (snapshot.val () === null) {
                  const hashedPassword = await bcrypt.hash (
                    req.body.password,
                    10
                  );
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

      // Teacher.find ({email: req.body.email})
      //   .exec ()
      //   .then (async doc => {
      //     if (doc.length === 0) {
      //       const profile = req.files['profileImage'][0];
      //       const idCardFile = req.files['idCard'][0];

      //       const kbisFile = req.files['kbis'][0];

      //       const diplomaFile = req.files['diploma'][0];
      //       const hashedPassword = await bcrypt.hash (req.body.password, 10);

      //       const teacher = new Teacher ({
      //         email: req.body.email,
      //         password: hashedPassword,
      //         firstName: req.body.firstName,
      //         lastName: req.body.lastName,
      //         dateOfBirth: req.body.dateOfBirth,
      //         currentStatus: req.body.currentStatus,
      //         address: req.body.address,
      //         phoneNumber: req.body.phoneNumber,
      //         experience: req.body.experience,
      //         courses: JSON.parse (req.body.courses),
      //         metrics: JSON.parse (req.body.metrics),
      //         avatar: profile.path,
      //         idCard: idCardFile.path,
      //         kbis: kbisFile.path,
      //         diploma: diplomaFile.path,
      //       });

      //       try {
      //         const newTeacher = await teacher.save ();

      //         res.json (newTeacher);
      //         console.log ('response');
      //       } catch (error) {
      //         console.log (error.message);

      //         res.json ({message: error.message + 'From server'});
      //       }
      //     } else {
      //       res.json ({message: 'Email Already Registered'});
      //     }
      //   })
      //   .catch (error => res.json ({message: error.message}));
    } catch (error) {
      res.json ({message: 'All Fields Are Required'});
    }
  }
);
module.exports = router;
