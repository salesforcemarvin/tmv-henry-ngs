const express = require("express");
const axios = require("axios"); // trigger api call
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(express.static("public"));

const config = require("./public/config.json");
app.post("/save", function (req, res) {
  // Handle save request
  console.log("SAVE REQUEST");
  console.log(req.body);
  res.sendStatus(200);
});
app.post("/publish", function (req, res) {
  // Handle publish request
  res.sendStatus(200);
});
app.post("/validate", function (req, res) {
  // Handle validate request
  console.log("VALIDATE REQUEST");
  console.log(req.body);
  res.sendStatus(200);
});
app.post("/stop", async function (req, res) {
  console.log("STOPPING JOURNEY");
  console.log(req.body);
  res.send("Done");
});

const getArgument = (key, arg) => {
  let ret = null;
  if (Array.isArray(arg) && arg.length > 0) {
    arg.forEach((item) => {
      if (typeof item === 'object' && Object.hasOwn(item, key)) {
        ret = item[key];
      }
    });
  }
  return ret;
}

app.post("/execute", async function (req, res) {
  // Endpoint to handle the execution of the custom activity

  console.log("RUNNING CUSTOM ACTIVITY HERE");
  console.log("-------REQUEST------");

  let channel = "@bpisalesforce";
  let contact = "632717898";
  const token = "7598854488:AAEMWBOFypqRJy5VvgOj-b10u0QrXpC1fXk";
  const endpoint = "https://api.telegram.org/bot";
  const url = `${endpoint}${token}`;

  console.log(
    "@ Debug: Execute -----------------------------------------------"
  );
  console.log(req.body);

  // console.log(config);
  try {
    try {
      //let contactKey = req.body.keyValue
      let inArguments = req.body.inArguments;

      console.log(
        "@ Debug: inArguments Execute -----------------------------------------------"
      );
      console.log(inArguments);

      // console.log('@ Debug: Body Execute -----------------------------------------------');
      // console.log(req.body);

      let chat_id = getArgument("telegramID", inArguments);
      let emailAddress = getArgument("emailAddress", inArguments);
      let text = getArgument("customMessage", inArguments);
      let photo = getArgument("bannerPhoto", inArguments);
      let customerName = getArgument("customerName", inArguments);
      let activeCode = getArgument("activationCode", inArguments);
      let registerDate = getArgument("registeredDate", inArguments);

      chat_id = chat_id; //|| contact;

      // customerName = customerName || "Marvin Lacuna";
      // registerDate = registerDate || "21/01/2025";
      // activeCode = activeCode || "12345";

      let messenger = {};

      let endpoint = `${url}/sendMessage`;

      // text = text
      //   .replace("[[customer_name]]", customerName)
      //   .replace("[[registered_date]]", registerDate)
      //   .replace("[[registered_code]]", activeCode);

      if (photo) {
        endpoint = `${url}/sendPhoto`;
        messenger = {
          chat_id,
          photo,
          caption: text,
          parse_mode: "HTML",
        };
      } else {
        messenger = {
          chat_id,
          text,
          parse_mode: "HTML",
        };
      }

      console.log(
        "@ Debug: Check messenger will be sent --------------------------------------------"
      );
      console.log(messenger);

      const response = await axios.post(endpoint, messenger);

      res.send(response.data);
      res.status(200).send({ status: "success" });
    } catch (error) {
      console.error("Error calling Telegram API:", error);
      res.status(500).send({
        error: "An error occurred while Sending Message to Telegram. 555",
      });
    }
  } catch (error) {
    console.error("Error executing custom activity:", error);
    res.status(500).send({
      error: "An error occurred while executing the custom activity. 555",
    });
  }
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//for testing
// const data = {
//   execute: {
//     inArguments: [
//       {
//         contactKey: "LACUNA01",
//         emailAddress: "MMMM@gmail.com",
//       },
//     ]
//   },
// };

// const fs = require("fs");
// fs.readFile(".public/config.json", "utf8", (err, data) => {
//   if (err) {
//     console.error("Error reading the file:", err);
//     return;
//   }
//   const config = JSON.parse(data);
//   console.log(config);
// });
