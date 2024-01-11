module.exports = function Logout(req, res) {
  if (req.session.user) {
    res.clearCookie('userId');
    res.clearCookie('HRISUserCookie');
    req.session.destroy();
    res.send({loggedIn: false})
  }
};