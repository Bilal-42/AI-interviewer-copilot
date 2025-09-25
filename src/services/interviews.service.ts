import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

// Refactored: No user/org required
const getAllInterviews = async () => {
  try {
    const { data, error } = await supabase
      .from("interview")
      .select(`*`)
      .order("created_at", { ascending: false });
    
  return data || [];
  } catch (error) {
    console.log(error);
    
  return [];
  }
};

const getInterviewById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("interview")
      .select(`*`)
      .or(`id.eq.${id},readable_slug.eq.${id}`);

    return data ? data[0] : null;
  } catch (error) {
    console.log(error);

    return [];
  }
};

const updateInterview = async (payload: any, id: string) => {
  const { error, data } = await supabase
    .from("interview")
    .update({ ...payload })
    .eq("id", id);
  if (error) {
    console.log(error);

    return [];
  }

  return data;
};

const deleteInterview = async (id: string) => {
  const { error, data } = await supabase
    .from("interview")
    .delete()
    .eq("id", id);
  if (error) {
    console.log(error);

    return [];
  }

  return data;
};

const getAllRespondents = async (interviewId: string) => {
  try {
    const { data, error } = await supabase
      .from("interview")
      .select(`respondents`)
      .eq("interview_id", interviewId);

    return data || [];
  } catch (error) {
    console.log(error);

    return [];
  }
};

const createInterview = async (payload: any) => {
  // Accept recording_url in payload
  const { agent_instructions, recording_url, ...payloadWithoutAgentInstructions } = payload;
  const insertPayload = { ...payloadWithoutAgentInstructions };
  if (agent_instructions) {
    insertPayload.agent_instructions = agent_instructions;
  }
  if (recording_url) {
    insertPayload.recording_url = recording_url;
  }
  const { error, data } = await supabase
    .from("interview")
    .insert(insertPayload);
  if (error) {
    console.log(error);
    
  return [];
  }
  
  return data;
};
// Upload interview recording and update interview with recording_url
const uploadInterviewRecording = async (interviewId: string, file: File) => {
  // Example: upload to Supabase storage
  const filePath = `recordings/${interviewId}/${file.name}`;
  const { data, error } = await supabase.storage
    .from('interview-recordings')
    .upload(filePath, file);
  if (error) {
    console.log('Upload error:', error);
    
  return null;
  }
  // Get public URL
  const { publicUrl } = supabase.storage
    .from('interview-recordings')
    .getPublicUrl(filePath).data;
  // Update interview with recording_url
  await supabase
    .from('interview')
    .update({ recording_url: publicUrl })
    .eq('id', interviewId);
  
  return publicUrl;
};

const deactivateInterviewsByOrgId = async (organizationId: string) => {
  try {
    const { error } = await supabase
      .from("interview")
      .update({ is_active: false })
      .eq("organization_id", organizationId)
      .eq("is_active", true); // Optional: only update if currently active

    if (error) {
      console.error("Failed to deactivate interviews:", error);
    }
  } catch (error) {
    console.error("Unexpected error disabling interviews:", error);
  }
};

export const InterviewService = {
  getAllInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  getAllRespondents,
  createInterview,
  deactivateInterviewsByOrgId,
  uploadInterviewRecording,
};
