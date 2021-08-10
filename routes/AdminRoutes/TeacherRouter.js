const Firebase = require ('firebase-admin');
const db = Firebase.database ();
const teacherRef = db.ref ('teacher');
const reportTeacher = db.ref ('report_teacher');
// const ratingRef = db.ref ('rating');
const chatRef = db.ref ('chat');

module.exports = {
    getAll,
};

async function getAll (req, res) {
    const teachers = [];
    const teacherKeys = [];
    await teacherRef.once ('value', async function (snapshot) {
      if (snapshot.val () != null) {
        // Check if student table is not empty
  
        snapshot.forEach (function (childsnapshot) {
          let teacherIs = childsnapshot.val();
          teacherIs.id = childsnapshot.key;
          teachers.push (teacherIs);
          teacherKeys.push (childsnapshot.key);
        });
      }
    });
  
    let numberOfCoursesDone = teachers.map (async function (teacher, index) {
      const count = await getNumberOfCoursesDone (teacher);
      teachers[index].numberOfCoursesDone = count;
      teachers[index].amountEarned = count;
    });
  
    let totalCasesFiledPromise = teachers.map (async function (teacher, index) {
      const reports = await getNumberOfComplainsReported (teacher);
      teachers[index].totalReportsFiled = reports;
    });
  
    await Promise.all (numberOfCoursesDone);
    await Promise.all (totalCasesFiledPromise);
    res.json (teachers);
}

async function getNumberOfCoursesDone (teacher) {
    var count = 0;
    try {
        await chatRef
        .orderByChild ('teacherEmail')
        .equalTo (teacher.email)
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

// function to get total complains filed by student
async function getNumberOfComplainsReported (teacher) {
    var totalReports = 0;
    try {
        await reportTeacher
        .orderByChild ('teacherEmail')
        .equalTo (teacher.email)
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
  