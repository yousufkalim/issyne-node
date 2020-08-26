const express = require ('express');
const router = express.Router ();
const Firebase = require ('firebase-admin');
const stripe = require ('stripe') (
  'STRIPE_TEST_KEY_REDACTED'
);

router.post ('/stripe', async function (req, res) {
  console.log (req.body.amount);
  stripe.charges
    .create ({
      amount: req.body.amount,
      currency: req.body.currency,
      source: 'tok_mastercard', // for testing purpose in case of release pass token here
    })
    .then (charge => {
      res.json ({success: true, charge});
    })
    .catch (error => {
      res.json ({success: false, message: error.message});
    });
});

module.exports = router;
