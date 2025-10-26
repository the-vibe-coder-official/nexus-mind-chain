import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import WalletConnect from "@/components/WalletConnect";
import AgentChat from "@/components/AgentChat";
import Dashboard from "@/components/Dashboard";
import NeuralBackground from "@/components/NeuralBackground";

const Index = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <NeuralBackground />
      
      <div className="relative z-10">
        {!walletAddress ? (
          <HeroSection onConnect={() => setShowChat(false)} />
        ) : showChat ? (
          <AgentChat walletAddress={walletAddress} onBack={() => setShowChat(false)} />
        ) : (
          <Dashboard 
            walletAddress={walletAddress} 
            onChatClick={() => setShowChat(true)}
            onDisconnect={() => setWalletAddress(null)}
          />
        )}
        
        <WalletConnect 
          onConnect={setWalletAddress} 
          walletAddress={walletAddress}
        />
      </div>
    </div>
  );
};

export default Index;
