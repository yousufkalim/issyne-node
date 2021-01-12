const express = require("express");
const router = express.Router();
const Firebase = require("firebase-admin");
const stripe = require("stripe")(
  "STRIPE_TEST_KEY_REDACTED"
);

router.post("/stripe", async function (req, res) {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const token = req.body.token;
    const amount = req.body.amount;
    // const card = req.body.card;

    // const name = "test";
    // const email = "test@test.com";
    // const token = req.body.token;
    // const amount = 20;

    console.log("TOKEN", token);

    const customer = await stripe.customers.create({
      name: name,
      email: email,
      // currency: "eur",
      source: token.tokenId,
    });
    console.log("CUSTOMER", customer);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "eur",
      payment_method_types: ["card"],
      customer: customer.id,
      payment_method: token.card.cardId,
      confirm: true,
    });
    console.log("Payment Intent", paymentIntent);

    if (paymentIntent.status !== "succeeded") {
      res.json({ success: false, message: error.message });
    } else res.json({ success: true, paymentIntent });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
});

module.exports = router;
