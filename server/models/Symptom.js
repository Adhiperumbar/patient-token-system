const mongoose = require('mongoose');

const symptomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Symptom name is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  triageLevel: {
    type: Number,
    required: [true, 'Triage level is required'],
    min: [1, 'Triage level must be at least 1'],
    max: [10, 'Triage level cannot exceed 10']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add pre-save middleware to handle errors
symptomSchema.pre('save', function(next) {
  console.log('Attempting to save symptom:', this.toObject());
  next();
});

// Add error handling for duplicate key errors
symptomSchema.post('save', function(error, doc, next) {
  console.log('Post-save error handling:', error);
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('A symptom with this name already exists'));
  } else {
    next(error);
  }
});

// Add error handling for validation errors
symptomSchema.post('validate', function(error, doc, next) {
  console.log('Validation error:', error);
  next(error);
});

// Use the main mongoose connection
const Symptom = mongoose.model('Symptom', symptomSchema);

// Log when the model is created
console.log('Symptom model created');

module.exports = Symptom; 