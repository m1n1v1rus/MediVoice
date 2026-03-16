require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Doctor = require('../models/Doctor');
const Clinic = require('../models/Clinic');
const connectDB = require('../config/db');

const doctors = [
  {
    name: 'Dr. Rajesh Sharma',
    specialization: 'General Physician',
    qualification: 'MBBS, MD',
    department: 'General Medicine',
    experience: 15,
    fee: 500,
    rating: 4.5,
    room: '101',
    phone: '9876543001',
    languages: ['Hindi', 'English'],
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    slotDuration: 20,
    isAvailable: true,
  },
  {
    name: 'Dr. Priya Mehta',
    specialization: 'Cardiologist',
    qualification: 'MBBS, DM Cardiology',
    department: 'Cardiology',
    experience: 12,
    fee: 1000,
    rating: 4.8,
    room: '204',
    phone: '9876543002',
    languages: ['Hindi', 'English', 'Gujarati'],
    workingDays: ['Mon', 'Wed', 'Fri'],
    slotDuration: 30,
    isAvailable: true,
  },
  {
    name: 'Dr. Anil Kumar',
    specialization: 'Dermatologist',
    qualification: 'MBBS, MD Dermatology',
    department: 'Dermatology',
    experience: 8,
    fee: 700,
    rating: 4.3,
    room: '305',
    phone: '9876543003',
    languages: ['Hindi', 'English'],
    workingDays: ['Mon', 'Tue', 'Thu', 'Sat'],
    slotDuration: 15,
    isAvailable: true,
  },
  {
    name: 'Dr. Sunita Verma',
    specialization: 'Gastroenterologist',
    qualification: 'MBBS, DM Gastroenterology',
    department: 'Gastroenterology',
    experience: 10,
    fee: 800,
    rating: 4.6,
    room: '202',
    phone: '9876543004',
    languages: ['Hindi', 'English', 'Tamil'],
    workingDays: ['Tue', 'Wed', 'Thu', 'Fri'],
    slotDuration: 20,
    isAvailable: true,
  },
  {
    name: 'Dr. Mohammed Raza',
    specialization: 'ENT',
    qualification: 'MBBS, MS ENT',
    department: 'ENT',
    experience: 6,
    fee: 600,
    rating: 4.2,
    room: '108',
    phone: '9876543005',
    languages: ['Hindi', 'English', 'Urdu'],
    workingDays: ['Mon', 'Tue', 'Wed', 'Fri', 'Sat'],
    slotDuration: 15,
    isAvailable: true,
  },
  {
    name: 'Dr. Kavitha Nair',
    specialization: 'Pediatrician',
    qualification: 'MBBS, MD Pediatrics',
    department: 'Pediatrics',
    experience: 14,
    fee: 600,
    rating: 4.7,
    room: '110',
    phone: '9876543006',
    languages: ['Hindi', 'English', 'Malayalam'],
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    slotDuration: 20,
    isAvailable: true,
  },
];

const seedDB = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Doctor.deleteMany({});
    await Clinic.deleteMany({});

    // Create clinic with admin
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await Clinic.create({
      name: 'City Clinic',
      phone: '+911234567890',
      address: '123 Health Street, Medical City',
      adminEmail: 'admin@cityclinic.com',
      adminPasswordHash: hashedPassword,
      reminderTime: '09:00',
      maxSlotsPerDay: 30,
    });

    // Create doctors
    await Doctor.insertMany(doctors);

    console.log('✅ Database seeded successfully!');
    console.log(`   ${doctors.length} doctors added`);
    console.log('   Admin: admin@cityclinic.com / admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedDB();