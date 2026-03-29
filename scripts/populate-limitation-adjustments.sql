-- =============================================================================
-- POPULATE LIMITATION_ADJUSTMENTS TABLE
-- Maps limitations to recommended adjustments using keyword matching
-- Run AFTER: create-limitations-tables.sql and migrate-limitations-from-og.sql
-- =============================================================================

-- This script creates intelligent mappings between limitations and adjustments
-- based on keyword matching and category alignment. It uses a scoring system
-- to assign relevance scores.

-- =============================================================================
-- STEP 1: Create a temporary function for keyword-based matching
-- =============================================================================

CREATE OR REPLACE FUNCTION temp_calculate_relevance(
  limitation_name TEXT,
  limitation_category TEXT,
  adjustment_title TEXT,
  adjustment_category TEXT,
  adjustment_description TEXT
) RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 30; -- Base score
  lim_lower TEXT;
  adj_title_lower TEXT;
  adj_desc_lower TEXT;
BEGIN
  lim_lower := LOWER(limitation_name);
  adj_title_lower := LOWER(adjustment_title);
  adj_desc_lower := LOWER(COALESCE(adjustment_description, ''));
  
  -- Category match bonus (+20)
  IF LOWER(limitation_category) = LOWER(adjustment_category) THEN
    score := score + 20;
  END IF;
  
  -- Direct keyword matches in adjustment title (+30)
  -- Visual/Sight limitations
  IF lim_lower LIKE '%vision%' OR lim_lower LIKE '%sight%' OR lim_lower LIKE '%blind%' OR lim_lower LIKE '%visual%' THEN
    IF adj_title_lower LIKE '%screen%' OR adj_title_lower LIKE '%magnif%' OR adj_title_lower LIKE '%braille%' 
       OR adj_title_lower LIKE '%reader%' OR adj_title_lower LIKE '%contrast%' OR adj_title_lower LIKE '%large%'
       OR adj_title_lower LIKE '%font%' OR adj_title_lower LIKE '%lighting%' OR adj_title_lower LIKE '%text%' THEN
      score := score + 30;
    END IF;
  END IF;
  
  -- Hearing limitations
  IF lim_lower LIKE '%hearing%' OR lim_lower LIKE '%deaf%' OR lim_lower LIKE '%audio%' OR lim_lower LIKE '%listen%' THEN
    IF adj_title_lower LIKE '%caption%' OR adj_title_lower LIKE '%subtitle%' OR adj_title_lower LIKE '%sign%'
       OR adj_title_lower LIKE '%visual%alert%' OR adj_title_lower LIKE '%hearing%' OR adj_title_lower LIKE '%loop%'
       OR adj_title_lower LIKE '%transcript%' OR adj_title_lower LIKE '%written%' THEN
      score := score + 30;
    END IF;
  END IF;
  
  -- Mobility limitations
  IF lim_lower LIKE '%mobil%' OR lim_lower LIKE '%walk%' OR lim_lower LIKE '%stand%' OR lim_lower LIKE '%move%'
     OR lim_lower LIKE '%wheelchair%' OR lim_lower LIKE '%physical%' THEN
    IF adj_title_lower LIKE '%desk%' OR adj_title_lower LIKE '%chair%' OR adj_title_lower LIKE '%elevator%'
       OR adj_title_lower LIKE '%ramp%' OR adj_title_lower LIKE '%remote%' OR adj_title_lower LIKE '%home%'
       OR adj_title_lower LIKE '%parking%' OR adj_title_lower LIKE '%accessible%' OR adj_title_lower LIKE '%ergonomic%' THEN
      score := score + 30;
    END IF;
  END IF;
  
  -- Dexterity/Motor limitations
  IF lim_lower LIKE '%dexterity%' OR lim_lower LIKE '%grip%' OR lim_lower LIKE '%hand%' OR lim_lower LIKE '%finger%'
     OR lim_lower LIKE '%motor%' OR lim_lower LIKE '%fine motor%' THEN
    IF adj_title_lower LIKE '%voice%' OR adj_title_lower LIKE '%speech%' OR adj_title_lower LIKE '%keyboard%'
       OR adj_title_lower LIKE '%mouse%' OR adj_title_lower LIKE '%adaptive%' OR adj_title_lower LIKE '%dictation%'
       OR adj_title_lower LIKE '%ergonomic%' OR adj_title_lower LIKE '%trackball%' THEN
      score := score + 30;
    END IF;
  END IF;
  
  -- Cognitive limitations
  IF lim_lower LIKE '%concentrat%' OR lim_lower LIKE '%memory%' OR lim_lower LIKE '%focus%' OR lim_lower LIKE '%cognitive%'
     OR lim_lower LIKE '%attention%' OR lim_lower LIKE '%process%' OR lim_lower LIKE '%learn%' THEN
    IF adj_title_lower LIKE '%quiet%' OR adj_title_lower LIKE '%break%' OR adj_title_lower LIKE '%schedul%'
       OR adj_title_lower LIKE '%reminder%' OR adj_title_lower LIKE '%written%' OR adj_title_lower LIKE '%instruction%'
       OR adj_title_lower LIKE '%task%' OR adj_title_lower LIKE '%noise%' OR adj_title_lower LIKE '%headphone%' THEN
      score := score + 30;
    END IF;
  END IF;
  
  -- Fatigue/Energy limitations
  IF lim_lower LIKE '%fatigue%' OR lim_lower LIKE '%energy%' OR lim_lower LIKE '%tired%' OR lim_lower LIKE '%stamina%' THEN
    IF adj_title_lower LIKE '%break%' OR adj_title_lower LIKE '%flexible%' OR adj_title_lower LIKE '%rest%'
       OR adj_title_lower LIKE '%remote%' OR adj_title_lower LIKE '%home%' OR adj_title_lower LIKE '%reduced%'
       OR adj_title_lower LIKE '%part%time%' THEN
      score := score + 30;
    END IF;
  END IF;
  
  -- Pain limitations
  IF lim_lower LIKE '%pain%' OR lim_lower LIKE '%discomfort%' OR lim_lower LIKE '%chronic%' THEN
    IF adj_title_lower LIKE '%ergonomic%' OR adj_title_lower LIKE '%chair%' OR adj_title_lower LIKE '%desk%'
       OR adj_title_lower LIKE '%break%' OR adj_title_lower LIKE '%standing%' OR adj_title_lower LIKE '%sit%'
       OR adj_title_lower LIKE '%posture%' OR adj_title_lower LIKE '%support%' THEN
      score := score + 30;
    END IF;
  END IF;
  
  -- Mental health limitations
  IF lim_lower LIKE '%anxiety%' OR lim_lower LIKE '%stress%' OR lim_lower LIKE '%mental%' OR lim_lower LIKE '%depress%' THEN
    IF adj_title_lower LIKE '%quiet%' OR adj_title_lower LIKE '%flexible%' OR adj_title_lower LIKE '%remote%'
       OR adj_title_lower LIKE '%break%' OR adj_title_lower LIKE '%support%' OR adj_title_lower LIKE '%mentor%'
       OR adj_title_lower LIKE '%reduce%' OR adj_title_lower LIKE '%private%' THEN
      score := score + 30;
    END IF;
  END IF;
  
  -- Communication limitations
  IF lim_lower LIKE '%communicat%' OR lim_lower LIKE '%speech%' OR lim_lower LIKE '%speak%' OR lim_lower LIKE '%verbal%' THEN
    IF adj_title_lower LIKE '%written%' OR adj_title_lower LIKE '%email%' OR adj_title_lower LIKE '%text%'
       OR adj_title_lower LIKE '%chat%' OR adj_title_lower LIKE '%aac%' OR adj_title_lower LIKE '%communication%'
       OR adj_title_lower LIKE '%device%' THEN
      score := score + 30;
    END IF;
  END IF;
  
  -- Description keyword match bonus (+10)
  IF adj_desc_lower LIKE '%' || SUBSTRING(lim_lower FROM 1 FOR 6) || '%' THEN
    score := score + 10;
  END IF;
  
  -- Cap at 100
  IF score > 100 THEN
    score := 100;
  END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- STEP 2: Clear existing mappings (optional - comment out to preserve existing)
