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

initialize();
checkStatus();



document
  .querySelector("#payment-form").addEventListener('submit', function (event) {
  event.preventDefault();

  stripe.confirmPayment({
    clientSecret: '{PAYMENT_INTENT_CLIENT_SECRET}',
    confirmParams: {
      return_url: 'https://example.com/order/123/complete',
    },
  }).then(function (result) {
    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Show error to your customer.
      var messageContainer = document.querySelector('#error-message');
      messageContainer.textContent = error.message;
    } else {
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  });
});

// Fetches a payment intent and captures the client secret
async function initialize() {
  const response = await fetch("/create-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  const { clientSecret } = await response.json();

  const appearance = {
    theme: 'stripe',
  };
  elements = stripe.elements({ appearance, clientSecret });

  const paymentElement = elements.create("payment");
  paymentElement.mount("#payment-element");
}

// Fetches the payment intent status after payment submission
async function checkStatus() {
  const clientSecret = new URLSearchParams(window.location.search).get(
    "payment_intent_client_secret"
  );

  if (!clientSecret) {
    return;
  }

  const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

  switch (paymentIntent.status) {
    case "succeeded":
      fetchAndRenderSummary();
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

function showMessage(messageText) {
  const messageContainer = document.querySelector("#payment-message");

  messageContainer.classList.remove("hidden");
  messageContainer.textContent = messageText;

  setTimeout(function () {
    messageContainer.classList.add("hidden");
    messageText.textContent = "";
  }, 4000);
}

function fetchAndRenderSummary () {
  fetch('/summarize-payment', {
    body: JSON.stringify({ payment_intent_id: '{PAYMENT_INTENT_ID}' })
  }).then(function (res) {
    return res.json();
  }).then(function (summary) {
    // Render the summary object returned by your server
  });
};

// Show a spinner on payment submission
function setLoading(isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("#submit").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("#submit").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
}