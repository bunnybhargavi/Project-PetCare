-- Fix the is_active column issue
-- Simply rename the column from is_active to active

-- Check if is_active column exists and rename it
ALTER TABLE products CHANGE COLUMN is_active active BOOLEAN DEFAULT TRUE;

-- Insert sample products for testing
INSERT IGNORE INTO products (title, description, price, stock, category, brand, sku, rating, review_count, active) VALUES
('Premium Dog Food - Chicken & Rice', 'High-quality dry dog food with real chicken and brown rice. Perfect for adult dogs of all sizes.', 45.99, 50, 'FOOD', 'PetNutrition Pro', 'PNP-DOG-001', 4.5, 127, TRUE),
('Organic Cat Treats - Salmon', 'Delicious organic salmon treats for cats. Made with wild-caught salmon and no artificial preservatives.', 12.99, 75, 'FOOD', 'Natural Pet', 'NP-CAT-002', 4.8, 89, TRUE),
('Interactive Puzzle Toy', 'Mental stimulation puzzle toy for dogs. Helps reduce boredom and anxiety.', 24.99, 30, 'TOYS', 'BrainPet', 'BP-TOY-004', 4.6, 203, TRUE),
('Multivitamin Supplements', 'Daily multivitamin supplements for dogs. Supports immune system and overall health.', 29.99, 40, 'HEALTH', 'VitaPet', 'VP-SUP-007', 4.7, 92, TRUE),
('Professional Dog Brush', 'High-quality slicker brush for dogs. Removes loose fur and prevents matting.', 18.99, 55, 'GROOMING', 'GroomPro', 'GP-BRU-010', 4.3, 89, TRUE),
('Adjustable Dog Collar', 'Comfortable adjustable collar for dogs. Available in multiple colors and sizes.', 14.99, 80, 'ACCESSORIES', 'ComfortFit', 'CF-COL-013', 4.2, 198, TRUE),
('Orthopedic Dog Bed', 'Memory foam orthopedic bed for large dogs. Provides superior comfort and joint support.', 89.99, 20, 'BEDS', 'ComfortRest', 'CR-BED-016', 4.8, 167, TRUE),
('Clicker Training Kit', 'Complete clicker training kit with guide book. Perfect for positive reinforcement training.', 19.99, 50, 'TRAINING', 'PositivePet', 'PP-CLI-019', 4.5, 145, TRUE),
('Airline Approved Carrier', 'TSA approved pet carrier for air travel. Comfortable and secure for cats and small dogs.', 79.99, 18, 'TRAVEL', 'SkyPet', 'SP-CAR-021', 4.7, 134, TRUE);