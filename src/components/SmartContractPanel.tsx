import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { registerAgent, createTask, getAgentInfo, CONTRACT_ADDRESS } from "@/utils/contracts";
import ContractDeployment from "./ContractDeployment";
import CreateAgentForm from "./CreateAgentForm";

interface SmartContractPanelProps {
  walletAddress: string;
  onBack: () => void;
}

const SmartContractPanel = ({ walletAddress, onBack }: SmartContractPanelProps) => {
  const [agentName, setAgentName] = useState("");
  const [agentModel, setAgentModel] = useState("GPT-4");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskReward, setTaskReward] = useState("");
  const [agentId, setAgentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contractAddress, setContractAddress] = useState(CONTRACT_ADDRESS);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleContractDeployed = (address: string) => {
    setContractAddress(address);
    localStorage.setItem("deployed_contract_address", address);
    toast.success("Contract-Adresse gespeichert!");
  };

  const handleAgentCreated = () => {
    setRefreshKey(prev => prev + 1);
    toast.success("Agent erfolgreich erstellt! Du kannst ihn jetzt verwenden.");
  };

  useEffect(() => {
    const savedAddress = localStorage.getItem("deployed_contract_address");
    if (savedAddress && savedAddress !== "0x0000000000000000000000000000000000000000") {
      setContractAddress(savedAddress);
    }
  }, []);

  const handleRegisterAgent = async () => {
    if (!agentName || !agentModel) {
      toast.error("Please fill in all fields");
      return;
    }

    if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      toast.error("Please deploy the smart contract first. See contracts/deploy-instructions.md");
      return;
    }

    setIsLoading(true);
    try {
      const id = await registerAgent(agentName, agentModel);
      setAgentId(id.toString());
      toast.success(`Agent registered successfully! ID: ${id}`);
      setAgentName("");
      setAgentModel("GPT-4");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to register agent");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!agentId || !taskDescription || !taskReward) {
      toast.error("Please fill in all fields");
      return;
    }

    if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      toast.error("Please deploy the smart contract first. See contracts/deploy-instructions.md");
      return;
    }

    setIsLoading(true);
    try {
      const taskId = await createTask(Number(agentId), taskDescription, taskReward);
      toast.success(`Task created successfully! ID: ${taskId}`);
      setTaskDescription("");
      setTaskReward("");
    } catch (error: any) {
      console.error("Task creation error:", error);
      toast.error(error.message || "Failed to create task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAgentInfo = async () => {
    if (!agentId) {
      toast.error("Please enter an agent ID");
      return;
    }

    if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      toast.error("Please deploy the smart contract first. See contracts/deploy-instructions.md");
      return;
    }

    setIsLoading(true);
    try {
      const info = await getAgentInfo(Number(agentId));
      toast.success(
        `Agent: ${info.name}\nModel: ${info.model}\nTasks: ${info.taskCount}\nActive: ${info.isActive}`
      );
    } catch (error: any) {
      console.error("Get agent info error:", error);
      toast.error(error.message || "Failed to get agent info");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={onBack}
            variant="outline"
            size="icon"
            className="neural-glow"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Smart Contracts
            </h1>
            <p className="text-sm text-muted-foreground">
              Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* Contract Deployment */}
          <ContractDeployment onContractDeployed={handleContractDeployed} />
          
          {/* Create Agent Form */}
          <CreateAgentForm 
            walletAddress={walletAddress} 
            onAgentCreated={handleAgentCreated}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Register Agent */}
          <Card className="glassmorphic border-border/20 p-6">
            <h2 className="text-xl font-semibold mb-4 text-primary">Register AI Agent</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="agentName">Agent Name</Label>
                <Input
                  id="agentName"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="My AI Agent"
                  className="bg-background/50 border-border/20"
                />
              </div>
              <div>
                <Label htmlFor="agentModel">Model</Label>
                <Input
                  id="agentModel"
                  value={agentModel}
                  onChange={(e) => setAgentModel(e.target.value)}
                  placeholder="GPT-4"
                  className="bg-background/50 border-border/20"
                />
              </div>
              <Button
                onClick={handleRegisterAgent}
                disabled={isLoading}
                className="w-full neural-glow bg-gradient-to-r from-primary to-accent"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register Agent"
                )}
              </Button>
            </div>
          </Card>

          {/* Create Task */}
          <Card className="glassmorphic border-border/20 p-6">
            <h2 className="text-xl font-semibold mb-4 text-primary">Create Task</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="agentIdTask">Agent ID</Label>
                <Input
                  id="agentIdTask"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  placeholder="1"
                  className="bg-background/50 border-border/20"
                />
              </div>
              <div>
                <Label htmlFor="taskDesc">Description</Label>
                <Input
                  id="taskDesc"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Analyze blockchain data"
                  className="bg-background/50 border-border/20"
                />
              </div>
              <div>
                <Label htmlFor="reward">Reward (ETH)</Label>
                <Input
                  id="reward"
                  value={taskReward}
                  onChange={(e) => setTaskReward(e.target.value)}
                  placeholder="0.01"
                  type="number"
                  step="0.001"
                  className="bg-background/50 border-border/20"
                />
              </div>
              <Button
                onClick={handleCreateTask}
                disabled={isLoading}
                className="w-full neural-glow bg-gradient-to-r from-primary to-accent"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Task"
                )}
              </Button>
            </div>
          </Card>

          {/* Get Agent Info */}
          <Card className="glassmorphic border-border/20 p-6">
            <h2 className="text-xl font-semibold mb-4 text-primary">Get Agent Info</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="agentIdInfo">Agent ID</Label>
                <Input
                  id="agentIdInfo"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  placeholder="1"
                  className="bg-background/50 border-border/20"
                />
              </div>
              <Button
                onClick={handleGetAgentInfo}
                disabled={isLoading}
                className="w-full neural-glow bg-gradient-to-r from-primary to-accent"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Get Info"
                )}
              </Button>
            </div>
          </Card>

          {/* Contract Info */}
          <Card className="glassmorphic border-border/20 p-6">
            <h2 className="text-xl font-semibold mb-4 text-primary">Contract Info</h2>
            <div className="space-y-2">
              <div>
                <Label>Contract Address</Label>
                <p className="text-sm text-muted-foreground break-all">
                  {contractAddress === "0x0000000000000000000000000000000000000000" 
                    ? "Noch nicht deployed"
                    : contractAddress
                  }
                </p>
              </div>
              {contractAddress === "0x0000000000000000000000000000000000000000" && (
                <p className="text-xs text-yellow-500 mt-4">
                  ⚠️ Bitte erst den Contract deployen (siehe linke Karte oben)
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SmartContractPanel;
