const mongoose = require('mongoose');

// Connect to the existing doctors collection
const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['General', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics']
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    trim: true
  },
  maxPatientsPerHour: {
    type: Number,
    required: [true, 'Max patients per hour is required'],
    min: [1, 'Max patients per hour must be at least 1'],
    max: [10, 'Max patients per hour cannot exceed 10']
  },
  currentQueueLength: {
    type: Number,
    default: 0
  },
  averageWaitTime: {
    type: Number,
    default: 0
  },
  preferenceCountToday: {
    type: Number,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  lastResetDate: {
    type: Date,
    default: Date.now
  }
}, { 
  collection: 'doctors',
  strict: false // This allows the schema to be flexible with existing documents
});

// Add pre-save middleware to handle errors
doctorSchema.pre('save', async function(next) {
  try {
    console.log('Pre-save hook - Attempting to save doctor:', this.toObject());
    // Check if the doctor already exists
    const existingDoctor = await this.constructor.findOne({ name: this.name });
    if (existingDoctor && !this.isNew) {
      console.log('Doctor already exists:', existingDoctor);
    }
    next();
  } catch (error) {
    console.error('Pre-save hook error:', error);
    next(error);
  }
});

// Add post-save middleware
doctorSchema.post('save', function(doc) {
  console.log('Post-save hook - Doctor saved successfully:', doc);
});

// Add error handling for validation errors
doctorSchema.post('validate', function(error, doc, next) {
  console.log('Validation error:', error);
  next(error);
});

// Reset preference count at the start of each day
doctorSchema.methods.resetPreferenceCount = function() {
  const now = new Date();
  const lastReset = new Date(this.lastResetDate);
  
  if (now.getDate() !== lastReset.getDate() || 
      now.getMonth() !== lastReset.getMonth() || 
      now.getFullYear() !== lastReset.getFullYear()) {
    this.preferenceCountToday = 0;
    this.lastResetDate = now;
  }
};

// Create and export the model
const Doctor = mongoose.model('Doctor', doctorSchema);

// Log when the model is created
console.log('Doctor model created and connected to existing doctors collection');

// Test the connection by finding all doctors
Doctor.find({})
  .then(doctors => {
    console.log('Current doctors in database:', doctors);
  })
  .catch(err => {
    console.error('Error fetching doctors:', err);
  });

module.exports = Doctor; 