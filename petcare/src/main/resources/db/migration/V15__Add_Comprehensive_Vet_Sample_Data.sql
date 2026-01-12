-- V15: Add Comprehensive Sample Data for Vet Dashboard

-- Insert sample veterinarians if they don't exist
INSERT IGNORE INTO veterinarians (id, name, email, phone, specialization, license_number, experience_years, clinic_address, created_at, updated_at)
VALUES 
(1, 'Dr. John Smith', 'john.smith@petcare.com', '+1-555-0101', 'General Practice', 'VET001', 8, '123 Pet Care Street, City, State 12345', NOW(), NOW()),
(2, 'Dr. Sarah Johnson', 'sarah.johnson@petcare.com', '+1-555-0102', 'Surgery', 'VET002', 12, '456 Animal Hospital Ave, City, State 12345', NOW(), NOW()),
(3, 'Dr. Michael Brown', 'michael.brown@petcare.com', '+1-555-0103', 'Cardiology', 'VET003', 15, '789 Veterinary Clinic Blvd, City, State 12345', NOW(), NOW());

-- Insert sample users (pet owners) if they don't exist
INSERT IGNORE INTO users (id, name, email, phone, address, created_at, updated_at)
VALUES 
(101, 'Alice Johnson', 'alice.johnson@email.com', '+1-555-1001', '123 Oak Street, City, State', NOW(), NOW()),
(102, 'Bob Smith', 'bob.smith@email.com', '+1-555-1002', '456 Pine Avenue, City, State', NOW(), NOW()),
(103, 'Carol Davis', 'carol.davis@email.com', '+1-555-1003', '789 Maple Drive, City, State', NOW(), NOW()),
(104, 'David Wilson', 'david.wilson@email.com', '+1-555-1004', '321 Elm Street, City, State', NOW(), NOW()),
(105, 'Emma Brown', 'emma.brown@email.com', '+1-555-1005', '654 Cedar Lane, City, State', NOW(), NOW());

-- Insert sample pets if they don't exist
INSERT IGNORE INTO pets (id, name, species, breed, age, gender, date_of_birth, weight, color, microchip_id, notes, health_status, user_id, created_at, updated_at)
VALUES 
(201, 'Buddy', 'Dog', 'Golden Retriever', 3, 'MALE', '2021-03-15', 28.5, 'Golden', 'MC001', 'Friendly and energetic dog', 'HEALTHY', 101, NOW(), NOW()),
(202, 'Whiskers', 'Cat', 'Persian', 2, 'FEMALE', '2022-01-20', 4.2, 'White', 'MC002', 'Indoor cat, very calm', 'HEALTHY', 102, NOW(), NOW()),
(203, 'Max', 'Dog', 'German Shepherd', 5, 'MALE', '2019-07-10', 35.0, 'Black and Tan', 'MC003', 'Guard dog, well trained', 'HEALTHY', 103, NOW(), NOW()),
(204, 'Luna', 'Cat', 'Siamese', 1, 'FEMALE', '2023-05-12', 3.8, 'Cream and Brown', 'MC004', 'Young and playful', 'HEALTHY', 104, NOW(), NOW()),
(205, 'Charlie', 'Dog', 'Labrador', 4, 'MALE', '2020-09-25', 30.2, 'Chocolate', 'MC005', 'Loves swimming and fetching', 'HEALTHY', 105, NOW(), NOW()),
(206, 'Bella', 'Cat', 'Maine Coon', 6, 'FEMALE', '2018-11-08', 6.5, 'Tabby', 'MC006', 'Large breed cat, gentle nature', 'HEALTHY', 101, NOW(), NOW()),
(207, 'Rocky', 'Dog', 'Bulldog', 3, 'MALE', '2021-04-18', 25.0, 'Brindle', 'MC007', 'Calm and friendly', 'HEALTHY', 102, NOW(), NOW());

-- Insert sample appointments
INSERT IGNORE INTO appointments (id, pet_id, veterinarian_id, appointment_date, type, reason, status, notes, prescription, created_at, updated_at)
VALUES 
(301, 201, 1, '2026-01-15 10:00:00', 'CHECKUP', 'Annual health checkup', 'COMPLETED', 'Pet is in excellent health. All vitals normal.', 'Multivitamin supplement - 1 tablet daily', NOW(), NOW()),
(302, 202, 1, '2026-01-14 14:30:00', 'VACCINATION', 'Annual vaccinations', 'COMPLETED', 'Administered FVRCP vaccine. No adverse reactions.', 'Monitor for 24 hours post-vaccination', NOW(), NOW()),
(303, 203, 2, '2026-01-13 09:15:00', 'SURGERY', 'Dental cleaning', 'COMPLETED', 'Dental cleaning completed successfully. Removed 2 loose teeth.', 'Antibiotics - Amoxicillin 250mg twice daily for 7 days', NOW(), NOW()),
(304, 204, 1, '2026-01-16 11:00:00', 'CHECKUP', 'First puppy visit', 'CONFIRMED', 'Scheduled for comprehensive health assessment', NULL, NOW(), NOW()),
(305, 205, 3, '2026-01-17 15:30:00', 'EMERGENCY', 'Heart murmur check', 'CONFIRMED', 'Follow-up for detected heart murmur', NULL, NOW(), NOW()),
(306, 206, 1, '2026-01-12 13:00:00', 'CHECKUP', 'Senior cat wellness exam', 'COMPLETED', 'Senior wellness exam completed. Kidney function slightly elevated.', 'Kidney support diet recommended', NOW(), NOW()),
(307, 207, 2, '2026-01-18 10:30:00', 'SURGERY', 'Spay surgery consultation', 'PENDING', 'Pre-surgical consultation scheduled', NULL, NOW(), NOW());

