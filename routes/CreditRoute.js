const express = require ('express');
const router = express.Router ();
const Firebase = require ('firebase-admin');
const {param} = require ('./ChatRoute');

// Get Credit From User
router.post ('/get_credit', async function (req, res) {
  try {
    var data = JSON.parse (JSON.stringify (req.body));

    const creditRef = await Firebase.database ().ref ('credit');

    creditRef
      .orderByChild ('email')
      .equalTo (data.email)
      .on ('value', async function (snapshot) {
        if (snapshot.val () === null) {
          const params = {
            email: data.email,
            credit: 0,
          };

          creditRef.push (params);
          res.json ({success: true, data: params});
        } else {
          snapshot.forEach (function (childSnapshot) {
            res.json ({success: true, data: childSnapshot.val ()});
          });
        }
      });
  } catch (error) {
    res.json ({success: false, message: 'something went wrong'});
  }
});

// Add Credit to Account
router.post ('/post_credit', async function (req, res) {
  try {
    var data = JSON.parse (JSON.stringify (req.body));
    const creditRef = await Firebase.database ().ref ('credit');
    creditRef
      .orderByChild ('email')
      .equalTo (data.email)
      .once ('value', async function (snapshot) {
        if (snapshot.val () === null) {
          const params = {
            email: data.email,
            credit: data.credit,
          };

          await creditRef.push (params);
          res.json ({success: true, data: params});
        } else {
          snapshot.forEach (async function (childSnapshot) {
            const clone = {...childSnapshot.val ()};
            clone.credit = data.credit + clone.credit;
            await Firebase.database ()
              .ref ('credit/' + childSnapshot.key)
              .update (clone);

            res.json ({success: true, credit: clone.credit});
          });

          // if (creditUpdateRef != null)
        }
      });
  } catch (error) {
    console.log (error.message);
  }
});

// Remove One Credit After The End Of Session
router.post ('/deduct_credit', async function (req, res) {
  try {
    var data = JSON.parse (JSON.stringify (req.body));
    const creditRef = await Firebase.database ().ref ('credit');
    creditRef
      .orderByChild ('email')
      .equalTo (data.email)
      .once ('value', async function (snapshot) {
        if (snapshot.val () === null) {
          console.log('inside if')
          const params = {
            email: data.email,
          };

          await creditRef.push (params);
          res.json ({success: true, data: params});
        } else {
          snapshot.forEach (async function (childSnapshot) {
            const clone = {...childSnapshot.val ()};
            clone.credit = clone.credit - 1;
            await Firebase.database ()
              .ref ('credit/' + childSnapshot.key)
              .update (clone);

            res.json ({success: true, credit: clone.credit});
          });

          // if (creditUpdateRef != null)
        }
      });
  } catch (error) {
    console.log (error.message);
  }
});

module.exports = router;
