const router = require("express").Router();
const c = require("../controllers/callLogController");

router.get("/", c.getAll);
router.get("/:id", c.getById);

module.exports = router;
