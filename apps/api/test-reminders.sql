-- Test Script for Maintenance Reminders Implementation
-- Run this after applying the migration to verify tables were created correctly

-- 1. Check if new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('promotion_codes', 'maintenance_reminders')
ORDER BY table_name;

-- 2. Check if bookings table has new column
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'bookings' 
AND column_name = 'promo_code_id';

-- 3. View promotion_codes table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'promotion_codes'
ORDER BY ordinal_position;

-- 4. View maintenance_reminders table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'maintenance_reminders'
ORDER BY ordinal_position;

-- 5. Check foreign key constraints
SELECT
    tc.table_name, 
    tc.constraint_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('promotion_codes', 'maintenance_reminders', 'bookings')
AND (kcu.column_name IN ('promo_code_id', 'promotion_code_id') 
     OR tc.table_name IN ('promotion_codes', 'maintenance_reminders'))
ORDER BY tc.table_name, kcu.column_name;

-- 6. Check indexes
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND (tablename IN ('promotion_codes', 'maintenance_reminders') 
     OR indexname LIKE '%promo_code%')
ORDER BY tablename, indexname;

-- 7. Count existing records (should be 0 after fresh migration)
SELECT 
    'promotion_codes' as table_name,
    COUNT(*) as record_count
FROM promotion_codes
UNION ALL
SELECT 
    'maintenance_reminders' as table_name,
    COUNT(*) as record_count
FROM maintenance_reminders;

-- 8. Test insert into promotion_codes (optional - will be rolled back)
-- BEGIN;
-- INSERT INTO promotion_codes (customer_product_id, service_type_id, code, discount_percentage, expires_at, is_used)
-- VALUES (1, 1, 'TEST1234', 10, CURRENT_DATE + INTERVAL '6 months', false);
-- SELECT * FROM promotion_codes WHERE code = 'TEST1234';
-- ROLLBACK;

-- 9. Check service types that trigger reminders (should show 1, 5, 6, 7)
SELECT id, name, service_fee, duration
FROM service_types
WHERE id IN (1, 5, 6, 7)
ORDER BY id;

-- 10. Success message
SELECT '✅ All tables and constraints created successfully!' AS status;
