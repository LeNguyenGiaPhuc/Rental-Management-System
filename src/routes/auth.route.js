const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");

router.post("/login", async (req, res) => {
  const { phone, password } = req.body || {};

  if (!phone || !password) {
    return res.status(400).send("Thiếu dữ liệu");
  }

  try {
    const user = await db("users").where({ phone }).first();

    if (!user) {
      return res.status(401).send("Sai tài khoản");
    }

    const stored = user.password_hash || "";

    let passwordMatches = false;

    if (stored.startsWith("$2")) {
      passwordMatches = await bcrypt.compare(password, stored);
    } else {
      passwordMatches = stored === password;
    }

    if (!passwordMatches) {
      return res.status(401).send("Sai tài khoản");
    }

    req.session.user = {
      id: user.id,
      role: user.role,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
    };
    console.log("LOGIN SUCCESS:", req.session.user);
    req.session.save((err) => {
      if (err) return res.status(500).send("Lỗi session");

      // Chuyển hướng đúng vai trò nhưng đã có session chắc chắn
      if (user.role === "Tenant") return res.redirect("/tenant");
      if (user.role === "Admin") return res.redirect("/admin");
      return res.redirect("/");
    });
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(500).send("Lỗi server");
  }
});

router.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      return res.redirect("/");
    });
  } else {
    return res.redirect("/");
  }
});

module.exports = router;
