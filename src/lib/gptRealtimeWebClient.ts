"use client";

import { EventEmitter } from "events";
import { AudioHandler } from "@/lib/audio";
import {
  RTClient,
  RTResponse,
  RTInputAudioItem,
  Modality,
  TurnDetection,
} from "rt-client";
import { user } from "@nextui-org/react";

// Azure Realtime config (from user)
const DEFAULT_IS_AZURE = true;
const DEFAULT_API_KEY = process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY as string;
const DEFAULT_ENDPOINT = process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT as string;
const DEFAULT_DEPLOYMENT = process.env.NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT as string;

if (!DEFAULT_API_KEY || !DEFAULT_ENDPOINT || !DEFAULT_DEPLOYMENT) {
  throw new Error(
    "Missing required Azure OpenAI environment variables. Please set AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, and AZURE_OPENAI_DEPLOYMENT in your .env file."
  );
}
type StartCallParams = { accessToken?: string };

export type TranscriptItem = { role: "agent" | "user"; content: string };

export class GptRealtimeWebClient extends EventEmitter {
  private client: RTClient | null = null;
  private audio: AudioHandler | null = null;
  private connected = false;
  private recording = false;
  private transcript: TranscriptItem[] = [];
  private useVAD = true;
  private customInstructions: string | null = null;
  private interviewQuestions: string[] = [];
  private interviewObjective: string = "";
  private isMicMuted: boolean = false;

  constructor(customInstructions?: string, questions?: string[], objective?: string) {
    super();
    this.customInstructions = customInstructions || null;
    this.interviewQuestions = questions || [];
    this.interviewObjective = objective || "";
  }

  async startCall(_params: StartCallParams = {}) {
    if (this.connected) {
      console.log("Already connected, skipping startCall");
      
return;
    }

    console.log("Starting GPT Realtime call...");
    console.log("Interview questions:", this.interviewQuestions);
    console.log("Interview objective:", this.interviewObjective);
    console.log("Custom instructions:", this.customInstructions);

    const modalities: Modality[] = ["text", "audio"];
    const turnDetection: TurnDetection = this.useVAD ? { type: "server_vad" } : null;

    this.client = DEFAULT_IS_AZURE
      ? new RTClient(new URL(DEFAULT_ENDPOINT), { key: DEFAULT_API_KEY }, { deployment: DEFAULT_DEPLOYMENT })
      : new RTClient({ key: DEFAULT_API_KEY }, { model: "gpt-4o-realtime-preview-2024-10-01" });

    // Build comprehensive instructions with interview context
    let baseInstructions = `You are a friendly, professional interviewer conducting a candidate interview. Follow these CRITICAL RULES:

1. SPEAK **ONLY IN ENGLISH** at all times. Even if the candidate uses another language, respond only in English.
2. Ask **ONLY** the provided questions, in the exact order given, one by one.
3. **Do NOT** ask follow-up questions. If the candidate asks for clarification, you may briefly clarify, but otherwise move directly to the next question.
4. **If a candidate doesn’t know the answer or declines to answer**, do not repeat or rephrase—**skip that question** and continue to the next one.
5. Keep responses **brief, friendly, and professional**—no extra commentary or off-script questions.
6. Wait until the candidate clearly finishes speaking before moving on.
7. If the candidate asks you a question, **politely redirect them** to answer the current question instead of answering theirs.
8. **Never display or speak real-time transcripts in any language other than English**, even if the candidate speaks another language.
9. Maintain a **neutral yet approachable tone** throughout the interview.`;

if (this.interviewObjective) {
  baseInstructions += `\n\nINTERVIEW OBJECTIVE: ${this.interviewObjective}`;
}

if (this.interviewQuestions.length > 0) {
  baseInstructions += `\n\nQUESTIONS TO ASK (ask them one by one in this exact order):\n${this.interviewQuestions
    .map((q, i) => `${i + 1}. ${q}`)
    .join('\n')}`;
}

const configuredInstructions =
  this.customInstructions && this.customInstructions.trim().length > 0
    ? `${baseInstructions}\n\nADDITIONAL INSTRUCTIONS: ${this.customInstructions.trim()}`
    : baseInstructions;

console.log("Configuring GPT client with instructions:", configuredInstructions);

    
    this.client.configure({
      instructions: configuredInstructions,
      input_audio_transcription: { model: "whisper-1"}, // Always transcribe to English
      turn_detection: turnDetection,
      modalities,
      temperature: 0.6,
    });

    this.audio = new AudioHandler();
    try {
      await this.audio.initialize();
    } catch (error) {
      console.error("Failed to initialize audio:", error);
      this.emit("error", error);
      
return;
    }

    this.connected = true;
    this.emit("call_started");

    // Start listening server events
    (async () => {
      if (!this.client) {return;}
      try {
        for await (const ev of this.client.events()) {
          if (ev.type === "response") {
            await this.handleResponse(ev);
          } else if (ev.type === "input_audio") {
            await this.handleInputAudio(ev);
          }
        }
      } catch (e) {
        this.emit("error", e);
        this.stopCall();
      }
    })().catch((e) => this.emit("error", e));

    // Start mic streaming
    await this.startMic();
  }

