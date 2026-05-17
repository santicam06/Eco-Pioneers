module.exports = {
  ensureLogin: (req, res, next) => {
    if (!req.session.user) {
      res.redirect('/login');
    } else {
      next();
    }
  },
  ensureAdmin: (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
      next();
    } else {
      res.status(403).render("500", { message: "Access Denied: You do not have permission to perform this action." });
    }
  }
};