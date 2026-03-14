const router = require("express").Router();
const c = require("../controllers/appointmentController");

router.get("/", c.getAll);
router.post("/", c.book);
router.put("/:id/cancel", c.cancel);
router.put("/:id/reschedule", c.reschedule);
router.get("/patient/:phone", c.findByPhone);

module.exports = router;