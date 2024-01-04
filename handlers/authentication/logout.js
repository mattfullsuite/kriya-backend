module.exports = function Logout(req, res) {
  if (req.session.user) {
    res.clearCookie('userId');
    req.session.destroy();
    res.send({loggedIn: false})
  }
};