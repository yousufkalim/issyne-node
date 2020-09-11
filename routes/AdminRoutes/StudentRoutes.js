const Firebase = require ('firebase-admin');
const db = Firebase.database ();
const studentRef = db.ref ('student');
const reportTeacher = db.ref ('report_teacher');
const creditRef = db.ref ('credit');
const ratingRef = db.ref ('rating');
const chatRef = db.ref ('chat');

module.exports = {
    getAll,
};


async function getAll (req, res) {
    const students = [];
    await studentRef.once ('value', async function (snapshot) {
      if (snapshot.val () != null) {
        // Check if student table is not empty
        snapshot.forEach (function (childsnapshot) {
          students.push (childsnapshot.val ());
        });
      }
    });
  
    let numberOfSessionsPaidPromise = students.map (async function (
      student,
      index
    ) {
      const count = await getAmountOfSessionsPaid (student);
      students[index].amountOfSessionsPaid = count;
    });
  
    let totalCashPaidPromise = students.map (async function (student, index) {
      const totalCash = await getTotalCashSpent (student);
      students[index].totalCashSpent = totalCash;
    });
  
    let totalCasesFiledPromise = students.map (async function (student, index) {
      const reports = await getTotalTeachersReported (student);
      students[index].totalReportsFiled = reports;
    });
  
    let averageRatingPromise = students.map (async function (student, index) {
      const averageRating = await getAverageRatingGiven (student);
      students[index].averageRatingGiven = averageRating;
    });
  
    await Promise.all (numberOfSessionsPaidPromise);
    await Promise.all (totalCashPaidPromise);
    await Promise.all (totalCasesFiledPromise);
    await Promise.all (averageRatingPromise);

    // sending all response
    res.json(students);

}

// function to get amount of sessions paid by the student
async function getAmountOfSessionsPaid (student) {
    var count = 0;
    try {
      await chatRef
        .orderByChild ('studentEmail')
        .equalTo (student.email)
        .once ('value', async function (snapshot) {
          if (snapshot.val () === null) return count;
          snapshot.forEach (function (childsnapshot) {
            ++count;
          });
        });
      return count;
    } catch (error) {
      console.log ('inside error');
      return count;
    }
  }

  
// function to get total cash spent by the student
async function getTotalCashSpent (student) {
    var totalAmountSpent = 0;
    try {
      await creditRef
        .orderByChild ('email')
        .equalTo (student.email)
        .once ('value', async function (snapshot) {
          if (snapshot.val () === null) return totalAmountSpent;
          snapshot.forEach (function (childsnapshot) {
            totalAmountSpent = childsnapshot.val ().amountPaid;
          });
        });
      return totalAmountSpent;
    } catch (error) {
      console.log ('inside error');
      return totalAmountSpent;
    }
  }
  
  // function to average rating given to teacher
  async function getAverageRatingGiven (student) {
    var averageRating = 0; // Average rating given by student
    var totalRatings = 0; // Total no of ratings given by student
    var ratingSum = 0; // Sum of all ratings given by the student
    try {
      await ratingRef.once ('value', async function (snapshot) {
        if (snapshot.val () != null) {
          snapshot.forEach (function (childsnapshot) {
            if (childsnapshot.val () != null) {
              const childsnapshotClone = {...childsnapshot.val ()};
              const comments = childsnapshotClone.commentData.comments;
  
              comments.forEach (function (comment) {
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
      if (isNaN (averageRating)) {
        // if the student has not given any rating then the value would be undefined retun 0 in that case
        return 0;
      }
      return averageRating.toFixed (2);
    } catch (error) {
      return averageRating; // in case of an error return default value of average rating
    }
  }
  
  // function to get total complains filed by student
  async function getTotalTeachersReported (student) {
    var totalReports = 0;
    try {
      await reportTeacher
        .orderByChild ('studentEmail')
        .equalTo (student.email)
        .once ('value', async function (snapshot) {
          if (snapshot.val () === null) return totalReports;
          snapshot.forEach (function (childsnapshot) {
            ++totalReports;
          });
        });
      return totalReports;
    } catch (error) {
      console.log ('inside error ' + error.message);
      return totalReports;
    }
  }
  