// This is a public sample test API key.
// Don’t submit any personally identifiable information in requests made with this key.
// Sign in to see your own test API key embedded in code samples.
const stripe = Stripe("pk_test_51LkZ5NCcMY6nBE2UHxjhnQw625FvZmJAbCjQIEk7I4Vvd82fwJhulStVwcUfV5CKjceDVfYXeAmFxqTjqCB9d1Ap008jBQN4xD", {
  betas: ['server_side_confirmation_beta_1'],
  apiVersion: '2022-08-01;server_side_confirmation_beta=v1',
});
// The items the customer wants to buy
const items = [{ id: "xl-tshirt" }];

let elements;
let clientSecret;

initialize();
checkStatus();

document
  .querySelector("#payment-form").addEventListener('submit', function (event) {
  event.preventDefault();
  setLoading(true);

  stripe.updatePaymentIntent({
    elements, // elements instance
  }).then(function (result) {
    checkStatus();
    setLoading(false);
  });
});

document
  .querySelector("#confirm-form").addEventListener('submit', function (event) {
  event.preventDefault();
  setLoading(true);

  stripe.confirmPayment({
    clientSecret: clientSecret,
    confirmParams: {
      return_url: 'http://localhost:4242/checkout.html?confirmed=true',
    },
  }).then(function (result) {
    checkStatus();
    setLoading(false);
  });
});

// Fetches a payment intent and captures the client secret
async function initialize() {
  const response = await fetch("/create-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  const resp = await response.json();
  clientSecret = resp.clientSecret

  const appearance = {
    theme: 'stripe',
  };
  elements = stripe.elements({ appearance, clientSecret });

  const paymentElement = elements.create("payment");
  paymentElement.mount("#payment-element");
}

// Fetches the payment intent status after payment submission
async function checkStatus() {
  if (!clientSecret) {
    return;
  }

  const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

  switch (paymentIntent.status) {
    case "succeeded":
      showMessage("Thanks for the money!");
      break;
    case "requires_confirmation":
      fetchAndRenderSummary(paymentIntent.id);
      break;
    case "processing":
      showMessage("Your payment is processing.");
      break;
    case "requires_payment_method":
      showMessage("Your payment was not successful, please try again.");
      break;
    default:
      showMessage("Something went wrong.");
      break;
  }
}

// ------- UI helpers -------

function showMessage(messageText, timeout) {
  const messageContainer = document.querySelector("#payment-message");

  messageContainer.classList.remove("hidden");
  messageContainer.textContent = messageText;

  setTimeout(function () {
    messageContainer.classList.add("hidden");
    messageContainer.textContent = "";
  }, 4000);
}

function fetchAndRenderSummary (paymentIntentId) {
  fetch('/summarize-payment', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payment_intent_id: paymentIntentId })
  }).then(function (res) {
    console.log(res)
    return res.json();
  }).then(function (summary) {
    console.log(summary)
    document.querySelector("#payment-form").classList.add("hidden");
    document.querySelector("#confirm-form").classList.remove("hidden");
    document.querySelector("#details").textContent = "Please confirm amount: " + summary.intent.amount;

    const messageContainer = document.querySelector("#payment-message");

    messageContainer.classList.remove("hidden");
  });
};

// Show a spinner on payment submission
function setLoading(isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("#submit").disabled = true;
    document.querySelector("#confirm").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("#submit").disabled = false;
    document.querySelector("#confirm").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
}