import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import WalletConnect from "@/components/WalletConnect";
import AgentChat from "@/components/AgentChat";
import Dashboard from "@/components/Dashboard";
import SmartContractPanel from "@/components/SmartContractPanel";
import NeuralBackground from "@/components/NeuralBackground";

const Index = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showContracts, setShowContracts] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <NeuralBackground />
      
      <div className="relative z-10">
        {!walletAddress ? (
          <HeroSection onConnect={() => setShowChat(false)} />
        ) : showChat ? (
          <AgentChat walletAddress={walletAddress} onBack={() => setShowChat(false)} />
        ) : showContracts ? (
          <SmartContractPanel walletAddress={walletAddress} onBack={() => setShowContracts(false)} />
        ) : (
          <Dashboard 
            walletAddress={walletAddress} 
            onChatClick={() => setShowChat(true)}
            onContractsClick={() => setShowContracts(true)}
            onDisconnect={() => {
              setWalletAddress(null);
              setShowChat(false);
              setShowContracts(false);
            }}
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
