import { z } from "zod";

// Agent validation schemas
export const agentSchema = z.object({
  name: z.string().trim().min(1, "Agent name is required").max(100, "Name must be less than 100 characters"),
  model: z.string().trim().min(1, "Model is required").max(100, "Model must be less than 100 characters"),
  description: z.string().trim().max(1000, "Description must be less than 1000 characters").optional(),
  capabilities: z.array(z.string().trim().max(50, "Capability must be less than 50 characters")).optional(),
});

// Task validation schemas
export const taskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().trim().min(1, "Task description is required").max(1000, "Description must be less than 1000 characters"),
  priority: z.enum(["low", "medium", "high"]).optional(),
  agentId: z.string().uuid("Invalid agent ID"),
});

// Collaboration validation schemas
export const collaborationSchema = z.object({
  name: z.string().trim().min(1, "Collaboration name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().trim().max(1000, "Description must be less than 1000 characters").optional(),
  workflowType: z.enum(["sequential", "parallel", "hierarchical"]),
  agentIds: z.array(z.string().uuid("Invalid agent ID")).min(2, "At least 2 agents required").max(10, "Maximum 10 agents allowed"),
});

// Marketplace listing validation schemas
export const listingSchema = z.object({
  agentId: z.string().uuid("Invalid agent ID"),
  price: z.number().positive("Price must be greater than 0").max(1000000, "Price must be less than 1,000,000 ETH"),
  currency: z.enum(["ETH"]).optional(),
});

// Chat message validation schema
export const chatMessageSchema = z.object({
  content: z.string().trim().min(1, "Message cannot be empty").max(5000, "Message must be less than 5000 characters"),
});

// Smart contract interaction validation
export const contractAgentSchema = z.object({
  name: z.string().trim().min(1, "Agent name is required").max(100, "Name must be less than 100 characters"),
  model: z.string().trim().min(1, "Model is required").max(100, "Model must be less than 100 characters"),
});

export const contractTaskSchema = z.object({
  agentId: z.number().int().positive("Invalid agent ID"),
  description: z.string().trim().min(1, "Task description is required").max(1000, "Description must be less than 1000 characters"),
  rewardInEth: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0 && num <= 100;
    },
    { message: "Reward must be between 0 and 100 ETH" }
  ),
});

export const contractPurchaseSchema = z.object({
  agentId: z.number().int().positive("Invalid agent ID"),
  priceInEth: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0 && num <= 10000;
    },
    { message: "Price must be between 0 and 10,000 ETH" }
  ),
});
