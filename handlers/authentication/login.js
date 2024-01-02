module.exports = function LoginHandler(req, res) {
  if (req.session.user) {
      res.send({ loggedIn: true, user: req.session.user });
  } else {
      res.send({ loggedIn: false });
  }
}

