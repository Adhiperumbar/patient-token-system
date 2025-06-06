const express = require('express');
const router = express.Router();
const Token = require('../models/Token');
const Doctor = require('../models/Doctor');
const Symptom = require('../models/Symptom');
const { calculatePriority, assignTriageLevel, calculateWaitTime } = require('../utils/triage');

// Generate unique token number
const generateTokenNumber = async () => {
  try {
    const date = new Date();
    const prefix = String.fromCharCode(65 + date.getHours() % 24); // A-Z based on hour
    const count = await Token.countDocuments();
    return `#${prefix}${(count + 1).toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error generating token number:', error);
    throw new Error('Failed to generate token number');
  }
};

// Get all tokens
router.get('/', async (req, res) => {
  try {
    const tokens = await Token.find().sort({ time: -1 });
    console.log('Sending tokens:', tokens);
    res.json(tokens);
  } catch (err) {
    console.error('Error fetching tokens:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get all doctors (including unavailable ones)
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find();
    console.log('Sending doctors:', doctors);
    res.json(doctors);
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({ message: err.message });
  }
});

// Add new doctor
router.post('/doctors', async (req, res) => {
  try {
    console.log('Received request to add doctor:', req.body);
    const { name, department, specialization, maxPatientsPerHour } = req.body;
    
    // Validate required fields
    if (!name || !department || !specialization || !maxPatientsPerHour) {
      console.log('Missing required fields:', { name, department, specialization, maxPatientsPerHour });
      return res.status(400).json({ 
        message: 'All fields are required: name, department, specialization, maxPatientsPerHour' 
      });
    }

    // Remove "Dr." prefix if present
    const cleanName = name.replace(/^Dr\.\s*/i, '');
    
    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ 
      name: { $regex: new RegExp(cleanName, 'i') } 
    });
    
    if (existingDoctor) {
      console.log('Doctor already exists:', cleanName);
      return res.status(400).json({ 
        message: 'A doctor with this name already exists' 
      });
    }

    // Create new doctor document
    const doctor = new Doctor({
      name: cleanName,
      department,
      specialization,
      maxPatientsPerHour: parseInt(maxPatientsPerHour),
      isAvailable: true,
      currentQueueLength: 0,
      averageWaitTime: 0,
      preferenceCountToday: 0,
      lastResetDate: new Date()
    });

    console.log('Attempting to save new doctor:', doctor.toObject());
    
    // Save the doctor
    const savedDoctor = await doctor.save();
    console.log('Successfully added doctor:', savedDoctor);
    
    // Verify the doctor was saved
    const verifiedDoctor = await Doctor.findById(savedDoctor._id);
    console.log('Verified saved doctor:', verifiedDoctor);
    
    res.status(201).json(savedDoctor);
  } catch (err) {
    console.error('Error adding doctor:', err);
    
    // Handle specific error cases
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Invalid doctor data',
        error: err.message 
      });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: 'A doctor with this name already exists' 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to add doctor',
      error: err.message 
    });
  }
});

// Update doctor availability
router.patch('/doctors/:id', async (req, res) => {
  try {
    console.log('Updating doctor status:', { id: req.params.id, isAvailable: req.body.isAvailable });
    
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      console.log('Doctor not found:', req.params.id);
      return res.status(404).json({ message: 'Doctor not found' });
    }

    doctor.isAvailable = req.body.isAvailable;
    const updatedDoctor = await doctor.save();
    
    console.log('Doctor status updated successfully:', updatedDoctor);
    res.json(updatedDoctor);
  } catch (err) {
    console.error('Error updating doctor status:', err);
    res.status(400).json({ 
      message: 'Failed to update doctor status',
      error: err.message 
    });
  }
});

// Generate new token
router.post('/generate-token', async (req, res) => {
  try {
    console.log('Received token generation request:', req.body);
    const { name, age, gender, department, symptoms, preferredDoctor } = req.body;
    
    // Validate required fields
    if (!name || !age || !gender || !department || !symptoms || !symptoms.length) {
      console.log('Missing required fields:', { name, age, gender, department, symptoms });
      return res.status(400).json({ 
        message: 'All fields are required: name, age, gender, department, and at least one symptom' 
      });
    }

    // Calculate triage score and level
    const triageScore = calculatePriority(symptoms);
    const triageLevel = assignTriageLevel(triageScore);
    console.log('Calculated triage:', { score: triageScore, level: triageLevel });

    // Generate token number
    const tokenNumber = await generateTokenNumber();
    console.log('Generated token number:', tokenNumber);

    // Calculate estimated wait time based on department queue
    const departmentQueue = await Token.countDocuments({ 
      department, 
      status: 'waiting' 
    });
    const estimatedWaitTime = calculateWaitTime(departmentQueue, department);
    console.log('Queue stats:', { department, queueSize: departmentQueue, waitTime: estimatedWaitTime });

    // If preferred doctor is selected, check availability and update their queue
    let assignedDoctor = null;
    if (preferredDoctor && preferredDoctor !== 'no-preference') {
      console.log('Looking for preferred doctor:', preferredDoctor);
      // Remove "Dr." prefix if present and search by name
      const cleanDoctorName = preferredDoctor.replace(/^Dr\.\s*/i, '');
      const doctor = await Doctor.findOne({ name: cleanDoctorName });
      
      if (doctor && doctor.isAvailable) {
        assignedDoctor = doctor._id;
        doctor.currentQueueLength += 1;
        doctor.preferenceCountToday += 1;
        await doctor.save();
        console.log('Assigned doctor:', doctor.name);
      } else {
        console.log('Preferred doctor not available:', preferredDoctor);
      }
    }

    const newToken = new Token({
      token: tokenNumber,
      name,
      age: parseInt(age),
      gender,
      department,
      symptoms,
      triageScore,
      triageLevel,
      status: 'waiting',
      estimatedWaitTime,
      preferredDoctor: assignedDoctor,
      time: new Date()
    });

    console.log('Saving new token:', newToken);
    const savedToken = await newToken.save();
    console.log('Token saved successfully:', savedToken);
    
    res.status(201).json(savedToken);
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ 
      message: error.message || 'Error generating token. Please try again.' 
    });
  }
});

// Get queue sizes
router.get('/queues', async (req, res) => {
  try {
    const queueSizes = await Token.aggregate([
      { $match: { status: 'waiting' } },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);
    console.log('Sending queue sizes:', queueSizes);
    res.json(queueSizes);
  } catch (err) {
    console.error('Error fetching queue sizes:', err);
    res.status(500).json({ message: err.message });
  }
});

// Update token status
router.patch('/:id', async (req, res) => {
  try {
    const token = await Token.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(token);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all symptoms
router.get('/symptoms', async (req, res) => {
  try {
    console.log('Fetching symptoms...');
    const symptoms = await Symptom.find().sort({ triageLevel: -1 });
    console.log('Successfully fetched symptoms:', symptoms);
    res.json(symptoms);
  } catch (err) {
    console.error('Error fetching symptoms:', err);
    res.status(500).json({ 
      message: 'Failed to fetch symptoms',
      error: err.message 
    });
  }
});

// Add new symptom
router.post('/symptoms', async (req, res) => {
  try {
    console.log('Received request to add symptom:', req.body);
    const { name, triageLevel } = req.body;
    
    // Validate required fields
    if (!name || !triageLevel) {
      console.log('Missing required fields:', { name, triageLevel });
      return res.status(400).json({ 
        message: 'Both name and triage level are required' 
      });
    }

    // Create new symptom
    const symptom = new Symptom({
      name: name.toLowerCase().trim(),
      triageLevel: parseInt(triageLevel)
    });

    console.log('Attempting to save symptom:', symptom);
    const savedSymptom = await symptom.save();
    console.log('Successfully saved symptom:', savedSymptom);
    
    res.status(201).json(savedSymptom);
  } catch (err) {
    console.error('Error adding symptom:', err);
    
    // Handle specific error cases
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Invalid symptom data',
        error: err.message 
      });
    }
    
    if (err.message.includes('already exists')) {
      return res.status(400).json({ 
        message: err.message 
      });
    }

    res.status(500).json({ 
      message: 'Failed to add symptom',
      error: err.message 
    });
  }
});

module.exports = router; 