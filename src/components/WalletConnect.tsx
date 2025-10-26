import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface WalletConnectProps {
  onConnect: (address: string) => void;
  walletAddress: string | null;
}

const WalletConnect = ({ onConnect, walletAddress }: WalletConnectProps) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask to continue");
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts && accounts.length > 0) {
        onConnect(accounts[0]);
        toast.success("Wallet connected successfully!");
      }
    } catch (error: any) {
      console.error("Wallet connection error:", error);
      toast.error(error.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (walletAddress) {
    return (
      <div className="fixed top-6 right-6 z-50">
        <div className="glassmorphic px-4 py-2 rounded-full flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">{formatAddress(walletAddress)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-6 right-6 z-50">
      <Button
        onClick={connectWallet}
        disabled={isConnecting}
        className="neural-glow bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold px-6 py-6 rounded-full"
      >
        <Wallet className="w-5 h-5 mr-2" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    </div>
  );
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}

export default WalletConnect;
