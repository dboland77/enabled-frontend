-- Create limitations table and related junction tables for the adjustment wizard
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

-- =============================================================================
-- LIMITATIONS TABLE
-- Core table for storing functional limitations
-- =============================================================================

CREATE TABLE IF NOT EXISTS limitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- e.g., 'Visual', 'Mobility', 'Cognitive', 'Hearing', 'Communication', 'Dexterity', 'Energy/Fatigue'
  severity_levels TEXT[] DEFAULT ARRAY['mild', 'moderate', 'severe'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE limitations ENABLE ROW LEVEL SECURITY;

-- Everyone can read limitations (they are reference data)
CREATE POLICY "Limitations are viewable by everyone"
  ON limitations
  FOR SELECT
  USING (true);

-- =============================================================================
-- DISABILITY_LIMITATIONS JUNCTION TABLE
-- Maps disabilities to their common limitations
-- =============================================================================

CREATE TABLE IF NOT EXISTS disability_limitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  disability_id UUID NOT NULL REFERENCES disabilities(id) ON DELETE CASCADE,
  limitation_id UUID NOT NULL REFERENCES limitations(id) ON DELETE CASCADE,
  is_common BOOLEAN DEFAULT true, -- Whether this is a common limitation for this disability
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(disability_id, limitation_id)
);

-- Enable RLS
ALTER TABLE disability_limitations ENABLE ROW LEVEL SECURITY;

-- Everyone can read disability-limitation mappings
CREATE POLICY "Disability limitations are viewable by everyone"
  ON disability_limitations
  FOR SELECT
  USING (true);

-- =============================================================================
-- LIMITATION_ADJUSTMENTS JUNCTION TABLE
-- Maps limitations to recommended adjustments with relevance scores
-- =============================================================================

CREATE TABLE IF NOT EXISTS limitation_adjustments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  limitation_id UUID NOT NULL REFERENCES limitations(id) ON DELETE CASCADE,
  adjustment_id UUID NOT NULL REFERENCES adjustments(id) ON DELETE CASCADE,
  relevance_score INTEGER DEFAULT 50 CHECK (relevance_score >= 0 AND relevance_score <= 100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(limitation_id, adjustment_id)
);

-- Enable RLS
ALTER TABLE limitation_adjustments ENABLE ROW LEVEL SECURITY;

-- Everyone can read limitation-adjustment mappings
CREATE POLICY "Limitation adjustments are viewable by everyone"
  ON limitation_adjustments
  FOR SELECT
  USING (true);

-- =============================================================================
-- WIZARD_SESSIONS TABLE
-- Stores user progress through the wizard for auto-save
-- =============================================================================

CREATE TABLE IF NOT EXISTS wizard_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 1,
  selected_disabilities UUID[] DEFAULT '{}',
  selected_limitations UUID[] DEFAULT '{}',
  selected_adjustments UUID[] DEFAULT '{}',
  additional_notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE wizard_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own sessions
CREATE POLICY "Users can view their own wizard sessions"
  ON wizard_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wizard sessions"
  ON wizard_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wizard sessions"
  ON wizard_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wizard sessions"
  ON wizard_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- ADJUSTMENT_REQUEST_ITEMS TABLE
-- Links adjustment requests to specific adjustments selected
-- =============================================================================

CREATE TABLE IF NOT EXISTS adjustment_request_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES adjustment_requests(id) ON DELETE CASCADE,
  adjustment_id UUID NOT NULL REFERENCES adjustments(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(request_id, adjustment_id)
);

-- Enable RLS
ALTER TABLE adjustment_request_items ENABLE ROW LEVEL SECURITY;

-- Users can access items for their own requests
CREATE POLICY "Users can view their own adjustment request items"
  ON adjustment_request_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM adjustment_requests
      WHERE adjustment_requests.id = adjustment_request_items.request_id
      AND adjustment_requests.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own adjustment request items"
  ON adjustment_request_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM adjustment_requests
      WHERE adjustment_requests.id = adjustment_request_items.request_id
      AND adjustment_requests.user_id = auth.uid()
    )
  );

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_limitations_category ON limitations(category);
CREATE INDEX IF NOT EXISTS idx_disability_limitations_disability ON disability_limitations(disability_id);
CREATE INDEX IF NOT EXISTS idx_disability_limitations_limitation ON disability_limitations(limitation_id);
CREATE INDEX IF NOT EXISTS idx_limitation_adjustments_limitation ON limitation_adjustments(limitation_id);
CREATE INDEX IF NOT EXISTS idx_limitation_adjustments_adjustment ON limitation_adjustments(adjustment_id);
CREATE INDEX IF NOT EXISTS idx_wizard_sessions_user ON wizard_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_adjustment_request_items_request ON adjustment_request_items(request_id);

-- =============================================================================
-- UPDATE TRIGGER FOR updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_limitations_updated_at
  BEFORE UPDATE ON limitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wizard_sessions_updated_at
  BEFORE UPDATE ON wizard_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
