const express = require ('express');
const router = express.Router ();

const bcrypt = require ('bcrypt');

const Firebase = require ('firebase-admin');
const db = Firebase.database ();
const studentRef = db.ref ('student');
const teacherRef = db.ref ('teacher');

router.post ('/login', async (req, res) => {
  console.log (JSON.stringify (req.body));

  var data = JSON.parse (JSON.stringify (req.body));

  studentRef
    .orderByChild ('email')
    .equalTo (data.email)
    .once ('value', async function (snapshot) {
      if (snapshot.val () === null) {
        teacherRef
          .orderByChild ('email')
          .equalTo (data.email)
          .once ('value', async function (snapshot) {
            if (snapshot.val () === null) {
              res.json ({message: 'Email Does not Exist'});
            } else {
              const val = snapshot.val ();
              var key = Object.keys (snapshot.val ())[0];

              if (await bcrypt.compare (req.body.password, val[key].password)) {
                snapshot.forEach (async function (childSnapshot) {
                  const clone = {...childSnapshot.val ()};
                  const nodeRef = db.ref ('teacher/' + childSnapshot.key);

                  clone.token = req.body.token.token;
                  await nodeRef.update (clone);
                  res.json (childSnapshot);
                });
              } else
                res.json ({
                  message: 'Invaid Credentials',
                  success: false,
                });
            }
          });
      } else {
        const val = snapshot.val ();
        var key = Object.keys (snapshot.val ())[0];

        if (await bcrypt.compare (req.body.password, val[key].password)) {
          console.log ('compared');
          snapshot.forEach (async function (childSnapshot) {
            const clone = {...childSnapshot.val ()};
            const nodeRef = db.ref ('student/' + childSnapshot.key);
            clone.token = req.body.token.token;
            await nodeRef.update (clone);
            res.json (childSnapshot);
          });
        } else
          res.json ({
            message: 'Invaid Credentials',
            success: false,
          });
      }
    });

  
});
module.exports = router;
