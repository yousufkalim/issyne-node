const express = require ('express');
const router = express.Router ();
const multer = require ('multer');
const bcrypt = require ('bcrypt');

const Firebase = require ('firebase-admin');
const { route } = require('./ChatRoute');
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


router.post ('/get_teacher', async (req, res) => {
    try {
      console.warn (JSON.stringify (req.body));
      userRef
        .orderByChild ('email')
        .equalTo (req.body.email)
        .once ('value', async function (snapshot) {
          if(snapshot.val()!=null){
              
            snapshot.forEach(function(childSnapshot){
                res.json(childSnapshot.val());
            });
         
          }
       
          else
          {
              res.json({success:false,message:'something went wrong'})
          }
  
        });
    } catch (error) {
      res.json({success:false,message:'something went wrong'})
  
    }
  });


router.post ('/change_status', async (req, res) => {
  try {
    console.warn (JSON.stringify (req.body));
    userRef
      .orderByChild ('email')
      .equalTo (req.body.email)
      .once ('value', async function (snapshot) {
        if(snapshot.val()!=null){
            snapshot.forEach(function(childSnapshot){
                if(childSnapshot.val().email === req.body.email)
                {
                    const ref = db.ref('teacher/'+childSnapshot.key);

                    const clone = {...childSnapshot.val()}
                    clone.isActive = req.body.status;
                    ref.update(clone);
                    res.json({success:true,message:'Status changes'})

                }
            })
       
       
       
        }
        
        else
        {
            res.json({success:false,message:'something went wrong'})
        }

      });
  } catch (error) {
    res.json({success:false,message:'something went wrong'})

  }
});
module.exports = router;
