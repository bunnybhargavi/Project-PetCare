-- Add sample medical records for testing vet dashboard
-- This migration adds sample medical records, vaccinations, and health measurements

-- Insert sample medical records (assuming pet IDs 1-3 exist)
INSERT INTO medical_records (pet_id, visit_date, record_type, vet_name, diagnosis, treatment, prescriptions, notes, created_at) VALUES
(1, '2024-12-15', 'CHECKUP', 'Dr. Smith', 'Routine health checkup', 'General examination, weight check', 'Multivitamin supplements', 'Pet is in good health. Recommend regular exercise.', NOW()),
(1, '2024-11-20', 'VACCINATION', 'Dr. Smith', 'Annual vaccination', 'Rabies and DHPP vaccination', 'None', 'Vaccination completed successfully. Next due in 12 months.', NOW()),
(1, '2024-10-05', 'TREATMENT', 'Dr. Smith', 'Skin allergy', 'Antihistamine treatment', 'Cetirizine 5mg twice daily for 7 days', 'Skin condition improved. Avoid allergens.', NOW()),
(2, '2024-12-10', 'CHECKUP', 'Dr. Smith', 'Senior pet wellness exam', 'Comprehensive health screening', 'Joint supplements', 'Age-related changes noted. Monitor mobility.', NOW()),
(2, '2024-11-15', 'LAB_TEST', 'Dr. Smith', 'Blood work analysis', 'Complete blood count and chemistry panel', 'None', 'All values within normal range.', NOW()),
(3, '2024-12-08', 'EMERGENCY', 'Dr. Smith', 'Gastric upset', 'IV fluids and anti-nausea medication', 'Metoclopramide 0.5mg/kg twice daily', 'Condition stabilized. Diet modification recommended.', NOW());

-- Insert sample vaccinations (assuming pet IDs 1-3 exist)
INSERT INTO vaccinations (pet_id, vaccine_name, date_given, next_due_date, batch_number, notes, created_at) VALUES
(1, 'Rabies', '2024-11-20', '2025-11-20', 'RB2024-001', 'Annual rabies vaccination completed', NOW()),
(1, 'DHPP', '2024-11-20', '2025-11-20', 'DH2024-002', 'Distemper, Hepatitis, Parvovirus, Parainfluenza', NOW()),
(2, 'Rabies', '2024-10-15', '2025-10-15', 'RB2024-003', 'Senior pet vaccination', NOW()),
(2, 'FVRCP', '2024-10-15', '2025-10-15', 'FV2024-001', 'Feline viral rhinotracheitis, calicivirus, panleukopenia', NOW()),
(3, 'Rabies', '2024-09-10', '2025-09-10', 'RB2024-004', 'Puppy vaccination series completed', NOW());

-- Insert sample health measurements (using correct structure: weight, temperature, measurement_date)
INSERT INTO health_measurements (pet_id, measurement_date, weight, temperature, notes, created_at) VALUES
(1, '2024-12-15', 25.5, 38.2, 'Ideal weight maintained, normal body temperature', NOW()),
(1, '2024-11-20', 25.3, 38.1, 'Weight stable, temperature normal during vaccination', NOW()),
(1, '2024-10-05', 25.8, 38.5, 'Slight weight gain, temperature elevated due to allergy', NOW()),
(2, '2024-12-10', 4.2, 38.5, 'Slight weight loss noted, temperature normal', NOW()),
(2, '2024-11-15', 4.3, 38.3, 'Weight stable, normal temperature during blood work', NOW()),
(2, '2024-10-01', 4.5, 38.4, 'Previous weight measurement for comparison', NOW()),
(3, '2024-12-08', 8.1, 39.1, 'Weight stable after treatment, temperature slightly elevated during illness', NOW()),
(3, '2024-11-10', 8.0, 38.3, 'Normal weight and temperature before illness', NOW()),
(3, '2024-10-15', 7.8, 38.2, 'Growing puppy, weight increasing normally', NOW());

-- Insert sample reminders (assuming pet IDs 1-3 exist)
INSERT INTO reminders (pet_id, title, description, due_date, status, created_at) VALUES
(1, 'Annual Checkup', 'Schedule annual wellness examination', '2025-12-15', 'PENDING', NOW()),
(1, 'Heartworm Prevention', 'Monthly heartworm prevention due', '2025-01-20', 'PENDING', NOW()),
(2, 'Senior Blood Work', 'Bi-annual blood work for senior pet', '2025-06-15', 'PENDING', NOW()),
(2, 'Dental Cleaning', 'Professional dental cleaning recommended', '2025-03-10', 'PENDING', NOW()),
(3, 'Puppy Training', 'Continue socialization and training', '2025-01-15', 'PENDING', NOW());