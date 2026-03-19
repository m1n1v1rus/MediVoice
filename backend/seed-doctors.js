const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Doctor = require('./models/Doctor');
const Clinic = require('./models/Clinic'); // Assuming we need to link doctors to a clinic

const DOCTORS = [
  {
    name: 'Dr. Rajesh Sharma',
    specialization: 'General Physician',
    qualification: 'MBBS, MD (Internal Medicine)',
    experience: 15,
    fee: 500,
    room: 'Room 101, Ground Floor',
    languages: ['Hindi', 'English'],
    phone: '9876543210',
    email: 'dr.rajesh@medivoice.com'
  },
  {
    name: 'Dr. Priya Mehta',
    specialization: 'Gynecologist',
    qualification: 'MBBS, MS (Obstetrics & Gynecology)',
    experience: 12,
    fee: 600,
    room: 'Room 201, First Floor',
    languages: ['Hindi', 'English', 'Gujarati'],
    phone: '9876543211'
  },
  {
    name: 'Dr. Suresh Kumar',
    specialization: 'Pediatrician',
    qualification: 'MBBS, MD (Pediatrics)',
    experience: 10,
    fee: 400,
    room: 'Room 105, Ground Floor',
    languages: ['Hindi', 'English'],
    phone: '9876543212'
  },
  {
    name: 'Dr. Nandini Rao',
    specialization: 'Ophthalmologist (Eye Specialist)',
    qualification: 'MBBS, MS (Ophthalmology)',
    experience: 13,
    fee: 700,
    room: 'Room 301, Second Floor',
    languages: ['Hindi', 'English', 'Kannada'],
    phone: '9876543213'
  },
  {
    name: 'Dr. Amit Patel',
    specialization: 'Cardiologist',
    qualification: 'MBBS, MD, DM (Cardiology)',
    experience: 20,
    fee: 1200,
    room: 'Room 401, Third Floor',
    languages: ['Hindi', 'English', 'Gujarati'],
    phone: '9876543214'
  },
  {
    name: 'Dr. Anjali Desai',
    specialization: 'Dermatologist (Skin Specialist)',
    qualification: 'MBBS, MD (Dermatology)',
    experience: 8,
    fee: 600,
    room: 'Room 205, First Floor',
    languages: ['Hindi', 'English'],
    phone: '9876543215'
  },
  {
    name: 'Dr. Vinod Bansal',
    specialization: 'Orthopedic Surgeon (Bone Specialist)',
    qualification: 'MBBS, MS (Orthopedics)',
    experience: 18,
    fee: 800,
    room: 'Room 305, Second Floor',
    languages: ['Hindi', 'English'],
    phone: '9876543216'
  },
  {
    name: 'Dr. Sneha Patil',
    specialization: 'Dentist',
    qualification: 'BDS, MDS',
    experience: 7,
    fee: 300,
    room: 'Room 110, Ground Floor',
    languages: ['Hindi', 'English', 'Marathi'],
    phone: '9876543217'
  },
  {
    name: 'Dr. Ramesh Gupta',
    specialization: 'Neurologist',
    qualification: 'MBBS, MD, DM (Neurology)',
    experience: 16,
    fee: 1000,
    room: 'Room 405, Third Floor',
    languages: ['Hindi', 'English'],
    phone: '9876543218'
  },
  {
    name: 'Dr. Kavita Singh',
    specialization: 'Psychiatrist',
    qualification: 'MBBS, MD (Psychiatry)',
    experience: 11,
    fee: 800,
    room: 'Room 210, First Floor',
    languages: ['Hindi', 'English'],
    phone: '9876543219'
  },
  {
    name: 'Dr. Vikram Chauhan',
    specialization: 'ENT Specialist (Ear, Nose, Throat)',
    qualification: 'MBBS, MS (ENT)',
    experience: 14,
    fee: 600,
    room: 'Room 310, Second Floor',
    languages: ['Hindi', 'English'],
    phone: '9876543220'
  },
  {
    name: 'Dr. Maya Reddy',
    specialization: 'Endocrinologist',
    qualification: 'MBBS, MD, DM (Endocrinology)',
    experience: 9,
    fee: 900,
    room: 'Room 410, Third Floor',
    languages: ['Hindi', 'English', 'Telugu'],
    phone: '9876543221'
  },
  {
    name: 'Dr. Rohan Mehra',
    specialization: 'Gastroenterologist',
    qualification: 'MBBS, MD, DM (Gastroenterology)',
    experience: 17,
    fee: 1100,
    room: 'Room 315, Second Floor',
    languages: ['Hindi', 'English'],
    phone: '9876543222'
  },
  {
    name: 'Dr. Shruti Iyer',
    specialization: 'Rheumatologist',
    qualification: 'MBBS, MD, DM (Rheumatology)',
    experience: 10,
    fee: 800,
    room: 'Room 415, Third Floor',
    languages: ['Hindi', 'English', 'Tamil'],
    phone: '9876543223'
  },
  {
    name: 'Dr. Prakash Joshi',
    specialization: 'Urologist',
    qualification: 'MBBS, MS, MCh (Urology)',
    experience: 19,
    fee: 1000,
    room: 'Room 320, Second Floor',
    languages: ['Hindi', 'English'],
    phone: '9876543224'
  },
  {
    name: 'Dr. Neha Ahuja',
    specialization: 'Pulmonologist',
    qualification: 'MBBS, MD (Pulmonary Medicine)',
    experience: 12,
    fee: 700,
    room: 'Room 420, Third Floor',
    languages: ['Hindi', 'English', 'Punjabi'],
    phone: '9876543225'
  },
  {
    name: 'Dr. Samir Khan',
    specialization: 'General Surgeon',
    qualification: 'MBBS, MS (General Surgery)',
    experience: 15,
    fee: 800,
    room: 'Room 215, First Floor',
    languages: ['Hindi', 'English', 'Urdu'],
    phone: '9876543226'
  },
  {
    name: 'Dr. Aarti Nair',
    specialization: 'Oncologist',
    qualification: 'MBBS, MD, DM (Oncology)',
    experience: 14,
    fee: 1500,
    room: 'Room 501, Fourth Floor',
    languages: ['Hindi', 'English', 'Malayalam'],
    phone: '9876543227'
  },
  {
    name: 'Dr. Deepak Verma',
    specialization: 'Nephrologist',
    qualification: 'MBBS, MD, DM (Nephrology)',
    experience: 16,
    fee: 1100,
    room: 'Room 505, Fourth Floor',
    languages: ['Hindi', 'English'],
    phone: '9876543228'
  },
  {
    name: 'Dr. Pooja Das',
    specialization: 'Dietitian/Nutritionist',
    qualification: 'BSc, MSc (Clinical Nutrition)',
    experience: 6,
    fee: 400,
    room: 'Room 115, Ground Floor',
    languages: ['Hindi', 'English', 'Bengali'],
    phone: '9876543229'
  },
  {
    name: 'Dr. Tarun Bhatia',
    specialization: 'Physiotherapist',
    qualification: 'BPT, MPT',
    experience: 8,
    fee: 500,
    room: 'Room 120, Ground Floor',
    languages: ['Hindi', 'English'],
    phone: '9876543230'
  },
  {
    name: 'Dr. Nisha Kapoor',
    specialization: 'General Physician',
    qualification: 'MBBS',
    experience: 5,
    fee: 300,
    room: 'Room 102, Ground Floor',
    languages: ['Hindi', 'English'],
    phone: '9876543231'
  },
  {
    name: 'Dr. Manoj Tiwari',
    specialization: 'Cardiologist',
    qualification: 'MBBS, MD, DM (Cardiology)',
    experience: 22,
    fee: 1300,
    room: 'Room 402, Third Floor',
    languages: ['Hindi', 'English', 'Bhojpuri'],
    phone: '9876543232'
  },
  {
    name: 'Dr. Riya Sen',
    specialization: 'Pediatrician',
    qualification: 'MBBS, DCH',
    experience: 4,
    fee: 350,
    room: 'Room 106, Ground Floor',
    languages: ['Hindi', 'English', 'Bengali'],
    phone: '9876543233'
  },
  {
    name: 'Dr. Kamal Hassan',
    specialization: 'Dentist',
    qualification: 'BDS',
    experience: 12,
    fee: 400,
    room: 'Room 111, Ground Floor',
    languages: ['Hindi', 'English', 'Tamil'],
    phone: '9876543234'
  }
];

