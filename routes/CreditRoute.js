const express = require("express");
const router = express.Router();
const Firebase = require("firebase-admin");
const { param } = require("./ChatRoute");
const moment = require("moment");
const stripe = require("stripe")(process.env.STRIPE_KEY);

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
    console.log(data, "data");
    const expDate = {
      day: parseInt(moment(new Date(data.expiration_date)).format("DD")),
      month: parseInt(moment(new Date(data.expiration_date)).format("MM")),
      year: parseInt(moment(new Date(data.expiration_date)).format("YYYY")),
    };

    // console.log("DATAE", data, expDate);
    const formRef = Firebase.database().ref("cardForm/");
    formRef
      .orderByChild("email")
      .equalTo(data.email)
      .once("value", async function (snapshot) {
        if (snapshot.val() === null) {
          await formRef.push(data);
          return res.json({
            data: {
              card_num: data.card_num,
              cvc: data.ccv,
              ExpDate: data.expiration_date,
              expMonth: expDate.month,
              expYear: expDate.year,
            },
            success: true,
          });
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
              if (snapshotStudent.val() === null) {
                return res.json({
                  success: false,
                  message: "student not found with this email",
                });
              }

              const keyStudent = Object.keys(snapshotStudent.val())[0];

              await Firebase.database()
                .ref("student/" + keyStudent)
                .update({
                  card: {
                    card_num: data.card_num,
                    cvc: data.ccv,
                    ExpDate: data.expiration_date,
                    expMonth: expDate.month,
                    expYear: expDate.year,
                  },
                });
              return res.json({
                data: {
                  card_num: data.card_num,
                  cvc: data.ccv,
                  ExpDate: data.expiration_date,
                  expMonth: expDate.month,
                  expYear: expDate.year,
                },
                success: true,
              });
            });
        }
      });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
});

///////////////////////BANK INFO//////////////////////////////
router.post("/bankinfo", async function (req, res) {
  try {
    var data = JSON.parse(JSON.stringify(req.body));

    const formRef = Firebase.database().ref("teacher/");
    // console.log("dataaaaa", data.email);
    formRef
      .orderByChild("email")
      .equalTo(data.email)
      .once("value", async function (snapshot) {
        if (snapshot.val() === null) {
          await formRef.push(data);
          return res.json({ data: data, success: true });
        } else {
          let snapshotClone = { ...snapshot.val() };
          snapshotClone = { ...data };
          const key = Object.keys(snapshot.val())[0];
          await Firebase.database()
            .ref("cardForm/" + key)
            .update(snapshotClone);
          await Firebase.database()
            .ref("teacher/")
            .orderByChild("email")
            .equalTo(data.email)
            .once("value", async function (snapshotTeacher) {
              if (snapshotTeacher.val() === null) {
                return res.json({
                  success: false,
                  message: "teacher not found with this email",
                });
              }
              const keyTeacher = Object.keys(snapshotTeacher.val())[0];
              await Firebase.database()
                .ref("teacher/" + keyTeacher)
                .update({
                  bank: {
                    bankname: data.bankname,
                    iban: data.iban,
                    dob: data.dob,
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
          // console.log("inside if");
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

router.post("/addBank", async function (req, res) {
  try {
    var teacher = req.body;
    // const newDOB = {
    //   day: parseInt(moment(teacher.dateOfBirth).format("DD")),
    //   month: parseInt(moment(teacher.dateOfBirth).format("MM")),
    //   year: parseInt(moment(teacher.dateOfBirth).format("YYYY")),
    // };
    // console.log("DATA FROM ADD BANK", teacher);

    const token = await stripe.tokens.create({
      account: {
        tos_shown_and_accepted: true,
        business_type: "individual",
        individual: {
          email: teacher.email,
          first_name: teacher.firstName,
          last_name: teacher.lastName,

          phone: teacher.phoneNumber,
          dob: {
            day: 01,
            month: 01,
            year: 1901,
          },

          address: {
            line1: teacher.address,
            postal_code: "41200",
            city: "test",
            country: "FR",
          },
          // verification: {
          //   additional_document: {
          //     back: fileBack.id,
          //     details: "Use document for front and back",
          //     front: fileFront.id,
          //   },
          // },
        },
      },
    });
    // console.log("Token", token);

    const account = await stripe.account.create({
      type: "custom",
      country: "FR",
      account_token: token.id,
      email: teacher.email,
      business_profile: {
        name: teacher.firstName,
        mcc: "7011",
        url: "http://google.com",
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      external_account: {
        object: "bank_account",
        account_number: teacher.bank.iban,
        //test account_number: "FR1420041010050500013M02606",
        bank_name: teacher.bank.bankName,
        country: "FR",
        currency: "eur",
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.log("Add Bank", error);
    res.json({ success: false });
  }
});

module.exports = router;
