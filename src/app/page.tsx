import { Navbar } from "@/components/Navbar";
import { ChatWindow } from "@/components/chat/ChatWindow";

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", overflow: "hidden" }}>
      <Navbar />
      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ height: "100%", maxWidth: "760px", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column" }}>
          <ChatWindow />
        </div>
      </main>
    </div>
  );
}