module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.session && req.session.user) {
      return next();
    }
    return res.redirect('/'); 
  },
  ensureRole: function (role) {
    return function (req, res, next) {
      if (req.session && req.session.user && req.session.user.role === role) {
        return next();
      }
      return res.redirect('/'); 
    };
  }
};