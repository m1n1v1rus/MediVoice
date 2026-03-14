const router = require("express").Router();
const c = require("../controllers/doctorController");
const auth = require("../middleware/authMiddleware");

router.get("/", c.getAll);
router.get("/available", c.getAvailable);
router.post("/", auth, c.create);
router.put("/:id", auth, c.update);
router.post("/:id/slots", auth, c.generateSlots);

module.exports = router;