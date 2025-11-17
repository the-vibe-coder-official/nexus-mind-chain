import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import WalletConnect from "@/components/WalletConnect";
import HeroSection from "@/components/HeroSection";
import AgentChat from "@/components/AgentChat";
import SmartContractPanel from "@/components/SmartContractPanel";
import MultiAgentPanel from "@/components/MultiAgentPanel";
import NFTMarketplace from "@/components/NFTMarketplace";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import Dashboard from "@/components/Dashboard";
import NeuralBackground from "@/components/NeuralBackground";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showContracts, setShowContracts] = useState(false);
  const [showMultiAgent, setShowMultiAgent] = useState(false);
  const [showNFTMarket, setShowNFTMarket] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      toast.success("Signed out successfully");
      navigate("/auth");
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <NeuralBackground />
      
      <div className="fixed top-6 left-6 z-50">
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="glassmorphic"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
      
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
