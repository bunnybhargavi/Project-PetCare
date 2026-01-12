-- Migration script for appointment system enhancements
-- Version 2: Add appointment history, notification preferences, and notification logs

-- Create appointment_history table
CREATE TABLE IF NOT EXISTS appointment_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_id BIGINT NOT NULL,
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    reason TEXT,
    changed_by_user_id BIGINT,
    changed_by_role VARCHAR(20),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    INDEX idx_appointment_history_appointment_id (appointment_id),
    INDEX idx_appointment_history_changed_at (changed_at)
);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    email_booking_confirmation BOOLEAN DEFAULT TRUE,
    email_24_hour_reminder BOOLEAN DEFAULT TRUE,
    email_1_hour_reminder BOOLEAN DEFAULT TRUE,
    email_daily_schedule_digest BOOLEAN DEFAULT TRUE,
    email_new_booking_alert BOOLEAN DEFAULT TRUE,
    email_cancellation_notice BOOLEAN DEFAULT TRUE,
    sms_booking_confirmation BOOLEAN DEFAULT FALSE,
    sms_24_hour_reminder BOOLEAN DEFAULT FALSE,
    sms_1_hour_reminder BOOLEAN DEFAULT FALSE,
    push_booking_confirmation BOOLEAN DEFAULT TRUE,
    push_reminders BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notification_preferences_user_id (user_id)
);

-- Create notification_logs table
CREATE TABLE IF NOT EXISTS notification_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    appointment_id BIGINT,
    type VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    content TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',
    error_message TEXT,
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    INDEX idx_notification_logs_user_id (user_id),
    INDEX idx_notification_logs_appointment_id (appointment_id),
    INDEX idx_notification_logs_status (status),
    INDEX idx_notification_logs_type (type),
    INDEX idx_notification_logs_created_at (created_at)
);

-- Add indexes to existing tables for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_appointment_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_reference_number ON appointments(reference_number);
CREATE INDEX IF NOT EXISTS idx_appointments_vet_date ON appointments(veterinarian_id, appointment_date);

CREATE INDEX IF NOT EXISTS idx_appointment_slots_vet_status ON appointment_slots(veterinarian_id, status);
CREATE INDEX IF NOT EXISTS idx_appointment_slots_start_time ON appointment_slots(start_time);
CREATE INDEX IF NOT EXISTS idx_appointment_slots_vet_start_time ON appointment_slots(veterinarian_id, start_time);

CREATE INDEX IF NOT EXISTS idx_veterinarians_specialization ON veterinarians(specialization);
CREATE INDEX IF NOT EXISTS idx_veterinarians_clinic_address ON veterinarians(clinic_address);
CREATE INDEX IF NOT EXISTS idx_veterinarians_teleconsult ON veterinarians(available_for_teleconsult);

-- Update existing appointment_slots table to ensure proper constraints
ALTER TABLE appointment_slots 
MODIFY COLUMN capacity INT NOT NULL DEFAULT 1,
MODIFY COLUMN booked_count INT NOT NULL DEFAULT 0;

-- Add constraint to ensure booked_count doesn't exceed capacity
ALTER TABLE appointment_slots 
ADD CONSTRAINT chk_booked_count_capacity 
CHECK (booked_count <= capacity);

-- Add constraint to ensure booked_count is not negative
ALTER TABLE appointment_slots 
ADD CONSTRAINT chk_booked_count_positive 
CHECK (booked_count >= 0);

-- Ensure appointment dates are in the future (for new appointments)
-- Note: This constraint might need to be handled at application level for flexibility

-- Insert default notification preferences for existing users
INSERT INTO notification_preferences (user_id)
SELECT id FROM users 
WHERE id NOT IN (SELECT user_id FROM notification_preferences);

-- Create a view for appointment statistics (optional)
CREATE OR REPLACE VIEW appointment_statistics AS
SELECT 
    DATE(appointment_date) as appointment_date,
    status,
    type,
    COUNT(*) as count,
    veterinarian_id
FROM appointments 
GROUP BY DATE(appointment_date), status, type, veterinarian_id;

-- Create a view for vet availability summary (optional)
CREATE OR REPLACE VIEW vet_availability_summary AS
SELECT 
    v.id as vet_id,
    v.clinic_name,
    u.name as vet_name,
    COUNT(s.id) as total_slots,
    SUM(CASE WHEN s.status = 'AVAILABLE' AND s.booked_count < s.capacity THEN 1 ELSE 0 END) as available_slots,
    SUM(s.capacity - s.booked_count) as total_available_capacity,
    MIN(CASE WHEN s.status = 'AVAILABLE' AND s.booked_count < s.capacity AND s.start_time > NOW() THEN s.start_time END) as earliest_availability
FROM veterinarians v
JOIN users u ON v.user_id = u.id
LEFT JOIN appointment_slots s ON v.id = s.veterinarian_id
GROUP BY v.id, v.clinic_name, u.name;