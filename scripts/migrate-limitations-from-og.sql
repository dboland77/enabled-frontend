-- Migration script to populate limitations tables from limitations_OG
-- Run this AFTER create-limitations-tables.sql has been executed

-- =============================================================================
-- STEP 1: Insert unique limitations into the limitations table
-- We'll try to auto-categorize based on common keywords
-- =============================================================================

INSERT INTO limitations (name, description, category)
SELECT DISTINCT
  lo.limitation AS name,
  lo.limitation AS description, -- Using limitation text as description initially
  CASE
    -- Visual limitations
    WHEN LOWER(lo.limitation) LIKE '%vision%' OR 
         LOWER(lo.limitation) LIKE '%visual%' OR 
         LOWER(lo.limitation) LIKE '%sight%' OR 
         LOWER(lo.limitation) LIKE '%blind%' OR 
         LOWER(lo.limitation) LIKE '%eye%' OR
         LOWER(lo.limitation) LIKE '%see%' OR
         LOWER(lo.limitation) LIKE '%reading%' THEN 'Visual'
    
    -- Hearing limitations
    WHEN LOWER(lo.limitation) LIKE '%hear%' OR 
         LOWER(lo.limitation) LIKE '%deaf%' OR 
         LOWER(lo.limitation) LIKE '%audio%' OR
         LOWER(lo.limitation) LIKE '%sound%' OR
         LOWER(lo.limitation) LIKE '%listen%' THEN 'Hearing'
    
    -- Mobility limitations
    WHEN LOWER(lo.limitation) LIKE '%mobil%' OR 
         LOWER(lo.limitation) LIKE '%walk%' OR 
         LOWER(lo.limitation) LIKE '%stand%' OR
         LOWER(lo.limitation) LIKE '%sit%' OR
         LOWER(lo.limitation) LIKE '%move%' OR
         LOWER(lo.limitation) LIKE '%wheelchair%' OR
         LOWER(lo.limitation) LIKE '%balance%' OR
         LOWER(lo.limitation) LIKE '%stair%' OR
         LOWER(lo.limitation) LIKE '%travel%' THEN 'Mobility'
    
    -- Dexterity limitations
    WHEN LOWER(lo.limitation) LIKE '%hand%' OR 
         LOWER(lo.limitation) LIKE '%grip%' OR 
         LOWER(lo.limitation) LIKE '%finger%' OR
         LOWER(lo.limitation) LIKE '%type%' OR
         LOWER(lo.limitation) LIKE '%writing%' OR
         LOWER(lo.limitation) LIKE '%dexterity%' OR
         LOWER(lo.limitation) LIKE '%fine motor%' THEN 'Dexterity'
    
    -- Cognitive limitations
    WHEN LOWER(lo.limitation) LIKE '%memory%' OR 
         LOWER(lo.limitation) LIKE '%concentrat%' OR 
         LOWER(lo.limitation) LIKE '%focus%' OR
         LOWER(lo.limitation) LIKE '%attention%' OR
         LOWER(lo.limitation) LIKE '%learn%' OR
         LOWER(lo.limitation) LIKE '%understand%' OR
         LOWER(lo.limitation) LIKE '%process%' OR
         LOWER(lo.limitation) LIKE '%think%' OR
         LOWER(lo.limitation) LIKE '%cognitive%' OR
         LOWER(lo.limitation) LIKE '%organis%' OR
         LOWER(lo.limitation) LIKE '%organiz%' OR
         LOWER(lo.limitation) LIKE '%plan%' THEN 'Cognitive'
    
    -- Communication limitations
    WHEN LOWER(lo.limitation) LIKE '%speak%' OR 
         LOWER(lo.limitation) LIKE '%speech%' OR 
         LOWER(lo.limitation) LIKE '%talk%' OR
         LOWER(lo.limitation) LIKE '%communicat%' OR
         LOWER(lo.limitation) LIKE '%verbal%' OR
         LOWER(lo.limitation) LIKE '%language%' THEN 'Communication'
    
    -- Energy/Fatigue limitations
    WHEN LOWER(lo.limitation) LIKE '%fatigue%' OR 
         LOWER(lo.limitation) LIKE '%tired%' OR 
         LOWER(lo.limitation) LIKE '%energy%' OR
         LOWER(lo.limitation) LIKE '%exhaust%' OR
         LOWER(lo.limitation) LIKE '%stamina%' OR
         LOWER(lo.limitation) LIKE '%endurance%' THEN 'Energy/Fatigue'
    
    -- Mental Health limitations
    WHEN LOWER(lo.limitation) LIKE '%anxiety%' OR 
         LOWER(lo.limitation) LIKE '%stress%' OR 
         LOWER(lo.limitation) LIKE '%depress%' OR
         LOWER(lo.limitation) LIKE '%panic%' OR
         LOWER(lo.limitation) LIKE '%mental%' OR
         LOWER(lo.limitation) LIKE '%emotion%' OR
         LOWER(lo.limitation) LIKE '%mood%' THEN 'Mental Health'
    
    -- Sensory limitations
    WHEN LOWER(lo.limitation) LIKE '%sensory%' OR 
         LOWER(lo.limitation) LIKE '%sensitiv%' OR 
         LOWER(lo.limitation) LIKE '%light%' OR
         LOWER(lo.limitation) LIKE '%noise%' OR
         LOWER(lo.limitation) LIKE '%touch%' OR
         LOWER(lo.limitation) LIKE '%texture%' THEN 'Sensory'
    
    -- Pain-related limitations
    WHEN LOWER(lo.limitation) LIKE '%pain%' OR 
         LOWER(lo.limitation) LIKE '%discomfort%' OR 
         LOWER(lo.limitation) LIKE '%ache%' THEN 'Pain Management'
    
    -- Default category
    ELSE 'Other'
  END AS category