-- Insert sample medical records
INSERT IGNORE INTO medical_records (id, pet_id, veterinarian_id, visit_date, record_type, diagnosis, treatment, notes, created_at, updated_at)
VALUES 
(401, 201, 1, '2026-01-15', 'CHECKUP', 'Healthy', 'Routine examination, vaccinations up to date', 'Weight: 28.5kg, Temperature: 101.2°F, Heart rate: 90 bpm. Excellent body condition.', NOW(), NOW()),
(402, 202, 1, '2026-01-14', 'VACCINATION', 'Preventive Care', 'FVRCP vaccination administered', 'No adverse reactions observed. Next vaccination due in 1 year.', NOW(), NOW()),
(403, 203, 2, '2026-01-13', 'DENTAL', 'Dental Disease Grade 2', 'Professional dental cleaning, tooth extraction', 'Removed 2 loose premolars. Gums healing well. Recommend dental chews.', NOW(), NOW()),
(404, 206, 1, '2026-01-12', 'CHECKUP', 'Early Kidney Disease', 'Dietary management, monitoring', 'BUN: 45 mg/dL (elevated), Creatinine: 2.1 mg/dL. Recommend prescription kidney diet.', NOW(), NOW()),
(405, 201, 1, '2025-12-15', 'CHECKUP', 'Healthy', 'Routine 6-month checkup', 'All parameters normal. Continue current diet and exercise routine.', NOW(), NOW()),
(406, 205, 3, '2025-11-20', 'CARDIOLOGY', 'Grade 2 Heart Murmur', 'Cardiac evaluation, ECG performed', 'Functional murmur, no treatment required. Monitor annually.', NOW(), NOW());

-- Insert sample vaccinations
INSERT IGNORE INTO vaccinations (id, pet_id, vaccine_name, date_given, next_due_date, batch_number, notes, created_at, updated_at)
VALUES 
(501, 201, 'DHPP', '2026-01-15', '2027-01-15', 'BATCH001', 'Annual booster administered', NOW(), NOW()),
(502, 201, 'Rabies', '2026-01-15', '2029-01-15', 'BATCH002', '3-year rabies vaccine', NOW(), NOW()),
(503, 202, 'FVRCP', '2026-01-14', '2027-01-14', 'BATCH003', 'Feline core vaccines', NOW(), NOW()),
(504, 202, 'Rabies', '2026-01-14', '2027-01-14', 'BATCH004', 'Annual rabies for cats', NOW(), NOW()),
(505, 203, 'DHPP', '2025-07-10', '2026-07-10', 'BATCH005', 'Due for renewal soon', NOW(), NOW()),
(506, 205, 'DHPP', '2025-09-25', '2026-09-25', 'BATCH006', 'Due for renewal', NOW(), NOW()),
(507, 206, 'FVRCP', '2025-11-08', '2026-11-08', 'BATCH007', 'Senior cat vaccination', NOW(), NOW());

-- Insert sample health measurements
INSERT IGNORE INTO health_measurements (id, pet_id, measurement_type, value, unit, measurement_date, notes, created_at, updated_at)
VALUES 
(601, 201, 'Weight', '28.5', 'kg', '2026-01-15', 'Ideal weight for breed and age', NOW(), NOW()),
(602, 201, 'Temperature', '101.2', '°F', '2026-01-15', 'Normal body temperature', NOW(), NOW()),
(603, 201, 'Heart Rate', '90', 'bpm', '2026-01-15', 'Normal resting heart rate', NOW(), NOW()),
(604, 202, 'Weight', '4.2', 'kg', '2026-01-14', 'Healthy weight for indoor cat', NOW(), NOW()),
(605, 202, 'Temperature', '101.8', '°F', '2026-01-14', 'Normal feline temperature', NOW(), NOW()),
(606, 203, 'Weight', '35.0', 'kg', '2026-01-13', 'Slightly overweight, recommend diet', NOW(), NOW()),
(607, 206, 'BUN', '45', 'mg/dL', '2026-01-12', 'Elevated - monitor kidney function', NOW(), NOW()),
(608, 206, 'Creatinine', '2.1', 'mg/dL', '2026-01-12', 'Elevated - early kidney disease', NOW(), NOW()),
(609, 205, 'Heart Rate', '110', 'bpm', '2025-11-20', 'Slightly elevated due to murmur', NOW(), NOW()),
(610, 204, 'Weight', '3.8', 'kg', '2026-01-10', 'Growing well for age', NOW(), NOW());

