require("dotenv").config();
const User = require("../../models/userModel");
const argon2 = require("argon2"); //https://github.com/ranisalt/node-argon2/wiki/Options
const jwt = require("jsonwebtoken");
const validator = require("validator");
const jwt_secret = process.env.JWT_SECRET;

// the client is sending this body object
//  {
//     email: form.email,
//     password: form.password,
//     password2: form.password2
//  }
const register = async (req, res) => {
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
};
// the client is sending this body object
//  {
//     email: form.email,
//     password: form.password
//  }
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.json({ ok: false, message: "All field are required" });
  if (!validator.isEmail(email))
    return res.json({ ok: false, message: "invalid data provided" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ ok: false, message: "invalid data provided" });
    const match = await argon2.verify(user.password, password);
    if (match) {
      const token = jwt.sign({ user: user.email }, jwt_secret, {
        expiresIn: "1h",
      }); //{expiresIn:'365d'}
      res.json({ ok: true, message: "welcome back!", token, user });
    } else return res.json({ ok: false, message: "invalid data provided" });
  } catch (err) {
    res.json({ ok: false, err });
  }
};

const verify_token = (req, res) => {
  console.log(req.headers.authorization);
  const token = req.headers.authorization;
  jwt.verify(token, jwt_secret, async (err, succ) => {
    if (err) {
      res.json({ ok: false, message: "something went wrong" });
    } else {
      const user = await User.findOne({ email: succ.user });
      res.json({ ok: true, user });
    }
  });
};

const updateUser = async (req, res) => {
  const { copy } = req.body;
  try {
    const updated = await User.updateOne({ email: copy.email }, { ...copy });
    res.send({ user: copy, updated, ok: true });
  } catch (err) {
    console.error(err);
    res.json({ ok: false, err });
  }
};

const updatePassword = async (req, res) => {
  const { email, old_pw, new_pw, new_pw2 } = req.body;
  console.log(email);
  if (!email || !old_pw || !new_pw || !new_pw2)
    return res.json({ ok: false, message: "all fields required" });
  if (new_pw !== new_pw2)
    return res.json({ ok: false, message: "passwords must match" });
  try {
    //use email to find user const user = use email to find user
    const user = await User.findOne({ email });
    if (!user) return res.json({ ok: false, message: "invalid credentials" });
    //verify/compare password sent with pw in db
    const match = await argon2.verify(user.password, old_pw);
    //if match ->
    if (!match) return res.json({ ok: false, message: "invalid password" });
    //hash pw
    const hashedPw = await argon2.hash(new_pw);
    console.log("hashed new_pw: ", hashedPw);
    //update pw => updateOne ( {email} , {pw: hashed:pw})
    const updatedPw = await User.updateOne({ email }, { password: hashedPw });
    //send succ  message
    return res.send({ ok: true, message: "Password updated successfully" });
    //else
    //send !succ message
  } catch (err) {
    console.error(err);
    res.json({ ok: false, err });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.body;
  console.log(id);
  try {
    const deleted = await User.findByIdAndDelete(id);
    return res.send({ ok: true, message: "Account deleted succesfully" });
  } catch (err) {
    console.error(err);
    res.json({ ok: false, err });
  }
};
module.exports = {
  register,
  login,
  verify_token,
  updateUser,
  updatePassword,
  deleteUser,
};
