import { AIChat } from "@/components/workspace/AIChat";

export default function ChatPage() {
  return (
    // Cancel the p-8 from the workspace <main> wrapper so chat fills edge-to-edge
    <div className="-m-8 flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
      <AIChat />
    </div>
  );
}