-- Insert sample reminders
INSERT IGNORE INTO reminders (id, pet_id, title, description, due_date, reminder_type, is_completed, created_at, updated_at)
VALUES 
(701, 203, 'DHPP Vaccination Due', 'Annual DHPP vaccination is due', '2026-07-10', 'VACCINATION', FALSE, NOW(), NOW()),
(702, 205, 'DHPP Vaccination Due', 'Annual DHPP vaccination is due', '2026-09-25', 'VACCINATION', FALSE, NOW(), NOW()),
(703, 206, 'FVRCP Vaccination Due', 'Annual FVRCP vaccination is due', '2026-11-08', 'VACCINATION', FALSE, NOW(), NOW()),
(704, 206, 'Kidney Function Check', 'Follow-up blood work for kidney function', '2026-04-12', 'CHECKUP', FALSE, NOW(), NOW()),
(705, 205, 'Cardiac Follow-up', 'Annual cardiac evaluation for heart murmur', '2026-11-20', 'CHECKUP', FALSE, NOW(), NOW()),
(706, 207, 'Spay Surgery', 'Schedule spay surgery after consultation', '2026-02-01', 'SURGERY', FALSE, NOW(), NOW()),
(707, 204, 'Kitten Vaccinations', 'Second round of kitten vaccinations', '2026-02-15', 'VACCINATION', FALSE, NOW(), NOW());

-- Insert sample prescriptions (as separate records for the prescription system)
INSERT IGNORE INTO prescriptions (id, pet_id, veterinarian_id, appointment_id, medication_name, dosage, frequency, duration, instructions, status, prescribed_date, created_at, updated_at)
VALUES 
(801, 201, 1, 301, 'Pet Multivitamin', '1 tablet', 'Daily', '30 days', 'Give with food to prevent stomach upset', 'ACTIVE', '2026-01-15', NOW(), NOW()),
(802, 203, 2, 303, 'Amoxicillin', '250mg', 'Twice daily', '7 days', 'Complete full course even if symptoms improve', 'ACTIVE', '2026-01-13', NOW(), NOW()),
(803, 206, 1, 306, 'Kidney Support Diet', 'As directed', 'Daily', 'Ongoing', 'Prescription kidney diet - Hills k/d or Royal Canin Renal', 'ACTIVE', '2026-01-12', NOW(), NOW()),
(804, 205, 3, NULL, 'Enalapril', '2.5mg', 'Twice daily', 'Ongoing', 'For heart support - monitor for side effects', 'ACTIVE', '2025-11-20', NOW(), NOW()),
(805, 202, 1, 302, 'Probiotics', '1 capsule', 'Daily', '14 days', 'Support digestive health post-vaccination', 'COMPLETED', '2026-01-14', NOW(), NOW());

-- Create prescriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS prescriptions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    pet_id BIGINT NOT NULL,
    veterinarian_id BIGINT NOT NULL,
    appointment_id BIGINT NULL,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    instructions TEXT,
    status ENUM('ACTIVE', 'COMPLETED', 'DISCONTINUED') DEFAULT 'ACTIVE',
    prescribed_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
    FOREIGN KEY (veterinarian_id) REFERENCES veterinarians(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
);

-- Insert analytics data (vet performance metrics)
CREATE TABLE IF NOT EXISTS vet_analytics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    veterinarian_id BIGINT NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    metric_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (veterinarian_id) REFERENCES veterinarians(id) ON DELETE CASCADE
);

-- Insert sample analytics data
INSERT IGNORE INTO vet_analytics (veterinarian_id, metric_name, metric_value, metric_date)
VALUES 
-- Dr. John Smith (ID: 1) metrics
(1, 'appointments_completed', 25, '2026-01-01'),
(1, 'patient_satisfaction', 4.8, '2026-01-01'),
(1, 'revenue_generated', 3500.00, '2026-01-01'),
(1, 'average_consultation_time', 35.5, '2026-01-01'),
(1, 'appointments_completed', 28, '2025-12-01'),
(1, 'patient_satisfaction', 4.7, '2025-12-01'),
(1, 'revenue_generated', 3800.00, '2025-12-01'),
(1, 'average_consultation_time', 33.2, '2025-12-01'),

-- Dr. Sarah Johnson (ID: 2) metrics  
(2, 'appointments_completed', 18, '2026-01-01'),
(2, 'patient_satisfaction', 4.9, '2026-01-01'),
(2, 'revenue_generated', 4200.00, '2026-01-01'),
(2, 'average_consultation_time', 45.0, '2026-01-01'),
(2, 'surgeries_performed', 8, '2026-01-01'),

-- Dr. Michael Brown (ID: 3) metrics
(3, 'appointments_completed', 15, '2026-01-01'),
(3, 'patient_satisfaction', 4.9, '2026-01-01'),
(3, 'revenue_generated', 5500.00, '2026-01-01'),
(3, 'average_consultation_time', 50.5, '2026-01-01'),
(3, 'specialist_consultations', 12, '2026-01-01');