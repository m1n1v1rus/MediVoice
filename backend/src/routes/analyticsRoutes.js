const router = require("express").Router();
const c = require("../controllers/analyticsController");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, c.getDashboard);

module.exports = router;