import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, Activity, Zap, LogOut, TrendingUp, Shield } from "lucide-react";

interface DashboardProps {
  walletAddress: string;
  onChatClick: () => void;
  onContractsClick: () => void;
  onDisconnect: () => void;
}

const Dashboard = ({ walletAddress, onChatClick, onContractsClick, onDisconnect }: DashboardProps) => {
  return (
    <div className="min-h-screen px-4 py-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Agent Dashboard
            </h1>
            <p className="text-muted-foreground">Manage your AI agents and blockchain interactions</p>
          </div>
          <Button
            onClick={onDisconnect}
            variant="outline"
            className="border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <StatCard
            icon={<Activity className="w-6 h-6" />}
            label="Active Agents"
            value="3"
            trend="+2"
            gradient="from-primary to-primary-glow"
          />
          <StatCard
            icon={<Zap className="w-6 h-6" />}
            label="Transactions"
            value="47"
            trend="+12"
            gradient="from-accent to-accent-glow"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Success Rate"
            value="98%"
            trend="+3%"
            gradient="from-neural-blue to-primary"
          />
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <ActionCard
            title="AI Agent Chat"
            description="Interact with intelligent agents to execute transactions and get insights"
            icon={<MessageSquare className="w-12 h-12" />}
            onClick={onChatClick}
            buttonText="Open Chat"
            gradient="from-primary/20 to-accent/20"
          />
          <ActionCard
            title="Smart Contracts"
            description="View and manage your deployed smart contracts and interactions"
            icon={<Shield className="w-12 h-12" />}
            onClick={onContractsClick}
            buttonText="View Contracts"
            gradient="from-accent/20 to-neural-blue/20"
          />
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
          <div className="space-y-3">
            <ActivityItem
              action="Agent initialized transaction"
              time="2 minutes ago"
              status="success"
            />
            <ActivityItem
              action="Smart contract deployed"
              time="1 hour ago"
              status="success"
            />
            <ActivityItem
              action="Agent query completed"
              time="3 hours ago"
              status="success"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend, gradient }: any) => {
  return (
    <Card className={`glassmorphic p-6 border-border/20`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-sm text-accent mt-1">{trend}</p>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

const ActionCard = ({ title, description, icon, onClick, buttonText, gradient }: any) => {
  return (
    <Card className="glassmorphic p-8 border-border/20 hover:shadow-neural transition-all duration-300">
      <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} w-fit mb-4`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      <Button 
        onClick={onClick}
        className="w-full bg-primary hover:bg-primary/90 neural-glow"
      >
        {buttonText}
      </Button>
    </Card>
  );
};

const ActivityItem = ({ action, time, status }: any) => {
  return (
    <div className="glassmorphic p-4 rounded-xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${status === 'success' ? 'bg-accent' : 'bg-muted'}`} />
        <div>
          <p className="font-medium">{action}</p>
          <p className="text-sm text-muted-foreground">{time}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
