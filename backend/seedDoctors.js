/**
 * Seed script: Inserts 22 doctors into the MediVoice MongoDB database.
 * Run: node seedDoctors.js
 */
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Doctor = require("./models/Doctor");

const generateSlots = (date) => {
  const slots = [];
  for (let h = 9; h <= 17; h++) {
    slots.push({ time: `${h.toString().padStart(2, "0")}:00`, isBooked: false });
    slots.push({ time: `${h.toString().padStart(2, "0")}:30`, isBooked: false });
  }
  return { [date]: slots };
};

const today = new Date().toISOString().split("T")[0];
const tmrw = new Date(Date.now() + 86400000).toISOString().split("T")[0];
const dayAfter = new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0];

const doctors = [
  { name: "Dr. Priya Sharma", specialization: "General Physician", qualification: "MBBS, MD", room: "101", languages: ["Hindi", "English"], isAvailable: true },
  { name: "Dr. Arjun Patel", specialization: "Cardiologist", qualification: "MBBS, DM Cardiology", room: "102", languages: ["Hindi", "English", "Gujarati"], isAvailable: true },
  { name: "Dr. Neha Gupta", specialization: "Dermatologist", qualification: "MBBS, MD Dermatology", room: "103", languages: ["Hindi", "English"], isAvailable: true },
  { name: "Dr. Rahul Verma", specialization: "Orthopedic Surgeon", qualification: "MBBS, MS Ortho", room: "104", languages: ["Hindi", "English"], isAvailable: true },
  { name: "Dr. Ananya Singh", specialization: "Pediatrician", qualification: "MBBS, MD Pediatrics", room: "105", languages: ["Hindi", "English"], isAvailable: true },
  { name: "Dr. Vikram Reddy", specialization: "Neurologist", qualification: "MBBS, DM Neurology", room: "106", languages: ["Hindi", "English", "Telugu"], isAvailable: true },
  { name: "Dr. Kavita Joshi", specialization: "Gynecologist", qualification: "MBBS, MS OBG", room: "107", languages: ["Hindi", "English", "Marathi"], isAvailable: true },
  { name: "Dr. Sanjay Kumar", specialization: "ENT Specialist", qualification: "MBBS, MS ENT", room: "108", languages: ["Hindi", "English"], isAvailable: true },
  { name: "Dr. Meera Iyer", specialization: "Ophthalmologist", qualification: "MBBS, MS Ophthalmology", room: "109", languages: ["Hindi", "English", "Tamil"], isAvailable: true },
  { name: "Dr. Rajesh Malhotra", specialization: "Psychiatrist", qualification: "MBBS, MD Psychiatry", room: "110", languages: ["Hindi", "English", "Punjabi"], isAvailable: true },
  { name: "Dr. Sunita Agarwal", specialization: "Endocrinologist", qualification: "MBBS, DM Endocrinology", room: "111", languages: ["Hindi", "English"], isAvailable: true },
  { name: "Dr. Amit Choudhary", specialization: "Pulmonologist", qualification: "MBBS, DM Pulmonology", room: "112", languages: ["Hindi", "English"], isAvailable: true },
  { name: "Dr. Deepika Nair", specialization: "Dentist", qualification: "BDS, MDS", room: "113", languages: ["Hindi", "English", "Malayalam"], isAvailable: true },
  { name: "Dr. Karan Saxena", specialization: "Urologist", qualification: "MBBS, MCh Urology", room: "114", languages: ["Hindi", "English"], isAvailable: true },
  { name: "Dr. Pooja Mehta", specialization: "Radiologist", qualification: "MBBS, MD Radiology", room: "115", languages: ["Hindi", "English", "Gujarati"], isAvailable: true },
  { name: "Dr. Aakash Tiwari", specialization: "Oncologist", qualification: "MBBS, DM Oncology", room: "116", languages: ["Hindi", "English"], isAvailable: true },
  { name: "Dr. Ritu Kapoor", specialization: "Rheumatologist", qualification: "MBBS, DM Rheumatology", room: "117", languages: ["Hindi", "English"], isAvailable: true },
  { name: "Dr. Manish Bhatia", specialization: "Gastroenterologist", qualification: "MBBS, DM Gastro", room: "118", languages: ["Hindi", "English", "Punjabi"], isAvailable: true },
  { name: "Dr. Sneha Das", specialization: "Nephrologist", qualification: "MBBS, DM Nephrology", room: "119", languages: ["Hindi", "English", "Bengali"], isAvailable: true },
  { name: "Dr. Vivek Chauhan", specialization: "General Surgeon", qualification: "MBBS, MS General Surgery", room: "120", languages: ["Hindi", "English"], isAvailable: true },
  { name: "Dr. Aditi Rao", specialization: "Physiotherapist", qualification: "BPT, MPT", room: "121", languages: ["Hindi", "English", "Kannada"], isAvailable: true },
  { name: "Dr. Nikhil Jain", specialization: "Plastic Surgeon", qualification: "MBBS, MCh Plastic Surgery", room: "122", languages: ["Hindi", "English"], isAvailable: true },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing
    await Doctor.deleteMany({});
    console.log("🗑️  Cleared existing doctors");

    // Insert with slots for 3 days
    const docsWithSlots = doctors.map((d) => ({
      ...d,
      availableSlots: {
        ...generateSlots(today),
        ...generateSlots(tmrw),
        ...generateSlots(dayAfter),
      },
    }));

    await Doctor.insertMany(docsWithSlots);
    console.log(`✅ Inserted ${docsWithSlots.length} doctors with 3-day schedules`);
    console.log("📋 Specializations added:");
    doctors.forEach((d) => console.log(`   • ${d.name} — ${d.specialization} (Room ${d.room})`));

    await mongoose.disconnect();
    console.log("\n🎉 Seeding complete! Database is ready.");
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

seed();