-- =============================================================================

-- TRUNCATE limitation_adjustments;

-- =============================================================================
-- STEP 3: Insert intelligent mappings
-- =============================================================================

INSERT INTO limitation_adjustments (limitation_id, adjustment_id, relevance_score, notes)
SELECT 
  l.id AS limitation_id,
  a.id AS adjustment_id,
  temp_calculate_relevance(l.name, l.category, a.title, a.category, a.description) AS relevance_score,
  'Auto-generated mapping based on keyword analysis' AS notes
FROM limitations l
CROSS JOIN adjustments a
WHERE temp_calculate_relevance(l.name, l.category, a.title, a.category, a.description) >= 40
ON CONFLICT (limitation_id, adjustment_id) DO UPDATE
SET 
  relevance_score = EXCLUDED.relevance_score,
  notes = 'Updated: ' || EXCLUDED.notes;

-- =============================================================================
-- STEP 4: Add some universal adjustments that help many limitations
-- =============================================================================

-- Flexible working arrangements help many conditions
INSERT INTO limitation_adjustments (limitation_id, adjustment_id, relevance_score, notes)
SELECT 
  l.id,
  a.id,
  60,
  'Universal adjustment - flexible working benefits most conditions'
FROM limitations l
CROSS JOIN adjustments a
WHERE LOWER(a.title) LIKE '%flexible%' OR LOWER(a.title) LIKE '%remote%' OR LOWER(a.title) LIKE '%work from home%'
ON CONFLICT (limitation_id, adjustment_id) DO NOTHING;

