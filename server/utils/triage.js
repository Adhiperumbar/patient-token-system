const SYMPTOM_PRIORITY = {
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

const calculatePriority = (symptoms) => {
  // Check for symptom combinations first
  if (symptoms.includes("fever") && symptoms.includes("stiff neck")) {
    return 9;
  }
  if (symptoms.includes("cough") && symptoms.includes("chest pain")) {
    return 8;
  }

  // Calculate based on individual symptoms
  const scores = symptoms.map(symptom => SYMPTOM_PRIORITY[symptom.toLowerCase()] || 1);
  return Math.max(...scores);
};

const assignTriageLevel = (score) => {
  if (score >= 8) {
    return "Critical";
  } else if (score >= 5) {
    return "Moderate";
  }
  return "Low";
};

// Department-specific average consultation times (in minutes)
const DEPARTMENT_CONSULTATION_TIMES = {
  'General': 10,
  'Cardiology': 15,
  'Neurology': 20,
  'Orthopedics': 15,
  'Pediatrics': 12
};

const calculateWaitTime = (queueLength, department) => {
  const averageConsultationTime = DEPARTMENT_CONSULTATION_TIMES[department] || 15; // Default to 15 mins if department not found
  return queueLength * averageConsultationTime;
};

module.exports = {
  calculatePriority,
  assignTriageLevel,
  calculateWaitTime,
  SYMPTOM_PRIORITY
}; 