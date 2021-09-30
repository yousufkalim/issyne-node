const express = require("express");
const router = express.Router();
const Firebase = require("firebase-admin");
const { route } = require("./AdminPanelRoute");
const { response } = require("express");

// get package
router.get("/get_package", async function (req, res) {
  try {
    let response = [];
    const packageRef = await Firebase.database().ref("packages");
    packageRef.once("value", async function (snapshot) {
      if (snapshot.val() != null) {
        snapshot.forEach(function (childsnapshot) {
          let data = { id: childsnapshot.key, data: childsnapshot.val() };
          response.push(data);
        });
      }
      res.json(response);
    });
  } catch (error) {
    res.json({ error: error.message });
    console.log(error.message);
  }
});

// post package
router.post("/post_package", async function (req, res) {
  try {
    var data = JSON.parse(JSON.stringify(req.body));
    const packageRef = await Firebase.database().ref("packages");
    packageRef.once("value", async function (snapshot) {
      const params = { coins: data.coins, price: data.price };
      packageRef.push(params);
      res.json({ status: "200", params });
    });
  } catch (error) {
    res.json({ error: error.message });
    console.log(error.message);
  }
});

// update package
router.post("/update_package", async function (req, res) {
  try {
    var data = JSON.parse(JSON.stringify(req.body));
    const packageRef = await Firebase.database().ref("packages/" + data.x);
    packageRef.once("value", async function (snapshot) {
      const clone = { ...snapshot.val() };
      if (
        data.coins != undefined &&
        data.coins.length != 0 &&
        !isNaN(data.coins)
      )
        clone.coins = data.coins;
      if (
        data.price != undefined &&
        data.price.length != 0 &&
        !isNaN(data.price)
      )
        clone.price = data.price;

      packageRef.update(clone);
      res.json(clone);
    });
  } catch (error) {
    res.json({ error: error.message });
    console.log(error.message);
  }
});

//delete package
router.post("/delete_package", async function (req, res) {
  var data = JSON.parse(JSON.stringify(req.body));
  const packageRef = await Firebase.database().ref("packages/" + data.id);
  try {
    await packageRef.remove();
    res.json({ success: true, message: "paquet supprimé" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

module.exports = router;
