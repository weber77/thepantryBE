const app = require("express")();
const { v4 } = require("uuid");

app.get("/api", (req, res) => {
  const path = `/api/item/${v4()}`;
  res.setHeader("Content-Type", "text/html");
  res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
  res.end(`Hello! Go to item: <a href="${path}">${path}</a>`);
});

app.get("/api/item/:slug", (req, res) => {
  const { slug } = req.params;
  res.end(`Item: ${slug}`);
});

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

module.exports = app;
