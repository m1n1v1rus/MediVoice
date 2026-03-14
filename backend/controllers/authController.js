const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Clinic = require("../models/Clinic");

exports.register = async (req, res) => {
  try {
    const { name, email, password, address, phone, timings } = req.body;
    if (!name || !email || !password || !address)
      return res.status(400).json({ error: "name, email, password, address are required" });

    if (await Clinic.findOne({ email }))
      return res.status(409).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 12);
    const clinic = await Clinic.create({ name, email, password: hashed, address, phone, timings });

    const token = jwt.sign({ clinicId: clinic._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, clinic: { id: clinic._id, name: clinic.name, email: clinic.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const clinic = await Clinic.findOne({ email });
    if (!clinic) return res.status(404).json({ error: "Clinic not found" });

    const valid = await bcrypt.compare(password, clinic.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ clinicId: clinic._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, clinic: { id: clinic._id, name: clinic.name, email: clinic.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};