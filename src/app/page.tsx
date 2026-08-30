import { ChatWrapper } from "@/components/chat-wrapper";
import { getBranding } from "@/lib/branding";

export default function Home() {
  const branding = getBranding();
  return <ChatWrapper branding={branding} />;
}