  async stopCall() {
    try {
      this.stopMic();
      this.audio?.stopStreamingPlayback();
      await this.client?.close();
    } catch (e) {
      // ignore
    } finally {
      this.client = null;
      this.connected = false;
      this.emit("call_ended");
      // push final transcript update to listeners
      this.emit("update", { transcript: this.transcript });
    }
  }

  private async startMic() {
    if (!this.client || !this.audio || this.recording) {
      return;
    }

    await this.audio.startRecording(async (chunk) => {
      if (this.isMicMuted) {
        return;
      }
      await this.client?.sendAudio(chunk);
    });
    this.recording = true;
  }

  private stopMic() {
    if (!this.audio || !this.recording) {
      return;
    }
    this.audio.stopRecording();
    this.recording = false;
  }

  private async handleResponse(response: RTResponse) {
    try {
      for await (const item of response) {
        if (item.type === "message" && item.role === "assistant") {
          // agent speaking
          console.log("Agent started speaking");
          this.emit("agent_start_talking");
          let textCollected = "";
          for await (const content of item) {
            if (content.type === "text") {
              for await (const text of content.textChunks()) {
                textCollected += text;
              }
            } else if (content.type === "audio") {
              console.log("Processing audio response");
              const textTask = (async () => {
                for await (const text of content.transcriptChunks()) {
                  textCollected += text;
                }
              })();
              const audioTask = (async () => {
                try {
                  await this.audio?.startStreamingPlayback();
                  for await (const audio of content.audioChunks()) {
                    this.audio?.playChunk(audio);
                  }
                } catch (audioError) {
                  console.error("Audio playback error:", audioError);
                }
              })();
              await Promise.all([textTask, audioTask]);
            }
          }
          // Push a single transcript entry for the completed assistant turn
          if (textCollected.trim().length > 0) {
            this.bumpTranscript("agent", textCollected);
          }
          console.log("Agent finished speaking");
          this.emit("agent_stop_talking");
        }
      }
    } catch (error) {
      console.error("Error handling response:", error);
      this.emit("error", error);
    }
  }

  private async handleInputAudio(item: RTInputAudioItem) {
    // user finished a VAD turn
    this.audio?.stopStreamingPlayback();
    await item.waitForCompletion();
    const userText = item.transcription || "";
    // Simple non-English filter: drop non-ASCII-heavy text to avoid hallucinated Urdu display
    const isLikelyEnglish = !/[^\x00-\x7F]/.test(userText) && /[A-Za-z]/.test(userText);
    
    if (isLikelyEnglish && userText) {
      this.bumpTranscript("user", userText);
    }
  }

  private bumpTranscript(role: "agent" | "user", content: string) {
    // Append a new entry per completed turn to preserve full conversation history
    this.transcript = [...this.transcript, { role, content }];
    this.emit("update", { transcript: this.transcript });
  }

  removeAllListeners() {
    super.removeAllListeners();
    
return this;
  }

  getTranscript(): TranscriptItem[] {
    return [...this.transcript];
  }

  muteMic(): void {
    this.isMicMuted = true;
  }

  unmuteMic(): void {
    this.isMicMuted = false;
  }
}
