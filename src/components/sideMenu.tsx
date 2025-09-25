"use client";

import React from "react";
import { PlayCircleIcon, SpeechIcon, FileText, MessageCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

function SideMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const [showBot, setShowBot] = React.useState(false);

  return (
    <>
      <div className="z-[10] bg-slate-100 p-6 w-[200px] fixed top-[64px] left-0 h-full">
        <div className="flex flex-col gap-1">
          <div className="flex flex-col justify-between gap-2">
            <div
              className={`flex flex-row p-3 rounded-md hover:bg-slate-200 cursor-pointer ${pathname && pathname.startsWith("/chat") ? "bg-indigo-200" : "bg-slate-100"}`}
              onClick={() => router.push("/dashboard/chat")}
            >
              <MessageCircle className="font-thin mr-2" />
              <p className="font-medium">Chat</p>
            </div>
          <div
            className={`flex flex-row p-3 rounded-md hover:bg-slate-200 cursor-pointer ${
              pathname && (pathname.endsWith("/dashboard") || pathname.includes("/interviews"))
                ? "bg-indigo-200"
                : "bg-slate-100"
            }`}
            onClick={() => router.push("/dashboard")}
          >
            <PlayCircleIcon className="font-thin\t mr-2" />
            <p className="font-medium ">Interviews</p>
          </div>
          <div
            className={`flex flex-row p-3 rounded-md hover:bg-slate-200 cursor-pointer ${
              pathname && pathname.endsWith("/interviewers")
                ? "bg-indigo-200"
                : "bg-slate-100"
            }`}
            onClick={() => router.push("/dashboard/interviewers")}
          >
            <SpeechIcon className="font-thin mr-2" />
            <p className="font-medium ">Interviewers</p>
          </div>
          <div
            className={`flex flex-row p-3 rounded-md hover:bg-slate-200 cursor-pointer ${
              pathname && pathname.startsWith("/documents") ? "bg-indigo-200" : "bg-slate-100"
            }`}
            onClick={() => router.push("/dashboard/documents")}
          >
            <FileText className="font-thin mr-2" />
            <p className="font-medium ">Documents</p>
          </div>
        </div>
      </div>
      </div>
      {showBot && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.15)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              width: 600,
              maxWidth: "95vw",
              height: 700,
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              position: "relative"
            }}
          >
            <div style={{ display: "flex", justifyContent: "flex-end", padding: 8 }}>
              <button
                aria-label="Close chat"
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 24,
                  cursor: "pointer",
                  color: "#6366f1"
                }}
                onClick={() => setShowBot(false)}
              >
                ×
              </button>
            </div>
            <iframe
              src={`https://copilotstudio.microsoft.com/environments/Default-a348b8b8-a465-4163-859b-9644d697c2b6/bots/cr0a0_agent/webchat?__version__=2&context=${encodeURIComponent(pathname || "")}`}
              allow="microphone; camera"
              title="Copilot Studio Bot"
              style={{ border: 'none', width: '100%', height: '100%', flex: 1, background: '#f5f5f5' }}
            />
          </div>
        </div>
      )}
    </>
  );
}


export default SideMenu;
