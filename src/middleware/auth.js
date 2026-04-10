module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.session && req.session.user) {
      req.user = req.session.user;
      return next();
    }
    return res.redirect('/'); 
  },
  ensureRole: function (role) {
    return function (req, res, next) {
      const user = (req.user || (req.session && req.session.user));
      if (user && user.role === role) {
        req.user = user;
        return next();
      }
      return res.redirect('/'); 
    };
  }
};