const Firebase = require("firebase-admin");
const db = Firebase.database();
const studentRef = db.ref("student");
const reportTeacher = db.ref("report_teacher");
const creditRef = db.ref("credit");
const ratingRef = db.ref("rating");
const chatRef = db.ref("chat");
const bcrypt = require("bcrypt");

module.exports = {
  getAll,
  update,
  getById,
  delete: _delete,
};

async function getAll(req, res) {
  const students = [];
  await studentRef.once("value", async function (snapshot) {
    if (snapshot.val() != null) {
      // Check if student table is not empty
      snapshot.forEach(function (childsnapshot) {
        var studentItem = childsnapshot.val();
        studentItem.id = childsnapshot.key;
        students.push(studentItem);
      });
    }
  });

  let numberOfSessionsPaidPromise = students.map(async function (
    student,
    index
  ) {
    const count = await getAmountOfSessionsPaid(student);
    students[index].amountOfSessionsPaid = count;
  });

  let totalCashPaidPromise = students.map(async function (student, index) {
    const totalCash = await getTotalCashSpent(student);
    students[index].totalCashSpent = totalCash;
  });

  let totalCasesFiledPromise = students.map(async function (student, index) {
    const reports = await getTotalTeachersReported(student);
    students[index].totalReportsFiled = reports;
  });

  let averageRatingPromise = students.map(async function (student, index) {
    const averageRating = await getAverageRatingGiven(student);
    students[index].averageRatingGiven = averageRating;
  });

  await Promise.all(numberOfSessionsPaidPromise);
  await Promise.all(totalCashPaidPromise);
  await Promise.all(totalCasesFiledPromise);
  await Promise.all(averageRatingPromise);

  // sending all response
  res.json(students);
}

// getByID ==========================
async function getById(req, res) {
  studentRef
    .orderByChild("email")
    .equalTo(req.params.email)
    .once("value", async function (snapshot) {
      if (snapshot.val() === null) {
        // the email does not exist
        res.json({ success: false, message: "L'email n'existe pas" });
      } else {
        snapshot.forEach(function (childsnapshot) {
          res.json({ success: true, user: childsnapshot.val() });
        });
      }
    });
}
// update ============================
async function update(res, req) {
  const userParams = req.body;
  studentRef
    .orderByChild("email")
    .equalTo(req.body.email)
    .once("value", async function (snapshot) {
      if (snapshot.val() === null) {
        // the email does not exist
        res.json({ success: false, message: "L'email n'existe pas" });
      } else {
        console.log("in else");
        snapshot.forEach(async function (childsnapshot) {
          const clone = { ...childsnapshot.val() };
          const updateRef = db.ref("student/" + childsnapshot.key);
          // stating update logic
          const hashedPassword = await bcrypt.hash(userParams.password, 10);
          if (userParams.password !== clone.password) {
            clone.password = hashedPassword;
          }
          clone.username = userParams.username;
          clone.firstName = userParams.firstName;
          clone.lastName = userParams.lastName;
          clone.dateOfBirth = userParams.dateOfBirth;
          clone.phoneNumber = userParams.phoneNumber;
          clone.educationLevel = userParams.educationLevel;
          clone.city = userParams.city;
          if (req.file !== undefined) {
            console.log("I am in file path", req.file.path);
            clone.avatar = req.file.path;
          }
          await updateRef.update(clone);
          console.log("after update");
          res.json({ status: true });
        });
      }
    });
}
// delete function/API call =========
async function _delete(req, res) {
  const studentRefDel = await Firebase.database().ref(
    "student/" + req.params.id
  );
  try {
    await studentRefDel.remove();
    res.json({ success: true, message: "paquet supprimé" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}

// function to get amount of sessions paid by the student
async function getAmountOfSessionsPaid(student) {
  var count = 0;
  try {
    await chatRef
      .orderByChild("studentEmail")
      .equalTo(student.email)
      .once("value", async function (snapshot) {
        if (snapshot.val() === null) return count;
        snapshot.forEach(function (childsnapshot) {
          ++count;
        });
      });
    return count;
  } catch (error) {
    console.log("inside error");
    return count;
  }
}

// function to get total cash spent by the student
async function getTotalCashSpent(student) {
  var totalAmountSpent = 0;
  try {
    await creditRef
      .orderByChild("email")
      .equalTo(student.email)
      .once("value", async function (snapshot) {
        if (snapshot.val() === null) return totalAmountSpent;
        snapshot.forEach(function (childsnapshot) {
          totalAmountSpent = childsnapshot.val().amountPaid;
        });
      });
    return totalAmountSpent;
  } catch (error) {
    console.log("inside error");
    return totalAmountSpent;
  }
}

// function to average rating given to teacher
async function getAverageRatingGiven(student) {
  var averageRating = 0; // Average rating given by student
  var totalRatings = 0; // Total no of ratings given by student
  var ratingSum = 0; // Sum of all ratings given by the student
  try {
    await ratingRef.once("value", async function (snapshot) {
      if (snapshot.val() != null) {
        snapshot.forEach(function (childsnapshot) {
          if (childsnapshot.val() != null) {
            const childsnapshotClone = { ...childsnapshot.val() };
            const comments = childsnapshotClone.commentData.comments;

            comments.forEach(function (comment) {
              if (student.email === comment.stundentEmail) {
                ++totalRatings; // add number of ratings of a given email
                ratingSum += comment.ratingGiven; // Add eacht rating given by student on each chat
              }
            });
          }
        });
      }
    });
    averageRating = ratingSum / totalRatings;
    if (isNaN(averageRating)) {
      // if the student has not given any rating then the value would be undefined retun 0 in that case
      return 0;
    }
    return averageRating.toFixed(2);
  } catch (error) {
    return averageRating; // in case of an error return default value of average rating
  }
}

// function to get total complains filed by student
async function getTotalTeachersReported(student) {
  var totalReports = 0;
  try {
    await reportTeacher
      .orderByChild("studentEmail")
      .equalTo(student.email)
      .once("value", async function (snapshot) {
        if (snapshot.val() === null) return totalReports;
        snapshot.forEach(function (childsnapshot) {
          ++totalReports;
        });
      });
    return totalReports;
  } catch (error) {
    console.log("inside error " + error.message);
    return totalReports;
  }
}
