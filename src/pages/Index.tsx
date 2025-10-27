import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import WalletConnect from "@/components/WalletConnect";
import AgentChat from "@/components/AgentChat";
import Dashboard from "@/components/Dashboard";
import SmartContractPanel from "@/components/SmartContractPanel";
import MultiAgentPanel from "@/components/MultiAgentPanel";
import NFTMarketplace from "@/components/NFTMarketplace";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import NeuralBackground from "@/components/NeuralBackground";

const Index = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showContracts, setShowContracts] = useState(false);
  const [showMultiAgent, setShowMultiAgent] = useState(false);
  const [showNFTMarket, setShowNFTMarket] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

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
        ) : showMultiAgent ? (
          <MultiAgentPanel walletAddress={walletAddress} onBack={() => setShowMultiAgent(false)} />
        ) : showNFTMarket ? (
          <NFTMarketplace walletAddress={walletAddress} onBack={() => setShowNFTMarket(false)} />
        ) : showAnalytics ? (
          <AnalyticsDashboard walletAddress={walletAddress} onBack={() => setShowAnalytics(false)} />
        ) : (
          <Dashboard 
            walletAddress={walletAddress} 
            onChatClick={() => setShowChat(true)}
            onContractsClick={() => setShowContracts(true)}
            onMultiAgentClick={() => setShowMultiAgent(true)}
            onNFTMarketClick={() => setShowNFTMarket(true)}
            onAnalyticsClick={() => setShowAnalytics(true)}
            onDisconnect={() => {
              setWalletAddress(null);
              setShowChat(false);
              setShowContracts(false);
              setShowMultiAgent(false);
              setShowNFTMarket(false);
              setShowAnalytics(false);
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
