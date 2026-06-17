import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "NexChat AI — Free Multi-Model Chatbot",
  description:
    "Chat with AI models from OpenRouter, Groq, Google AI & more. Use free models like Owl Alpha, Nex-N2 Pro, DeepSeek R1, and Llama 4. Bring your own API key.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-dark-900 text-white antialiased">{children}</body>
    </html>
  );
}
