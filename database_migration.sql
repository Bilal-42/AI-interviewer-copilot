-- Migration to add agent_instructions column and remove interviewer_id
-- Run this in your Supabase SQL editor

-- Add agent_instructions column to interview table
ALTER TABLE interview ADD COLUMN agent_instructions TEXT;

-- Remove interviewer_id column (since we're using GPT voice agent now)
ALTER TABLE interview DROP COLUMN IF EXISTS interviewer_id;

-- Update any existing interviews to have empty agent_instructions
UPDATE interview SET agent_instructions = '' WHERE agent_instructions IS NULL;
