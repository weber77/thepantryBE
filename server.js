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

app.post("/api/register", async (req, res) => {
  const { email, password, password2 } = req.body;
  if (!email || !password || !password2)
    return res.json({ ok: false, message: "All fields required" });
  if (password !== password2)
    return res.json({ ok: false, message: "Passwords must match" });
  if (!validator.isEmail(email))
    return res.json({ ok: false, message: "Invalid credentials" });
  try {
    const user = await User.findOne({ email });
    if (user) return res.json({ ok: false, message: "Invalid credentials" });
    const hash = await argon2.hash(password);
    console.log("hash ==>", hash);
    const newUser = {
      email,
      password: hash,
      username: email,
    };
    const newuser = await User.create(newUser);
    const token = jwt.sign(newuser.toJSON(), jwt_secret, { expiresIn: "7d" });
    res.json({
      ok: true,
      message: "Successfully registered",
      token,
      user: newuser,
    });
  } catch (err) {
    res.json({ ok: false, err });
  }
});

app.use("/user", require("../routes/userRoutes"));

const path = require("path");
// app.use(express.static(__dirname));
// app.use(express.static(path.join(__dirname, "../client/build")));

app.get("/*", function (req, res) {
  //   res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  res.send("Hi you Some more text😃");
});

app.listen(port, () => console.log(`Listening on port: ${port}`));
