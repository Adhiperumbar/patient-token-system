const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  department: {
    type: String,
    required: true,
    enum: ['General', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics']
  },
  symptoms: [{
    type: String,
    required: true
  }],
  preferredDoctor: {
    type: String,
    required: false
  },
  triageScore: {
    type: Number,
    required: true,
    default: 1
  },
  triageLevel: {
    type: String,
    enum: ['Critical', 'Moderate', 'Low'],
    required: true,
    default: 'Low'
  },
  time: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['waiting', 'in-progress', 'completed'],
    default: 'waiting'
  },
  reroutedTo: {
    type: String,
    enum: ['General', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics'],
    required: false,
    default: undefined
  },
  estimatedWaitTime: {
    type: Number, // in minutes
    default: 0
  },
  manualHold: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Token', tokenSchema); 