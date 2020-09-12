const express = require ('express');
const router = express.Router ();
const multer = require("multer");
const bcrypt = require ('bcrypt');

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

const Firebase = require ('firebase-admin');
const db = Firebase.database ();
const adminRef = db.ref ('admin');

// get all student API Functions
const StudentService = require('./AdminRoutes/StudentRoutes');
const TeacherService = require('./AdminRoutes/TeacherRouter');
const CourseService = require('./AdminRoutes/CourseRoute');
const { getById } = require('./AdminRoutes/StudentRoutes');
//============== Start Of Student Services ===================

router.get ('/get_student', (req, res) => StudentService.getAll(req,res));
router.get('/get_student_data/:email/',(req,res)=> StudentService.getById(req,res));
router.put('/update_student',upload.single("profileImage"),(req,res) => StudentService.update(res,req));
router.delete('/delete_student/:id',(req,res)=>StudentService.delete(req,res));
// router.delete('/delete_student',(req,res) => StudentService.delete(res,req))
//============== End Of Student Services ===================

//============== Start Of Teacher Services ==================

router.get ('/get_teacher', (req, res) => TeacherService.getAll(req,res));

//============== End Of Teacher Services   ==================

//============== Start Of Courses Services    ==================

router.get ('/get_courses', (req, res) => CourseService.getAll(req,res));

//============== End Of Courses Services    ==================

//============== Admin Registartion Start   ===================

// =============== out of scope ===========================
// router.post ('/register', async (req, res) => {
//   var data = JSON.parse (JSON.stringify (req.body));
//   if (data.email != undefined && data.password != undefined) {
//     const hashedPassword = await bcrypt.hash (data.password, 10);
//     try {
//       await adminRef.push ({email: data.email, password: hashedPassword});
//       res.json ({success: true});
//     } catch (error) {
//       res.json ({success: false, error: error.message});
//     }
//   }
// });
// =====================================================


router.post ('/login', async (req, res) => {
  console.log (JSON.stringify (req.body));
  var data = JSON.parse (JSON.stringify (req.body));

  adminRef
    .orderByChild ('email')
    .equalTo (data.email)
    .once ('value', async function (snapshot) {
      if (snapshot.val () === null) {
        res.json ({success: false, message: 'Email does not exist'});
      } else {
        const val = snapshot.val ();
        var key = Object.keys (snapshot.val ())[0];

        if (await bcrypt.compare (req.body.password, val[key].password)) {
          console.log(val[key])
          res.json ({success: true,user:val[key]});
        } else
          res.json ({
            message: 'Invaid Credentials',
            success: false,
          });
      }
    });
});

//============== Admin Registartion End     ===================

module.exports = router;
