const express = require("express");
const router = express.Router();
const Firebase = require("firebase-admin");
const { param } = require("./ChatRoute");
const moment = require("moment");

// Get Credit From User
router.post("/get_credit", async function (req, res) {
  try {
    var data = JSON.parse(JSON.stringify(req.body));

    const creditRef = await Firebase.database().ref("credit");

    creditRef
      .orderByChild("email")
      .equalTo(data.email)
      .on("value", async function (snapshot) {
        if (snapshot.val() === null) {
          const params = {
            email: data.email,
            credit: 0,
            totalCashPaid: 0,
          };

          creditRef.push(params);
          res.json({ success: true, data: params });
        } else {
          snapshot.forEach(function (childSnapshot) {
            res.json({ success: true, data: childSnapshot.val() });
          });
        }
      });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

//Pre fill form
router.post("/form", async function (req, res) {
  try {
    var data = JSON.parse(JSON.stringify(req.body));
    const expDate = {
      day: parseInt(moment(data.expiration_date).format("DD")),
      month: parseInt(moment(data.expiration_date).format("MM")),
      year: parseInt(moment(data.expiration_date).format("YYYY")),
    };
    const formRef = Firebase.database().ref("cardForm/");
    formRef
      .orderByChild("email")
      .equalTo(data.email)
      .once("value", async function (snapshot) {
        if (snapshot.val() === null) {
          await formRef.push(data);
        } else {
          let snapshotClone = { ...snapshot.val() };
          snapshotClone = { ...data };
          const key = Object.keys(snapshot.val())[0];
          await Firebase.database()
            .ref("cardForm/" + key)
            .update(snapshotClone);
          await Firebase.database()
            .ref("student/")
            .orderByChild("email")
            .equalTo(data.email)
            .once("value", async function (snapshotStudent) {
              const keyStudent = Object.keys(snapshotStudent.val())[0];
              const student = Object.keys(snapshotStudent.val());
              console.log(("student", student));
              console.log(keyStudent);
              await Firebase.database()
                .ref("student/" + keyStudent)
                .update({
                  card: {
                    card_num: data.card_num,
                    cvc: data.ccv,
                    expMonth: expDate.month,
                    expYear: expDate.year,
                  },
                });
            });
          // if (snapshot.val() != null) {
          //   let hashedPassword = null;
          // }
        }

        return res.json({ data: data, success: true });
      });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false });
  }
});

// Add Credit to Account
router.post("/post_credit", async function (req, res) {
  try {
    var data = JSON.parse(JSON.stringify(req.body));
    const creditRef = await Firebase.database().ref("credit");
    creditRef
      .orderByChild("email")
      .equalTo(data.email)
      .once("value", async function (snapshot) {
        if (snapshot.val() === null) {
          const params = {
            email: data.email,
            credit: data.credit,
            amountPaid: data.amountPaid,
          };

          await creditRef.push(params);
          return res.json({ success: true, data: params });
        } else {
          snapshot.forEach(async function (childSnapshot) {
            const clone = { ...childSnapshot.val() };
            clone.credit = data.credit + clone.credit;
            clone.amountPaid = data.amountPaid + clone.amountPaid;
            await Firebase.database()
              .ref("credit/" + childSnapshot.key)
              .update(clone);

            return res.json({ success: true, credit: clone.credit });
          });

          // if (creditUpdateRef != null)
        }
      });
  } catch (error) {
    console.log(error.message);
  }
});

// Remove One Credit After The End Of Session
router.post("/deduct_credit", async function (req, res) {
  try {
    var data = JSON.parse(JSON.stringify(req.body));
    const creditRef = await Firebase.database().ref("credit");
    creditRef
      .orderByChild("email")
      .equalTo(data.email)
      .once("value", async function (snapshot) {
        if (snapshot.val() === null) {
          console.log("inside if");
          const params = {
            email: data.email,
          };

          await creditRef.push(params);
          res.json({ success: true, data: params });
        } else {
          snapshot.forEach(async function (childSnapshot) {
            const clone = { ...childSnapshot.val() };
            clone.credit = clone.credit - 1;
            await Firebase.database()
              .ref("credit/" + childSnapshot.key)
              .update(clone);

            res.json({ success: true, credit: clone.credit });
          });

          // if (creditUpdateRef != null)
        }
      });
  } catch (error) {
    console.log(error.message);
  }
});

module.exports = router;
