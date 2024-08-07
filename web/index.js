// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import bodyParser from "body-parser";
import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";
import axios from "axios";
const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

//gives authorization header missing
// app.use(
//   "/api/*",
//   async (req, res, next) => {
//     try {
//       const sessionId = await shopify.api.session.getCurrentId({
//         isOnline: shopify.config.useOnlineTokens,
//         rawRequest: req,
//         rawResponse: res,
//       });
//       const session = await shopify.config.sessionStorage.loadSession(
//         // @ts-ignore
//         sessionId
//       );
//       const shop = req.query.shop || session?.shop || session?.accessToken;

//       if (!shop) {
//         return undefined;
//       }
//     } catch (e) {
//       console.error(e);
//     }

//     next();
//   },
//   shopify.validateAuthenticatedSession()
// );

//gives 302 route webhook/shopify not found error (when event (post_purchase trigger))
// app.use('/api/*', async (req, res, next) => {
//   try {
//     const sessionId = await shopify.api.session.getCurrentId({
//       isOnline: shopify.config.useOnlineTokens,
//       rawRequest: req,
//       rawResponse: res,
//     });
//     // @ts-ignore
//     const session = await shopify.config.sessionStorage.loadSession(sessionId);
//     if (!session || !session.accessToken) {
//       return res.redirect(`/api/auth?shop=${req.query.shop}`);
//     }
//     res.locals.shopify = { session };
//     next();
//   } catch (e) {
//     console.error(e);
//     res.redirect(`/api/auth?shop=${req.query.shop}`);
//   }
// });

app.use(express.json());
// Body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/api/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
});
app.get("/", async (_req, res) => {
  res.status(200).json("server started");
});
app.post("/api/products", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.post("/api/shopify-webhook", async (req, res) => {
  const full_Shopped_Data = req.body;
  const phoneNumber =
    full_Shopped_Data.shipping_address?.phone ||
    full_Shopped_Data.default_address?.phone; // Adjust this based on your webhook data
  const message = "Thank you for shopping with us!";

  // Send WhatsApp message
  // await sendWhatsAppMessage(phoneNumber, message);
  await sendWhatsappMsg(phoneNumber, message);

  // Log or process the webhook data
  console.log("Received Shopify webhook:", phoneNumber);

  // Respond to Shopify to acknowledge receipt
  res.status(200).send("Webhook received");
});

// DIRECT WHATSAPP
// async function sendWhatsAppMessage(phoneNumber, message) {
//   const url = 'https://graph.facebook.com/v16.0/YOUR_PHONE_NUMBER_ID/messages';
//   const token = 'YOUR_ACCESS_TOKEN';

//   await axios.post(url, {
//     messaging_product: 'whatsapp',
//     to: phoneNumber,
//     text: { body: message },
//   }, {
//     headers: {
//       'Authorization': `Bearer ${token}`,
//       'Content-Type': 'application/json',
//     },
//   });
// }

//INFOBIP
// async function sendWhatsappMsg(phoneNumber, message) {
//   const url = "https://8gpx93.api.infobip.com/whatsapp/1/message/template";
//   const token =
//     "b407f00614d89852e81d33954fe92cad-ca1544a5-491f-4cb0-8a94-40ed88bb3ab7";
//   phoneNumber = phoneNumber.replace(/\s+/g, "");
//   try {
//     const response = await axios.post(
//       url,
//       {
//         messages: [
//           {
//             from: "447860099299",
//             to: phoneNumber,
//             messageId: "d1562e8e-c363-4146-bcc1-05a13a35215b",
//             content: {
//               templateName: "message_test",
//               templateData: {
//                 body: {
//                   placeholders: ["Ahmed"],
//                 },
//               },
//               language: "en",
//             },
//           },
//         ],
//       },
//       {
//         headers: {
//           Authorization: `App ${token}`,
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//       }
//     );

//     console.log("WhatsApp message sent:", response.data);
//   } catch (error) {
//     console.error("Error sending WhatsApp message:", error);
//     throw error; // Rethrow to ensure error handling in the webhook route
//   }
// }

//WATI

async function sendWhatsappMsg(phoneNumber, message) {
  phoneNumber = phoneNumber.replace(/\s+/g, "");
  phoneNumber = phoneNumber.replace("+", "");
  const url = `https://app-server.wati.io/api/v1/sendTemplateMessage?whatsappNumber=${phoneNumber}`;
  const token =
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiMmU5MzdlMi1kOTQ2LTRmZGUtOWY5Ni04NjhmNTg2NjkyYTUiLCJ1bmlxdWVfbmFtZSI6ImFobWVkLWFuc2FyaUBtZWFuMy5jb20iLCJuYW1laWQiOiJhaG1lZC1hbnNhcmlAbWVhbjMuY29tIiwiZW1haWwiOiJhaG1lZC1hbnNhcmlAbWVhbjMuY29tIiwiYXV0aF90aW1lIjoiMDgvMDYvMjAyNCAxMzozNjowOCIsImRiX25hbWUiOiJ3YXRpX2FwcF90cmlhbCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IlRSSUFMIiwiZXhwIjoxNzIzNTkzNjAwLCJpc3MiOiJDbGFyZV9BSSIsImF1ZCI6IkNsYXJlX0FJIn0.WhxrZBOeQ6MV4xQ-B1hpKiGRFQcgvjc4Sas6jNtoT0w";
  // phoneNumber = phoneNumber.replace(/\s+/g, "");
  try {
    const response = await axios.post(
      url,
      {
        template_name: "welcome_wati_v1",
        broadcast_name: "welcome_wati_v1",
        parameters: [
          {
            name: "name",
            value: "Ahmed Ansari",
          },
        ],
      },
      {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json-patch+json",
          Accept: "*/*",
        },
      }
    );

    console.log(
      "WhatsApp message sent through wati whatsapp api:",
      response.data
    );
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    throw error; // Rethrow to ensure error handling in the webhook route
  }
}

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
