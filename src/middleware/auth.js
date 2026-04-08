module.exports = {
  // 1. Kiểm tra xem người dùng ĐÃ ĐĂNG NHẬP chưa
  ensureAuthenticated: function (req, res, next) {
    if (req.session && req.session.user) {
      return next(); // Có session (đã đăng nhập) -> Cho đi tiếp
    }
    // Chưa đăng nhập -> Đuổi về trang chủ
    return res.redirect('/'); 
  },

  // 2. Kiểm tra xem người dùng CÓ ĐÚNG QUYỀN (Role) không
  ensureRole: function (role) {
    return function (req, res, next) {
      if (req.session && req.session.user && req.session.user.role === role) {
        return next(); // Đúng Role -> Cho đi tiếp
      }
      // Sai Role (Ví dụ Tenant đòi vào trang Admin) -> Đuổi về trang chủ
      return res.redirect('/'); 
    };
  }
};