// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title NeuraLinkAgent
 * @dev Smart contract for AI agent interactions and blockchain transactions
 * @notice This contract manages AI agent registrations and task executions
 */
contract NeuraLinkAgent {
    
    struct Agent {
        address owner;
        string name;
        string model;
        uint256 taskCount;
        bool isActive;
        uint256 createdAt;
    }
    
    struct Task {
        uint256 agentId;
        address requester;
        string description;
        uint256 reward;
        bool completed;
        uint256 timestamp;
    }
    
    mapping(uint256 => Agent) public agents;
    mapping(uint256 => Task) public tasks;
    
    uint256 public agentCounter;
    uint256 public taskCounter;
    
    event AgentRegistered(uint256 indexed agentId, address indexed owner, string name);
    event TaskCreated(uint256 indexed taskId, uint256 indexed agentId, address requester);
    event TaskCompleted(uint256 indexed taskId, uint256 indexed agentId);
    
    /**
     * @dev Register a new AI agent
     * @param _name Name of the agent
     * @param _model AI model identifier
     */
    function registerAgent(string memory _name, string memory _model) external returns (uint256) {
        agentCounter++;
        
        agents[agentCounter] = Agent({
            owner: msg.sender,
            name: _name,
            model: _model,
            taskCount: 0,
            isActive: true,
            createdAt: block.timestamp
        });
        
        emit AgentRegistered(agentCounter, msg.sender, _name);
        return agentCounter;
    }
    
    /**
     * @dev Create a new task for an agent
     * @param _agentId ID of the agent to execute the task
     * @param _description Task description
     */
    function createTask(uint256 _agentId, string memory _description) external payable returns (uint256) {
        require(agents[_agentId].isActive, "Agent is not active");
        require(msg.value > 0, "Reward must be greater than 0");
        
        taskCounter++;
        
        tasks[taskCounter] = Task({
            agentId: _agentId,
            requester: msg.sender,
            description: _description,
            reward: msg.value,
            completed: false,
            timestamp: block.timestamp
        });
        
        agents[_agentId].taskCount++;
        
        emit TaskCreated(taskCounter, _agentId, msg.sender);
        return taskCounter;
    }
    
    /**
     * @dev Complete a task and transfer reward
     * @param _taskId ID of the task to complete
     */
    function completeTask(uint256 _taskId) external {
        Task storage task = tasks[_taskId];
        Agent storage agent = agents[task.agentId];
        
        require(msg.sender == agent.owner, "Only agent owner can complete tasks");
        require(!task.completed, "Task already completed");
        
        task.completed = true;
        
        payable(agent.owner).transfer(task.reward);
        
        emit TaskCompleted(_taskId, task.agentId);
    }
    
    /**
     * @dev Get agent details
     * @param _agentId ID of the agent
     */
    function getAgent(uint256 _agentId) external view returns (Agent memory) {
        return agents[_agentId];
    }
    
    /**
     * @dev Get task details
     * @param _taskId ID of the task
     */
    function getTask(uint256 _taskId) external view returns (Task memory) {
        return tasks[_taskId];
    }
    
    /**
     * @dev Toggle agent active status
     * @param _agentId ID of the agent
     */
    function toggleAgentStatus(uint256 _agentId) external {
        require(agents[_agentId].owner == msg.sender, "Only owner can toggle status");
        agents[_agentId].isActive = !agents[_agentId].isActive;
    }
}
