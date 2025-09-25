
"use client";
import React, { useState } from "react";
import { MessageCircle } from "lucide-react";

export default function CopilotChatWidget() {
	const [open, setOpen] = useState(false);

	return (
		<>
			{/* Floating Chat Icon */}
			<button
				aria-label="Open Copilot Chat"
				style={{
					position: "fixed",
					bottom: 32,
					right: 32,
					zIndex: 1000,
					background: "#6366f1",
					borderRadius: "50%",
					width: 64,
					height: 64,
					boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
					display: open ? "none" : "flex",
					alignItems: "center",
					justifyContent: "center",
					border: "none",
					cursor: "pointer"
				}}
				onClick={() => setOpen(true)}
			>
				<MessageCircle color="white" size={32} />
			</button>

			{/* Chat Popup */}
			{open && (
				<div
					style={{
						position: "fixed",
						bottom: 32,
						right: 32,
						zIndex: 1001,
						width: 400,
						maxWidth: "90vw",
						height: 600,
						background: "#fff",
						borderRadius: 16,
						boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
						display: "flex",
						flexDirection: "column",
						overflow: "hidden"
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
							onClick={() => setOpen(false)}
						>
							×
						</button>
					</div>
					<iframe
						src="https://copilotstudio.microsoft.com/environments/Default-a348b8b8-a465-4163-859b-9644d697c2b6/bots/cr0a0_agent/webchat?__version__=2"
						allow="microphone; camera"
						title="Copilot Studio Bot"
						style={{ border: 'none', width: '100%', height: '100%', flex: 1, background: '#f5f5f5' }}
					/>
				</div>
			)}
		</>
	);
}
