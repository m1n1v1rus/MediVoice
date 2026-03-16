require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');

async function updateDoctorsWithData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const doctorData = [
      { name: 'Dr. Priya Sharma', specialization: 'General Physician', fee: 300, experience: 8, rating: 4.8 },
      { name: 'Dr. Arjun Patel', specialization: 'Cardiologist', fee: 800, experience: 15, rating: 4.9 },
      { name: 'Dr. Neha Gupta', specialization: 'Dermatologist', fee: 500, experience: 10, rating: 4.7 },
      { name: 'Dr. Rahul Verma', specialization: 'Orthopedic Surgeon', fee: 900, experience: 12, rating: 4.8 },
      { name: 'Dr. Ananya Singh', specialization: 'Pediatrician', fee: 400, experience: 7, rating: 4.6 },
      { name: 'Dr. Vikram Reddy', specialization: 'Neurologist', fee: 700, experience: 14, rating: 4.9 },
      { name: 'Dr. Kavita Joshi', specialization: 'Gynecologist', fee: 600, experience: 11, rating: 4.8 },
      { name: 'Dr. Sanjay Kumar', specialization: 'ENT Specialist', fee: 450, experience: 9, rating: 4.7 },
      { name: 'Dr. Meera Iyer', specialization: 'Ophthalmologist', fee: 550, experience: 13, rating: 4.8 },
      { name: 'Dr. Rajesh Malhotra', specialization: 'Psychiatrist', fee: 400, experience: 8, rating: 4.6 },
      { name: 'Dr. Sunita Agarwal', specialization: 'Endocrinologist', fee: 650, experience: 16, rating: 4.9 },
      { name: 'Dr. Amit Choudhary', specialization: 'Pulmonologist', fee: 550, experience: 12, rating: 4.7 },
      { name: 'Dr. Deepika Nair', specialization: 'Dentist', fee: 200, experience: 6, rating: 4.8 },
      { name: 'Dr. Karan Saxena', specialization: 'Urologist', fee: 700, experience: 14, rating: 4.8 },
      { name: 'Dr. Pooja Mehta', specialization: 'Radiologist', fee: 400, experience: 10, rating: 4.7 },
      { name: 'Dr. Aakash Tiwari', specialization: 'Oncologist', fee: 1000, experience: 18, rating: 4.9 },
      { name: 'Dr. Ritu Kapoor', specialization: 'Rheumatologist', fee: 500, experience: 11, rating: 4.7 },
      { name: 'Dr. Manish Bhatia', specialization: 'Gastroenterologist', fee: 600, experience: 13, rating: 4.8 },
      { name: 'Dr. Sneha Das', specialization: 'Nephrologist', fee: 650, experience: 12, rating: 4.8 },
      { name: 'Dr. Vivek Chauhan', specialization: 'General Surgeon', fee: 750, experience: 15, rating: 4.9 },
      { name: 'Dr. Aditi Rao', specialization: 'Physiotherapist', fee: 300, experience: 7, rating: 4.6 },
      { name: 'Dr. Nikhil Jain', specialization: 'Plastic Surgeon', fee: 1200, experience: 16, rating: 4.9 },
    ];

    console.log('🔄 Updating doctors with fee and experience...\n');

    for (const data of doctorData) {
      const result = await Doctor.updateOne(
        { name: data.name },
        { 
          $set: { 
            fee: data.fee,
            experience: data.experience,
            rating: data.rating
          }
        }
      );
      console.log(`✅ Updated: ${data.name} (Fee: ₹${data.fee}, Exp: ${data.experience}yr)`);
    }

    console.log('\n✅ All doctors updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateDoctorsWithData();
