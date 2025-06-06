const mongoose = require('mongoose');
const Symptom = require('../models/Symptom');

// Old symptoms with their triage levels
const OLD_SYMPTOMS = {
  "chest pain": 9,
  "shortness of breath": 8,
  "severe bleeding": 10,
  "unconsciousness": 10,
  "high fever": 6,
  "vomiting": 5,
  "mild fever": 4,
  "headache": 3,
  "cough": 2,
  "sore throat": 2,
  "stiff neck": 7
};

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

// Migrate symptoms
async function migrateSymptoms() {
  try {
    console.log('Starting symptom migration...');
    
    for (const [name, triageLevel] of Object.entries(OLD_SYMPTOMS)) {
      try {
        // Check if symptom already exists
        const existingSymptom = await Symptom.findOne({ name: name.toLowerCase() });
        
        if (existingSymptom) {
          console.log(`Symptom "${name}" already exists in database`);
          continue;
        }

        // Create new symptom
        const symptom = new Symptom({
          name: name.toLowerCase(),
          triageLevel: triageLevel
        });

        await symptom.save();
        console.log(`Successfully migrated symptom: ${name} (Level ${triageLevel})`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`Symptom "${name}" already exists in database`);
        } else {
          console.error(`Error migrating symptom "${name}":`, error.message);
        }
      }
    }

    console.log('Symptom migration completed');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
}

// Run the migration
migrateSymptoms(); 