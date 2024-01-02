module.exports = function Logout(req, res) {
  if (req.session.user) {
    res.clearCookie('userId');
    res.send({loggedIn: false})
  }
};