FROM public."limitations_OG" lo
WHERE lo.limitation IS NOT NULL AND lo.limitation != ''
ON CONFLICT DO NOTHING;

-- =============================================================================
-- STEP 2: Create disability_limitations mappings
-- Links disabilities to their limitations based on the original data
-- =============================================================================

INSERT INTO disability_limitations (disability_id, limitation_id, is_common, notes)
SELECT DISTINCT
  d.id AS disability_id,
  l.id AS limitation_id,
  true AS is_common,
  'Migrated from limitations_OG' AS notes
FROM public."limitations_OG" lo
JOIN disabilities d ON LOWER(TRIM(d.disability_name)) = LOWER(TRIM(lo.disability))
JOIN limitations l ON LOWER(TRIM(l.name)) = LOWER(TRIM(lo.limitation))
ON CONFLICT (disability_id, limitation_id) DO NOTHING;

-- =============================================================================
-- STEP 3: Report on the migration results
-- =============================================================================

-- Count of limitations inserted
SELECT 'Limitations inserted' AS metric, COUNT(*) AS count FROM limitations;

-- Count of disability_limitations mappings created
SELECT 'Disability-Limitation mappings created' AS metric, COUNT(*) AS count FROM disability_limitations;

-- Show any disabilities that didn't match (useful for debugging)
SELECT DISTINCT 
  lo.disability AS unmatched_disability,
  'No matching disability found in disabilities table' AS reason
FROM public."limitations_OG" lo
LEFT JOIN disabilities d ON LOWER(TRIM(d.disability_name)) = LOWER(TRIM(lo.disability))
WHERE d.id IS NULL;

-- Show limitations by category for review
SELECT category, COUNT(*) AS count 
FROM limitations 
GROUP BY category 
ORDER BY count DESC;

-- =============================================================================
-- OPTIONAL: Update categories manually for any 'Other' items
-- Run this SELECT to see what needs manual categorization
-- =============================================================================

-- SELECT id, name, category FROM limitations WHERE category = 'Other';

-- Example update (customize as needed):
-- UPDATE limitations SET category = 'Cognitive' WHERE id = 'your-uuid-here';
