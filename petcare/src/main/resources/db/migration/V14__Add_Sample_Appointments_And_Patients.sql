-- Add sample data for vet dashboard testing
-- This migration adds sample pets, owners, vets, and appointments

-- Insert sample users (pet owners and vets)
INSERT IGNORE INTO users (name, email, password, role, created_at) VALUES
('Alice Johnson', 'alice@example.com', '$2a$10$example', 'PET_OWNER', NOW()),
('Bob Smith', 'bob@example.com', '$2a$10$example', 'PET_OWNER', NOW()),
('Carol Davis', 'carol@example.com', '$2a$10$example', 'PET_OWNER', NOW()),
('Dr. John Smith', 'dr.smith@vetclinic.com', '$2a$10$example', 'VETERINARIAN', NOW());

-- Insert sample pet owners
INSERT IGNORE INTO pet_owners (user_id, phone_number, address, created_at) VALUES
((SELECT id FROM users WHERE email = 'alice@example.com'), '555-0101', '123 Main St, City', NOW()),
((SELECT id FROM users WHERE email = 'bob@example.com'), '555-0102', '456 Oak Ave, City', NOW()),
((SELECT id FROM users WHERE email = 'carol@example.com'), '555-0103', '789 Pine Rd, City', NOW());

-- Insert sample veterinarian
INSERT IGNORE INTO veterinarians (user_id, license_number, specialization, years_of_experience, clinic_address, phone_number, created_at) VALUES
((SELECT id FROM users WHERE email = 'dr.smith@vetclinic.com'), 'VET12345', 'General Practice', 10, '100 Vet Street, City', '555-VET1', NOW());

-- Insert sample pets
INSERT IGNORE INTO pets (owner_id, name, species, breed, date_of_birth, gender, microchip_id, notes, health_status, created_at) VALUES
((SELECT id FROM pet_owners WHERE user_id = (SELECT id FROM users WHERE email = 'alice@example.com')), 'Buddy', 'Dog', 'Golden Retriever', '2020-03-15', 'MALE', 'CHIP001', 'Friendly and energetic dog', 'HEALTHY', NOW()),
((SELECT id FROM pet_owners WHERE user_id = (SELECT id FROM users WHERE email = 'bob@example.com')), 'Whiskers', 'Cat', 'Siamese', '2019-07-22', 'FEMALE', 'CHIP002', 'Indoor cat, very social', 'HEALTHY', NOW()),
((SELECT id FROM pet_owners WHERE user_id = (SELECT id FROM users WHERE email = 'carol@example.com')), 'Max', 'Dog', 'German Shepherd', '2021-01-10', 'MALE', 'CHIP003', 'Guard dog, well trained', 'HEALTHY', NOW());

-- Insert sample appointments
INSERT IGNORE INTO appointments (pet_id, veterinarian_id, appointment_date, type, reason, status, notes, prescription, created_at) VALUES
((SELECT id FROM pets WHERE name = 'Buddy'), (SELECT id FROM veterinarians WHERE license_number = 'VET12345'), '2024-12-15 10:00:00', 'CHECKUP', 'Annual wellness exam', 'COMPLETED', 'Pet is in excellent health. Continue current diet and exercise routine.', 'Multivitamin supplements - 1 tablet daily', NOW()),
((SELECT id FROM pets WHERE name = 'Whiskers'), (SELECT id FROM veterinarians WHERE license_number = 'VET12345'), '2024-12-10 14:30:00', 'CHECKUP', 'Senior cat wellness check', 'COMPLETED', 'Some age-related changes noted. Monitor weight and mobility.', 'Joint supplements - 1/2 tablet twice daily', NOW()),
((SELECT id FROM pets WHERE name = 'Max'), (SELECT id FROM veterinarians WHERE license_number = 'VET12345'), '2024-12-08 09:15:00', 'EMERGENCY', 'Stomach upset after eating something unusual', 'COMPLETED', 'Treated for gastric upset. Recovery was quick with proper medication.', 'Metoclopramide 0.5mg/kg twice daily for 3 days', NOW()),
((SELECT id FROM pets WHERE name = 'Buddy'), (SELECT id FROM veterinarians WHERE license_number = 'VET12345'), '2024-11-20 11:00:00', 'VACCINATION', 'Annual vaccinations', 'COMPLETED', 'All vaccinations completed successfully. Next due in 12 months.', 'None', NOW()),
((SELECT id FROM pets WHERE name = 'Whiskers'), (SELECT id FROM veterinarians WHERE license_number = 'VET12345'), '2025-01-15 15:00:00', 'CHECKUP', 'Follow-up examination', 'SCHEDULED', NULL, NULL, NOW());

-- Update existing medical records to link with proper pets
UPDATE medical_records SET pet_id = (SELECT id FROM pets WHERE name = 'Buddy' LIMIT 1) WHERE pet_id = 1;
UPDATE medical_records SET pet_id = (SELECT id FROM pets WHERE name = 'Whiskers' LIMIT 1) WHERE pet_id = 2;
UPDATE medical_records SET pet_id = (SELECT id FROM pets WHERE name = 'Max' LIMIT 1) WHERE pet_id = 3;

-- Update existing health measurements to link with proper pets
UPDATE health_measurements SET pet_id = (SELECT id FROM pets WHERE name = 'Buddy' LIMIT 1) WHERE pet_id = 1;
UPDATE health_measurements SET pet_id = (SELECT id FROM pets WHERE name = 'Whiskers' LIMIT 1) WHERE pet_id = 2;
UPDATE health_measurements SET pet_id = (SELECT id FROM pets WHERE name = 'Max' LIMIT 1) WHERE pet_id = 3;

-- Update existing vaccinations to link with proper pets
UPDATE vaccinations SET pet_id = (SELECT id FROM pets WHERE name = 'Buddy' LIMIT 1) WHERE pet_id = 1;
UPDATE vaccinations SET pet_id = (SELECT id FROM pets WHERE name = 'Whiskers' LIMIT 1) WHERE pet_id = 2;
UPDATE vaccinations SET pet_id = (SELECT id FROM pets WHERE name = 'Max' LIMIT 1) WHERE pet_id = 3;

-- Update existing reminders to link with proper pets
UPDATE reminders SET pet_id = (SELECT id FROM pets WHERE name = 'Buddy' LIMIT 1) WHERE pet_id = 1;
UPDATE reminders SET pet_id = (SELECT id FROM pets WHERE name = 'Whiskers' LIMIT 1) WHERE pet_id = 2;
UPDATE reminders SET pet_id = (SELECT id FROM pets WHERE name = 'Max' LIMIT 1) WHERE pet_id = 3;