import { ethers } from "ethers";

// Replace with your deployed contract address after deployment
export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

// Contract ABI - only including the functions we need
export const CONTRACT_ABI = [
  "function registerAgent(string memory _name, string memory _model) external returns (uint256)",
  "function createTask(uint256 _agentId, string memory _description) external payable returns (uint256)",
  "function completeTask(uint256 _taskId) external",
  "function getAgent(uint256 _agentId) external view returns (tuple(address owner, string name, string model, uint256 taskCount, bool isActive, uint256 createdAt))",
  "function getTask(uint256 _taskId) external view returns (tuple(uint256 agentId, address requester, string description, uint256 reward, bool completed, uint256 timestamp))",
  "function toggleAgentStatus(uint256 _agentId) external",
  "function agentCounter() external view returns (uint256)",
  "function taskCounter() external view returns (uint256)",
  "event AgentRegistered(uint256 indexed agentId, address indexed owner, string name)",
  "event TaskCreated(uint256 indexed taskId, uint256 indexed agentId, address requester)",
  "event TaskCompleted(uint256 indexed taskId, uint256 indexed agentId)"
];

export async function getContract(signer?: ethers.Signer) {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  
  if (signer) {
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }
  
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

export async function registerAgent(name: string, model: string) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = await getContract(signer);
  
  const tx = await contract.registerAgent(name, model);
  const receipt = await tx.wait();
  
  // Parse the event to get the agent ID
  const event = receipt.logs.find((log: any) => {
    try {
      const parsed = contract.interface.parseLog(log);
      return parsed?.name === "AgentRegistered";
    } catch {
      return false;
    }
  });
  
  if (event) {
    const parsed = contract.interface.parseLog(event);
    return parsed?.args.agentId;
  }
  
  throw new Error("Failed to get agent ID from transaction");
}

export async function createTask(agentId: number, description: string, rewardInEth: string) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = await getContract(signer);
  
  const tx = await contract.createTask(agentId, description, {
    value: ethers.parseEther(rewardInEth)
  });
  const receipt = await tx.wait();
  
  const event = receipt.logs.find((log: any) => {
    try {
      const parsed = contract.interface.parseLog(log);
      return parsed?.name === "TaskCreated";
    } catch {
      return false;
    }
  });
  
  if (event) {
    const parsed = contract.interface.parseLog(event);
    return parsed?.args.taskId;
  }
  
  throw new Error("Failed to get task ID from transaction");
}

export async function getAgentInfo(agentId: number) {
  const contract = await getContract();
  const agent = await contract.getAgent(agentId);
  
  return {
    owner: agent.owner,
    name: agent.name,
    model: agent.model,
    taskCount: Number(agent.taskCount),
    isActive: agent.isActive,
    createdAt: new Date(Number(agent.createdAt) * 1000)
  };
}

export async function getTaskInfo(taskId: number) {
  const contract = await getContract();
  const task = await contract.getTask(taskId);
  
  return {
    agentId: Number(task.agentId),
    requester: task.requester,
    description: task.description,
    reward: ethers.formatEther(task.reward),
    completed: task.completed,
    timestamp: new Date(Number(task.timestamp) * 1000)
  };
}
