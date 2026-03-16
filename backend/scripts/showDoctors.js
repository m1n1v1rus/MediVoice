require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');

async function showDoctors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('\n=== DOCTORS IN DATABASE ===\n');

    const doctors = await Doctor.find()
      .select('name specialization fee experience rating')
      .sort({ name: 1 });

    doctors.forEach((doc, idx) => {
      console.log(`${idx + 1}. ${doc.name}`);
      console.log(`   Spec: ${doc.specialization} | Fee: ₹${doc.fee} | Exp: ${doc.experience}yr | Rating: ${doc.rating}⭐`);
    });

    console.log(`\n✅ Total Doctors: ${doctors.length}\n`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

showDoctors();
