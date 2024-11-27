const express = require("express");
const axios = require("axios"); // trigger api call
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(express.static("public"));

const config = require("./public/config.json");
app.post("/save", function (req, res)  {
  // Handle save request
  console.log("SAVE REQUEST");
  console.log(req.body);
  res.sendStatus(200);
});
app.post("/publish", function (req, res)  {
  // Handle publish request
  console.log("PUBLISH REQUEST");
  console.log(req.body);
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

app.post("/execute", async function (req, res) {
  // Endpoint to handle the execution of the custom activity

  console.log("RUNNING CUSTOM ACTIVITY HERE");
  console.log("-------REQUEST------");
  
  let channel = "@VCB_poc";
  let contact = "632717898";
  const token = "8091993565:AAE_BFhW4GU3e1702RlwdUTycr_DL1gOhBo";
  const endpoint = "https://api.telegram.org/bot";
  const url = `${endpoint}${token}/sendMessage`;

  console.log('@ Debug: Execute -----------------------------------------------');
  console.log(req.body);

  // console.log(config);
  try {
    try {
      const response = await axios.post(url, {
        data: req.body,
      });

      //let contactKey = req.body.keyValue
      let inArguments = req.body.inArguments

      console.log('@ Debug: Execute -----------------------------------------------');
      console.log(inArguments);

      // console.log(inArguments.length);
      // console.log(inArguments[0]['chat_id']);
      // console.log(inArguments[1]['emailAddress']);
      // console.log(inArguments[2]['customMessage']);

      const chat_id = inArguments[0]['chat_id'];
      const emailAddress = inArguments[1]['emailAddress'];
      const customMessage = inArguments[2]['customMessage'];

      // const response = await axios.get(
      //   `${url}sendMessage?chat_id=${chat_id}&text=${emailAddress}`
      // );

      res.send(response.data);
    } catch (error) {
      console.error("Error triggering API call:", error);
      res.status(500).send("Error triggering API call");
    }

    res.status(200).send({ status: "success" });
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
