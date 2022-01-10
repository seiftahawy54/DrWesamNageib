// Send Request: link, authorization, body, send data
// authorize: returns token
// pair-cash
import { default as axios } from "axios";

const fetchToken = async () => {
  return axios({
    url: "https://api-m.sandbox.paypal.com/v1/oauth2/token?",
    method: "post",
    headers: {
      Accept: "application/json",
      "Accept-Language": "en_US",
    },
    auth: {
      username: process.env.PAYPAL_CLIENT_ID,
      password: process.env.PAYPAL_CLIENT_SECERT,
    },
    data: "grant_type=client_credentials",
  });
};

const verifyToken = async () => {
  const fetchingTokenInfo = await fetchToken();
  const token = await fetchingTokenInfo.data.access_token;
  const constructedToken = "Bearer " + token;
  const verifyingToken = await axios({
    url: "https://api-m.sandbox.paypal.com/v2/checkout/orders",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: constructedToken,
    },
    data: {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: "100",
          },
        },
      ],
    },
  });

  const verifyingOutput = await verifyingToken;
  return verifyingOutput.data.links;
};

const approvePayment = async () => {
  const fetchingTokenInfo = await fetchToken();
  const token = await fetchingTokenInfo.data.access_token;
  const constructedToken = "Bearer " + token;
  const captureLink = await findWanted("approve");
  console.log(captureLink);
  axios({
    url: captureLink.href,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: constructedToken,
    },
    data: {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: "100",
          },
        },
      ],
    },
  });
};

const capturePayment = async () => {
  const fetchingTokenInfo = await this.fetchToken();
  const token = await fetchingTokenInfo.data.access_token;
  const constructedToken = "Bearer " + token;
  const captureLink = await this.findWanted("capture");
  /*console.log(
    "constructedToken: ",
    constructedToken,
    "\ncapture link: ",
    captureLink
  );*/
  const finishPayment = axios({
    url: captureLink.href,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: constructedToken,
    },
    data: {
      amount: {
        value: "100",
        currency_code: "USD",
      },
      invoice_id: "INVOICE-123",
      final_capture: true,
      note_to_payer:
        "If the ordered color is not available, we will substitute with a different color free of charge.",
      soft_descriptor: "Bob's Custom Sweaters",
    },
  });

  const finishPaymentData = await finishPayment;

  console.log(await finishPaymentData);
};

const findWanted = async (wantedLink) => {
  const getCaptureLink = await verifyToken();
  let captureRequest = {};
  getCaptureLink.forEach((element, index, array) => {
    if (element.rel === wantedLink) {
      captureRequest = element;
    }
  });
  return captureRequest;
};

export { approvePayment, findWanted, verifyToken, fetchToken, capturePayment };
