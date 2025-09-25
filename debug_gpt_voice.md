# Debug GPT Voice Agent Issues

## Current Issues:
1. ❌ Can't hear voice when call starts
2. ❌ GPT voice agent not using custom instructions
3. ❌ GPT voice agent not asking the questions from the interview

## Debug Steps:

### 1. Check Browser Console
Open browser dev tools and look for:
- `Starting GPT Realtime call...`
- `Configuring GPT client with instructions:`
- `Agent started speaking`
- `Processing audio response`
- Any error messages

### 2. Check Audio Permissions
- Make sure browser allows microphone access
- Check if audio context is suspended (common issue)

### 3. Test Database Migration
Run this SQL in Supabase:
```sql
ALTER TABLE interview ADD COLUMN agent_instructions TEXT;
ALTER TABLE interview DROP COLUMN IF EXISTS interviewer_id;
UPDATE interview SET agent_instructions = '' WHERE agent_instructions IS NULL;
```

### 4. Test Interview Creation
1. Create a new interview with:
   - Name: "Test Interview"
   - Objective: "Test the GPT voice agent"
   - Agent Instructions: "Speak slowly and clearly"
   - Questions: Add 2-3 test questions
2. Save and start the interview

### 5. Expected Behavior
- GPT should greet the user
- GPT should ask the questions you provided
- You should hear the GPT voice speaking
- Transcript should appear in real-time

## Common Issues:
- **No Audio**: Browser audio context suspended, need user interaction
- **No Questions**: Questions not being passed to GPT client
- **No Instructions**: Custom instructions not being applied
- **Connection Failed**: API key or endpoint issues
