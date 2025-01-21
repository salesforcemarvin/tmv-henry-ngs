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

  const domain = "https://api.telegram.org/bot";
  const url = `${domain}${token}`;

  //TODO: replace with your telegram 
  let chat_id = "@bpisalesforce";
  const token = "7598854488:AAEMWBOFypqRJy5VvgOj-b10u0QrXpC1fXk";


  console.log(
    "@ Debug: Execute -----------------------------------------------"
  );

  try {
    try {
      //let contactKey = req.body.keyValue
      let inArguments = req.body.inArguments;

      console.log(
        "@ Debug: inArguments Execute -----------------------------------------------"
      );
      console.log(inArguments);

      // console.log('@ Debug: Body Execute -----------------------------------------------');
      console.log(req.body);

      const emailAddress = inArguments[0]['emailAddress'];
      const text = inArguments[1]['customMessage'];
      const photo = inArguments[2]['bannerPhoto'];

      //TODO: replace with your information
      // const customerName = "Marvin Lacuna";
      // const email = emailAddress || "mlacuna@salesforce.com";
      // const registerDate =  "21/01/2025";
      // const activeCode = "12345";

      // text = text
      //   .replace("[[customer_name]]", customerName)
      //   .replace("[[email_address]]", email)
      //   .replace("[[registered_date]]", registerDate)
      //   .replace("[[activation_code]]", activeCode);

      // let messenger = {};
      // const endpoint = `${url}/sendMessage`;

      // if (photo) {
      //   endpoint = `${url}/sendPhoto`;
      //   messenger = {
      //     chat_id,
      //     photo,
      //     caption: text,
      //     parse_mode: "HTML",
      //   };
      // } else {
      //   messenger = {
      //     chat_id,
      //     text,
      //     parse_mode: "HTML",
      //   };
      // }

      console.log(
        "@ Debug: Check messenger will be sent --------------------------------------------"
      );
      //console.log(messenger);

      //const response = await axios.post(endpoint, messenger);

      //for testing connectivity
      const response = await axios.get(
        `${url}/sendMessage?chat_id=${chat_id}&text=${customMessage}`      
      );
      //`https://api.telegram.org/bot7598854488:AAEMWBOFypqRJy5VvgOj-b10u0QrXpC1fXk/sendMessage?chat_id=@bpisalesforce&text=hahahahaha`

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
