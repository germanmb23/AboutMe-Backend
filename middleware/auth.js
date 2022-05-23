// const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
   const username = req.header("x-user-id");
   const clientType = req.headers["x-user-type"];
   if (!username) return res.status(401).send({ error: "Access denied. No user id provided." });
   try {
      req.body.username = parseInt(username);
      req.body.clientType = clientType;

      next();
   } catch (err) {
      res.status(400).send({ error: "Invalid user id." });
   }

   // const token = req.header("x-auth-token");
   // if (!token)
   //   return res.status(401).send({ error: "Access denied. No token provided." });
   // try {
   //   const payload = jwt.verify(token, "jwtPrivateKey");
   //   req.user = payload;
   //   next();
   // } catch (err) {
   //   res.status(400).send({ error: "Invalid token." });
   // }
};