-- Ergonomic equipment helps many physical conditions
INSERT INTO limitation_adjustments (limitation_id, adjustment_id, relevance_score, notes)
SELECT 
  l.id,
  a.id,
  55,
  'Universal adjustment - ergonomic equipment benefits many conditions'
FROM limitations l
CROSS JOIN adjustments a
WHERE l.category IN ('Mobility', 'Motor', 'Pain', 'Fatigue')
  AND (LOWER(a.title) LIKE '%ergonomic%' OR LOWER(a.title) LIKE '%adjustable%')
ON CONFLICT (limitation_id, adjustment_id) DO NOTHING;

-- =============================================================================
-- STEP 5: Cleanup
-- =============================================================================

DROP FUNCTION IF EXISTS temp_calculate_relevance;

-- =============================================================================
-- STEP 6: Verification queries
-- =============================================================================

-- Count mappings created
SELECT 'Total limitation-adjustment mappings created:' AS info, COUNT(*) AS count 
FROM limitation_adjustments;

-- Show distribution by relevance score
SELECT 
  CASE 
    WHEN relevance_score >= 80 THEN 'High (80-100)'
    WHEN relevance_score >= 60 THEN 'Medium (60-79)'
    ELSE 'Low (40-59)'
  END AS relevance_tier,
  COUNT(*) AS mapping_count
FROM limitation_adjustments
GROUP BY 1
ORDER BY 1;

-- Sample of top mappings
SELECT 
  l.name AS limitation,
  l.category AS limitation_category,
  a.title AS adjustment,
  la.relevance_score
FROM limitation_adjustments la
JOIN limitations l ON la.limitation_id = l.id
JOIN adjustments a ON la.adjustment_id = a.id
ORDER BY la.relevance_score DESC
LIMIT 20;

-- Show limitations with no mappings (may need manual review)
SELECT l.id, l.name, l.category
FROM limitations l
LEFT JOIN limitation_adjustments la ON l.id = la.limitation_id
WHERE la.id IS NULL;

-- Show adjustments with no mappings (may need manual review)  
SELECT a.id, a.title, a.category
FROM adjustments a
LEFT JOIN limitation_adjustments la ON a.id = la.adjustment_id
WHERE la.id IS NULL;