// Generate standard time slots for each doctor
const generateSlots = (workingDays, startTime, endTime, durationMinutes) => {
  const slotsMap = new Map();
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startTotalMinutes = startHour * 60 + startMin;
  const endTotalMinutes = endHour * 60 + endMin;
  
  const dailySlots = [];
  for (let t = startTotalMinutes; t < endTotalMinutes; t += durationMinutes) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    dailySlots.push({ time: timeString, isBooked: false });
  }

  // Pre-generate slots for the next 14 days
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    
    if (workingDays.includes(dayName)) {
      slotsMap.set(dateStr, JSON.parse(JSON.stringify(dailySlots))); // deep copy
    }
  }
  
  return slotsMap;
};

const seedDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medivoice';
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected...');

    // Clear existing doctors
    await Doctor.deleteMany({});
    console.log('Cleared existing doctors');

    // Get the first clinic (or create if none exists)
    let clinic = await Clinic.findOne();
    if (!clinic) {
      console.log('No clinic found. Creating default Clinic...');
      clinic = await Clinic.create({
        name: 'MediVoice Super Specialty Hospital',
        email: 'admin@medivoice.com',
        phone: '1800123456',
        password: '$2b$10$YourHashedPasswordHere', // Replace with a real hash if creating from scratch
        address: '123 Health Ave, Medical District'
      });
    }

    const workingDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const startTime = '09:00';
    const endTime = '17:00';
    const slotDuration = 20;

    const slotsMap = generateSlots(workingDays, startTime, endTime, slotDuration);

    const doctorsToInsert = DOCTORS.map(doc => ({
      ...doc,
      clinicId: clinic._id,
      workingDays,
      slotDuration,
      availableSlots: slotsMap,
      isAvailable: true
    }));

    await Doctor.insertMany(doctorsToInsert);
    console.log(`Successfully seeded ${doctorsToInsert.length} doctors!`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();
