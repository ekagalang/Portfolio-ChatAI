import { ChatMessage } from "@/types/chat";

// Convert chat messages ke format markdown yang readable
export function chatToMarkdown(messages: ChatMessage[], ownerName: string): string {
  const header = `# Chat dengan AI Asisten ${ownerName}\n_${new Date().toLocaleDateString("id-ID", { dateStyle: "full" })}_\n\n---\n\n`;

  const body = messages
    .map((msg) => {
      const time = msg.timestamp.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });

      if (msg.role === "user") {
        return `**👤 Kamu** _(${time})_\n\n${msg.content}`;
      } else {
        return `**🤖 AI Asisten** _(${time})_\n\n${msg.content}`;
      }
    })
    .join("\n\n---\n\n");

  return header + body;
}

// Copy teks ke clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback untuk browser lama
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}