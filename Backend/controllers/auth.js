const { User } = require("../models/index.js");
const jwt = require("../services/jwt.js");
const { compare } = require("../services/password.js");

const login = async (req, res) => {
  const { password, email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).send({ message: "Cannot authenticate user" });
    if (await compare(password, user.password)) {
      await User.update({ status: "connected" }, { where: { id: user.id } });
      return res.status(201).send({
        jwt: jwt.encrypt({
          userId: user.key,
          email: user.email,
        }),
      });
    }
    return res.status(400).send({ message: "Cannot authenticate user" });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};
const loggout = async (req, res) => {
  const { user } = req;
  try {
    await User.update({ status: "disconnected" }, { where: { id: user.id } });
    return res.status(200).send({ message: "user disconnected" });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

module.exports = {
  login,
  loggout,
};
