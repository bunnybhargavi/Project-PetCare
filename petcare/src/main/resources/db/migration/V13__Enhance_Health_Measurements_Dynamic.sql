-- Enhance health_measurements table to support dynamic measurement types
-- Add new columns for flexible health data tracking

ALTER TABLE health_measurements 
ADD COLUMN measurement_type VARCHAR(100),
ADD COLUMN value VARCHAR(255),
ADD COLUMN unit VARCHAR(50),
ADD COLUMN heart_rate DOUBLE,
ADD COLUMN blood_pressure VARCHAR(20),
ADD COLUMN blood_sugar DOUBLE,
ADD COLUMN respiratory_rate DOUBLE,
ADD COLUMN recorded_by_vet_id BIGINT,
ADD COLUMN vet_name VARCHAR(255);

-- Update existing records to have measurement_type for weight and temperature
UPDATE health_measurements 
SET measurement_type = 'Weight', 
    value = CAST(weight AS CHAR), 
    unit = 'kg',
    vet_name = 'Dr. Smith'
WHERE weight IS NOT NULL;

UPDATE health_measurements 
SET measurement_type = 'Temperature', 
    value = CAST(temperature AS CHAR), 
    unit = '°C',
    vet_name = 'Dr. Smith'
WHERE temperature IS NOT NULL AND measurement_type IS NULL;

-- Insert additional dynamic health measurements for testing
INSERT INTO health_measurements (pet_id, measurement_date, measurement_type, value, unit, notes, recorded_by_vet_id, vet_name, created_at) VALUES
-- Heart Rate measurements
(1, '2024-12-15', 'Heart Rate', '85', 'bpm', 'Normal resting heart rate', 1, 'Dr. Smith', NOW()),
(1, '2024-11-20', 'Heart Rate', '90', 'bpm', 'Slightly elevated during vaccination', 1, 'Dr. Smith', NOW()),
(2, '2024-12-10', 'Heart Rate', '120', 'bpm', 'Normal for senior cat', 1, 'Dr. Smith', NOW()),
(3, '2024-12-08', 'Heart Rate', '110', 'bpm', 'Elevated due to stress during illness', 1, 'Dr. Smith', NOW()),

-- Blood Pressure measurements
(1, '2024-12-15', 'Blood Pressure', '120/80', 'mmHg', 'Normal blood pressure', 1, 'Dr. Smith', NOW()),
(2, '2024-12-10', 'Blood Pressure', '140/90', 'mmHg', 'Slightly elevated, monitor', 1, 'Dr. Smith', NOW()),
(2, '2024-11-15', 'Blood Pressure', '135/85', 'mmHg', 'Consistent with age', 1, 'Dr. Smith', NOW()),

-- Blood Sugar measurements
(1, '2024-12-15', 'Blood Sugar', '95', 'mg/dL', 'Normal glucose level', 1, 'Dr. Smith', NOW()),
(2, '2024-12-10', 'Blood Sugar', '110', 'mg/dL', 'Slightly elevated, diet adjustment recommended', 1, 'Dr. Smith', NOW()),
(3, '2024-12-08', 'Blood Sugar', '85', 'mg/dL', 'Normal despite recent illness', 1, 'Dr. Smith', NOW()),

-- Respiratory Rate measurements
(1, '2024-12-15', 'Respiratory Rate', '20', 'breaths/min', 'Normal breathing pattern', 1, 'Dr. Smith', NOW()),
(2, '2024-12-10', 'Respiratory Rate', '25', 'breaths/min', 'Slightly elevated for age', 1, 'Dr. Smith', NOW()),
(3, '2024-12-08', 'Respiratory Rate', '30', 'breaths/min', 'Elevated during illness, now normalized', 1, 'Dr. Smith', NOW()),

-- Custom measurements based on vet requirements
(1, '2024-12-15', 'Body Condition Score', '4/9', 'scale', 'Ideal body condition', 1, 'Dr. Smith', NOW()),
(2, '2024-12-10', 'Dental Score', '2/4', 'scale', 'Mild tartar buildup', 1, 'Dr. Smith', NOW()),
(3, '2024-12-08', 'Hydration Level', 'Normal', 'assessment', 'Good skin elasticity', 1, 'Dr. Smith', NOW()),

-- Pain assessment
(1, '2024-11-20', 'Pain Score', '0/10', 'scale', 'No signs of discomfort', 1, 'Dr. Smith', NOW()),
(2, '2024-12-10', 'Pain Score', '2/10', 'scale', 'Mild joint stiffness', 1, 'Dr. Smith', NOW()),
(3, '2024-12-08', 'Pain Score', '1/10', 'scale', 'Minimal discomfort post-treatment', 1, 'Dr. Smith', NOW());