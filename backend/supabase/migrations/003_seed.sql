-- Seed test charities
INSERT INTO charities (id, name, description, image_url, is_featured, is_active) VALUES
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Red Cross', 'International humanitarian organization', 'https://via.placeholder.com/200', TRUE, TRUE),
('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Oxfam', 'Global charity fighting poverty', 'https://via.placeholder.com/200', TRUE, TRUE),
('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Doctors Without Borders', 'Medical humanitarian aid', 'https://via.placeholder.com/200', FALSE, TRUE);

-- Note: Admin user should be created via Supabase Auth first, then inserted into users table
-- Example: INSERT INTO users (id, email, full_name, is_admin) VALUES ('<admin-uuid>', 'admin@golf.com', 'Admin User', TRUE);
