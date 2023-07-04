const express = require("express");
const app = express();
const port = process.env.PORT || 4040;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(require("cors")());

(async function () {
  try {
    await require("mongoose").connect(
      "mongodb+srv://purpleinkpen:purpleinkpen@cluster0.ixwji.mongodb.net/thePantryApp?retryWrites=true&w=majority",
      {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }
    );
    console.log("Connected to the DB");
  } catch (err) {
    console.log(
      "ERROR: Seems like your DB is not running, please start it up !!!"
    );
  }
})();

app.use("/user", require("../routes/userRoutes"));

const path = require("path");
// app.use(express.static(__dirname));
// app.use(express.static(path.join(__dirname, "../client/build")));

app.get("/*", function (req, res) {
  //   res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  res.send("Hi you Some more text😃");
});

app.listen(port, () => console.log(`Listening on port: ${port}`));
