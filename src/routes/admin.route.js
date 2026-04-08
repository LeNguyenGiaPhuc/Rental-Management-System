const express = require("express");
const router = express.Router();
const db = require("../config/db");
const RoomService = require("../services/roomService");
const AccountService = require("../services/accountService");
const TenantService = require("../services/tenantService");
const AdminRequestsController = require('../controllers/admin.requests.controller');
const multer = require("multer");
const path = require("path");
const adminController = require("../controllers/admin.controller");

const auth = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, "room-" + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });
router.use(auth.ensureAuthenticated, auth.ensureRole('Admin'));

router.get('/', (req, res) => {
    res.redirect('/admin/rooms'); 
});

router.get('/rooms', async (req, res) => {
    try {
        const rooms = await db('rooms')
            .leftJoin('users', 'rooms.tenant_id', '=', 'users.id')
            .select('rooms.*', 'users.full_name as current_tenant') 
            .orderBy('rooms.floor', 'asc')
            .orderBy('rooms.room_number', 'asc');
        
        res.render('admin/rooms', { 
            layout: 'admin',
            rooms: rooms,
            error: req.query.error,
            success: req.query.success
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách phòng:", error);
        res.status(500).send("Lỗi server!");
    }
});
router.post('/rooms/add', upload.single('room_image'), async (req, res) => {
    try {
        await RoomService.createRoom(req.body, req.file);

        res.redirect('/admin/rooms?success=Thêm phòng mới thành công!');
    } catch (error) {
        res.redirect('/admin/rooms?error=' + encodeURIComponent(error.message));
    }
});

router.post('/rooms/edit/:id', upload.single('room_image'), async (req, res) => {
    try {
        await RoomService.updateRoom(req.params.id, req.body, req.file);
        res.redirect('/admin/rooms?success=Cập nhật phòng thành công!');
    } catch (error) {
        res.redirect('/admin/rooms?error=' + encodeURIComponent(error.message));
    }
});

router.post('/rooms/delete/:id', async (req, res) => {
    try {
        await RoomService.deleteRoom(req.params.id);
        res.redirect('/admin/rooms?success=Đã xóa phòng thành công!');
    } catch (error) {
        res.redirect('/admin/rooms?error=' + encodeURIComponent(error.message));
    }
});

router.get('/requests', AdminRequestsController.getAllRequests);
router.post('/requests/:id/start', AdminRequestsController.startRequest);
router.post('/requests/:id/complete', AdminRequestsController.completeRequest);
router.put('/requests/:id/start', AdminRequestsController.startRequest);
router.put('/requests/:id/complete', AdminRequestsController.completeRequest);

router.get("/", (req, res) => {
  res.redirect("/admin/rooms");
});

router.get("/rooms", async (req, res) => {
  try {
    const rooms = await db("rooms")
      .leftJoin("users", "rooms.tenant_id", "=", "users.id")
      .select("rooms.*", "users.full_name as current_tenant")
      .orderBy("rooms.floor", "asc")
      .orderBy("rooms.room_number", "asc");

    res.render("admin/rooms", {
      layout: "admin",
      rooms: rooms,
      error: req.query.error,
      success: req.query.success,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách phòng:", error);
    res.status(500).send("Lỗi server!");
  }
});
router.post("/rooms/add", upload.single("room_image"), async (req, res) => {
  try {
    await RoomService.createRoom(req.body, req.file);

    res.redirect("/admin/rooms?success=Thêm phòng mới thành công!");
  } catch (error) {
    res.redirect("/admin/rooms?error=" + encodeURIComponent(error.message));
  }
});

router.post(
  "/rooms/edit/:id",
  upload.single("room_image"),
  async (req, res) => {
    try {
      await RoomService.updateRoom(req.params.id, req.body, req.file);
      res.redirect("/admin/rooms?success=Cập nhật phòng thành công!");
    } catch (error) {
      res.redirect("/admin/rooms?error=" + encodeURIComponent(error.message));
    }
  },
);

router.post("/rooms/delete/:id", async (req, res) => {
  try {
    await RoomService.deleteRoom(req.params.id);
    res.redirect("/admin/rooms?success=Đã xóa phòng thành công!");
  } catch (error) {
    res.redirect("/admin/rooms?error=" + encodeURIComponent(error.message));
  }
});

router.get("/accounts", async (req, res) => {
  try {
    const accounts = await db("users").orderBy("created_at", "desc");

    const availableRooms = await db("rooms")
      .where("status", "Available")
      .orderBy("room_number", "asc");


    res.render("admin/accounts", {
      layout: "admin",
      accounts: accounts,
      availableRooms: availableRooms,
      error: req.query.error,
      success: req.query.success,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách tài khoản:", error);
    res.status(500).send("Lỗi server!");
  }
});

router.post("/accounts/add", async (req, res) => {
  try {
    await AccountService.createAccount(req.body);
    res.redirect(
      "/admin/accounts?success=Đã thêm tài khoản và gán phòng thành công!",
    );
  } catch (error) {
    res.redirect("/admin/accounts?error=" + encodeURIComponent(error.message));
  }
});

router.post("/accounts/edit/:id", async (req, res) => {
  try {
    await AccountService.updateAccount(req.params.id, req.body);
    res.redirect("/admin/accounts?success=Cập nhật tài khoản thành công!");
  } catch (error) {
    res.redirect("/admin/accounts?error=Lỗi cập nhật!");
  }
});

router.post("/accounts/delete/:id", async (req, res) => {
  try {
    await AccountService.deleteAccount(req.params.id);
    res.redirect(
      "/admin/accounts?success=Đã xóa tài khoản vĩnh viễn và giải phóng phòng thành công!",
    );
  } catch (error) {
    res.redirect("/admin/accounts?error=" + encodeURIComponent(error.message));
  }
});

router.get("/tenants", async (req, res) => {
  try {
    const tenants = await TenantService.getAllTenants();

    res.render("admin/tenants", {
      layout: "admin",
      tenants: tenants,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách tenant:", error);
    res.status(500).send("Lỗi server!");
  }
});

const homeController = require("../controllers/home.controller");

router.get("/profile", homeController.getProfile);
router.post("/profile/update",upload.single("avatar"),homeController.updateProfile);

router.post("/payments/create", adminController.createInvoice);

router.get("/payments", async (req, res) => {
  try {
    const payments = await db("invoices")
      .leftJoin("users", "invoices.tenant_id", "users.id")
      .leftJoin("rooms", "invoices.room_id", "rooms.id")
      .select(
        "invoices.*",
        "users.full_name as tenantName",
        "rooms.room_number as room"
      )
      .orderBy("invoices.created_at", "desc");
     // ✅ TÍNH STATS
    let paidTotal = 0;
    let pendingTotal = 0;
    let overdueTotal = 0;

    payments.forEach(p => {
      const amount = Number(p.amount) || 0;

      if (p.status === "Paid") {
        paidTotal += amount;
      } else if (p.status === "Pending") {
        pendingTotal += amount;
      } else if (p.status === "Overdue") {
        overdueTotal += amount;
      }
    });
    const rooms = await db("rooms")
      .join("users", "rooms.tenant_id", "users.id") 
      .select("rooms.id", "rooms.room_number", "rooms.price","rooms.tenant_id","users.full_name as tenantName")
      .whereNotNull("rooms.tenant_id");
    
    for (let room of rooms) {
      if (!room.tenant_id) {  // ✅ skip phòng không có tenant
        room.otherCost = 0;
        continue;
      }
      
      const requests = await db("requests")
        .where({ tenant_id: room.tenant_id, status: "Completed" })
        .sum("estimated_cost as total")
        .first();
      room.otherCost = Number(requests.total) || 0;
    }

    res.render("admin/payments", {
      layout: "admin",
      payments: payments,
      rooms: rooms,
      stats: {
        paidTotal,
        pendingTotal,
        overdueTotal
      }
    
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi server");
  }
});
router.get("/payments/:id", async (req, res) => {
  const invoice = await db("invoices")
    .where({ id: req.params.id })
    .first();
  const tenant = await db('users')
    .where({ id: invoice.tenant_id })
    .first();

  invoice.tenantName = tenant ? tenant.full_name : "Unknown";
  
  res.render("admin/payment-detail", { 
      layout: "admin", 
      invoice: invoice 
  }); 
});
router.post("/payments/:id/delete", async (req, res) => {
  try {
    await db("invoices").where({ id: req.params.id }).delete();
    res.redirect("/admin/payments?success=Xóa hóa đơn thành công!");
  } catch (err) {
    console.error(err);
    res.redirect("/admin/payments?error=Lỗi xóa hóa đơn!");
  }
});
module.exports = router;
