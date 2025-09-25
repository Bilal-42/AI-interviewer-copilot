"use client";

import React from "react";

function ChatbotWindow() {
  return (
    <main className="flex-1 w-full h-full p-0 m-0 overflow-hidden bg-white rounded-md">
      <iframe
        src="https://copilotstudio.microsoft.com/environments/Default-a348b8b8-a465-4163-859b-9644d697c2b6/bots/cr0a0_agent/webchat?__version__=2"
        allow="microphone; camera"
        title="Copilot Studio Bot"
        className="w-full h-full border-0"
      />
    </main>
  );
}

export default ChatbotWindow;
