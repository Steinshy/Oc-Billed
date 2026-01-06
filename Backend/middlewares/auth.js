const { User } = require("../models/index.js");
const jwt = require("../services/jwt.js");

module.exports = async (req, res, next) => {
  if (req.headers.authorization) {
    const [, token] = req.headers.authorization.split(" ");
    try {
      const userPayload = await jwt.isValid(token);
      const user = await User.findOne({
        where: { email: userPayload?.data?.email },
      });
      req.user = user;
      next();
      return null;
    } catch (_error) {
      res.status(401).send({
        message: "user not allowed! you should clear your localstorage and retry!",
      });
      return null;
    }
  }
  next();
  return null;
};
