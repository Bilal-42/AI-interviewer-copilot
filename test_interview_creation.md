# Database Migration Required

## Issue
The database is missing the `agent_instructions` column in the `interview` table, causing interview creation to fail.

## Solution
Run this SQL in your Supabase SQL editor:

```sql
-- Add agent_instructions column to interview table
ALTER TABLE interview ADD COLUMN agent_instructions TEXT;

-- Remove interviewer_id column (since we're using GPT voice agent now)
ALTER TABLE interview DROP COLUMN IF EXISTS interviewer_id;

-- Update any existing interviews to have empty agent_instructions
UPDATE interview SET agent_instructions = '' WHERE agent_instructions IS NULL;
```

## After Migration
1. Restart your dev server: `yarn dev`
2. Try creating a new interview
3. The interview should appear in the dashboard
4. You can start the interview using your GPT voice agent

## What Changed
- ✅ Removed `interviewer_id` column (no longer needed)
- ✅ Added `agent_instructions` column for custom GPT voice agent instructions
- ✅ Updated all code to use GPT voice agent instead of Retell
