const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');

// Sample doctors data
const SAMPLE_DOCTORS = [
  {
    name: "John Smith",
    department: "General",
    specialization: "Family Medicine",
    maxPatientsPerHour: 4,
    isAvailable: true,
    currentQueueLength: 0,
    averageWaitTime: 0,
    preferenceCountToday: 0
  },
  {
    name: "Sarah Johnson",
    department: "Cardiology",
    specialization: "Cardiologist",
    maxPatientsPerHour: 3,
    isAvailable: true,
    currentQueueLength: 0,
    averageWaitTime: 0,
    preferenceCountToday: 0
  },
  {
    name: "Michael Chen",
    department: "Neurology",
    specialization: "Neurologist",
    maxPatientsPerHour: 3,
    isAvailable: true,
    currentQueueLength: 0,
    averageWaitTime: 0,
    preferenceCountToday: 0
  },
  {
    name: "Emily Brown",
    department: "Orthopedics",
    specialization: "Orthopedic Surgeon",
    maxPatientsPerHour: 2,
    isAvailable: true,
    currentQueueLength: 0,
    averageWaitTime: 0,
    preferenceCountToday: 0
  },
  {
    name: "David Wilson",
    department: "Pediatrics",
    specialization: "Pediatrician",
    maxPatientsPerHour: 4,
    isAvailable: true,
    currentQueueLength: 0,
    averageWaitTime: 0,
    preferenceCountToday: 0
  }
];

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/hospdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Add sample doctors
async function addSampleDoctors() {
  try {
    console.log('Starting to add sample doctors...');
    
    // Add new doctors only if they don't exist
    for (const doctorData of SAMPLE_DOCTORS) {
      try {
        // Check if doctor already exists
        const existingDoctor = await Doctor.findOne({ name: doctorData.name });
        
        if (!existingDoctor) {
          const doctor = new Doctor(doctorData);
          await doctor.save();
          console.log(`Successfully added doctor: Dr. ${doctor.name}`);
        } else {
          console.log(`Doctor already exists: Dr. ${doctorData.name}`);
        }
      } catch (error) {
        console.error(`Error processing doctor ${doctorData.name}:`, error.message);
      }
    }

    console.log('Sample doctors addition completed');
  } catch (error) {
    console.error('Error during doctor addition:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
}

// Run the script
addSampleDoctors(); 