import { Brain, Zap, Shield, Network } from "lucide-react";

interface HeroSectionProps {
  onConnect: () => void;
}

const HeroSection = ({ onConnect }: HeroSectionProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <div className="max-w-6xl mx-auto text-center space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-accent neural-glow">
            <Brain className="w-12 h-12 text-primary-foreground" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-neural-blue bg-clip-text text-transparent">
            NeuraLink
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
          AI-Powered Blockchain Agents
        </p>
        
        <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto">
          Connect your wallet to interact with intelligent AI agents that execute smart contract transactions, 
          manage your portfolio, and provide real-time blockchain insights.
        </p>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <FeatureCard 
            icon={<Brain className="w-8 h-8" />}
            title="AI Agents"
            description="Intelligent agents powered by advanced AI models"
          />
          <FeatureCard 
            icon={<Network className="w-8 h-8" />}
            title="Blockchain Integration"
            description="Seamless smart contract interactions"
          />
          <FeatureCard 
            icon={<Shield className="w-8 h-8" />}
            title="Secure & Decentralized"
            description="Your keys, your control"
          />
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 mt-12">
          <p className="text-muted-foreground flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            Connect your wallet to get started
          </p>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="glassmorphic p-6 rounded-2xl hover:shadow-neural transition-all duration-300 group">
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default HeroSection;
