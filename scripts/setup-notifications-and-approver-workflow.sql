-- =====================================================
-- Notifications and Approver Workflow Setup
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Create notification_type enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM (
            'adjustment_request_submitted',
            'adjustment_request_approved',
            'adjustment_request_declined',
            'adjustment_request_more_info',
            'adjustment_request_pending',
            'adjustment_request_updated',
            'system'
        );
    END IF;
END
$$;

-- 2. Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT NOT NULL DEFAULT 'system',
    category TEXT NOT NULL DEFAULT 'general',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    related_request_id UUID REFERENCES adjustment_requests(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- 3. Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_related_request ON notifications(related_request_id);

-- 4. Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

-- 6. Update adjustment_requests table to add response fields
ALTER TABLE adjustment_requests 
ADD COLUMN IF NOT EXISTS response_message TEXT,
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS requester_name TEXT,
ADD COLUMN IF NOT EXISTS requester_email TEXT;

-- 7. Update RLS policies for adjustment_requests to allow approvers to view/update
-- First, drop existing policies that might conflict
DROP POLICY IF EXISTS "Approvers can view requests assigned to them" ON adjustment_requests;
DROP POLICY IF EXISTS "Approvers can update requests assigned to them" ON adjustment_requests;

-- Allow approvers to view requests assigned to them
CREATE POLICY "Approvers can view requests assigned to them"
    ON adjustment_requests FOR SELECT
    USING (
        auth.uid() = user_id 
        OR approver_id = auth.uid()::text
    );

-- Allow approvers to update requests assigned to them
CREATE POLICY "Approvers can update requests assigned to them"
    ON adjustment_requests FOR UPDATE
    USING (
        auth.uid() = user_id 
        OR approver_id = auth.uid()::text
    );

-- 8. Create a function to send notifications
CREATE OR REPLACE FUNCTION send_notification(
    p_user_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_type TEXT,
    p_category TEXT,
    p_related_request_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (
        user_id,
        title,
        message,
        type,
        category,
        related_request_id,
        metadata
    ) VALUES (
        p_user_id,
        p_title,
        p_message,
        p_type,
        p_category,
        p_related_request_id,
        p_metadata
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create adjustment_request_history table for tracking status changes
CREATE TABLE IF NOT EXISTS adjustment_request_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id UUID NOT NULL REFERENCES adjustment_requests(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_request_history_request_id ON adjustment_request_history(request_id);
CREATE INDEX IF NOT EXISTS idx_request_history_created_at ON adjustment_request_history(created_at DESC);

-- Enable RLS on history table
ALTER TABLE adjustment_request_history ENABLE ROW LEVEL SECURITY;

-- Users can view history for their own requests or requests they're assigned to approve
DROP POLICY IF EXISTS "Users can view relevant request history" ON adjustment_request_history;
CREATE POLICY "Users can view relevant request history"
    ON adjustment_request_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM adjustment_requests ar
            WHERE ar.id = adjustment_request_history.request_id
            AND (ar.user_id = auth.uid() OR ar.approver_id = auth.uid()::text)
        )
    );

-- System can insert history entries
DROP POLICY IF EXISTS "System can insert history" ON adjustment_request_history;
CREATE POLICY "System can insert history"
    ON adjustment_request_history FOR INSERT
    WITH CHECK (true);

-- 10. Grant necessary permissions
GRANT EXECUTE ON FUNCTION send_notification TO authenticated;
