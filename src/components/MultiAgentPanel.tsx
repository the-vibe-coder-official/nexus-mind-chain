import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users, Play, Loader2 } from "lucide-react";

interface MultiAgentPanelProps {
  walletAddress: string;
  onBack: () => void;
}

const MultiAgentPanel = ({ walletAddress, onBack }: MultiAgentPanelProps) => {
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [task, setTask] = useState("");
  const [workflowType, setWorkflowType] = useState("sequential");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [collaborationName, setCollaborationName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load agents",
        variant: "destructive",
      });
    } else {
      setAgents(data || []);
    }
  };

  const handleAgentToggle = (agentId: string) => {
    setSelectedAgentIds(prev => 
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleRunCollaboration = async () => {
    if (selectedAgentIds.length < 2) {
      toast({
        title: "Select Multiple Agents",
        description: "Please select at least 2 agents for collaboration",
        variant: "destructive",
      });
      return;
    }

    if (!task.trim()) {
      toast({
        title: "Task Required",
        description: "Please enter a task description",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      // Create collaboration record
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: collaboration, error: collabError } = await supabase
        .from('agent_collaborations')
        .insert({
          name: collaborationName || `Collaboration ${new Date().toLocaleString()}`,
          description: task,
          user_id: user.id,
          agent_ids: selectedAgentIds,
          workflow_type: workflowType,
        })
        .select()
        .single();

      if (collabError) throw collabError;

      // Run multi-agent orchestration
      const { data, error } = await supabase.functions.invoke('multi-agent-orchestration', {
        body: {
          agentIds: selectedAgentIds,
          task,
          workflowType,
        },
      });

      if (error) throw error;

      setResults(data);

      // Track analytics
      await supabase.functions.invoke('analytics-tracker', {
        body: {
          eventType: 'multi_agent_collaboration',
          eventData: {
            agentCount: selectedAgentIds.length,
            workflowType,
            collaborationId: collaboration.id,
          },
        },
      });

      toast({
        title: "Success!",
        description: `${data.agentCount} agents completed the collaboration`,
      });
    } catch (error: any) {
      console.error('Collaboration error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to run collaboration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="grid gap-6">
        <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Multi-Agent Collaboration System
            </CardTitle>
            <CardDescription>
              Coordinate multiple AI agents to work together on complex tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Collaboration Name (Optional)</Label>
              <Input
                value={collaborationName}
                onChange={(e) => setCollaborationName(e.target.value)}
                placeholder="e.g., Market Analysis Team"
              />
            </div>

            <div className="space-y-2">
              <Label>Select Agents ({selectedAgentIds.length} selected)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                {agents.length === 0 ? (
                  <p className="text-muted-foreground col-span-2">No agents available. Create agents first.</p>
                ) : (
                  agents.map((agent) => (
                    <div key={agent.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent transition-colors">
                      <Checkbox
                        checked={selectedAgentIds.includes(agent.id)}
                        onCheckedChange={() => handleAgentToggle(agent.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-muted-foreground">{agent.model}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Workflow Type</Label>
              <Select value={workflowType} onValueChange={setWorkflowType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sequential">
                    Sequential (Agents work one after another)
                  </SelectItem>
                  <SelectItem value="parallel">
                    Parallel (All agents work simultaneously)
                  </SelectItem>
                  <SelectItem value="hierarchical">
                    Hierarchical (Coordinator + Workers)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Task Description</Label>
              <Textarea
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Describe the task for your AI agents to collaborate on..."
                rows={4}
              />
            </div>

            <Button
              onClick={handleRunCollaboration}
              disabled={loading || selectedAgentIds.length < 2}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Collaboration...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Multi-Agent Collaboration
                </>
              )}
            </Button>

            {results && (
              <Card className="bg-accent/50">
                <CardHeader>
                  <CardTitle>Collaboration Results</CardTitle>
                  <CardDescription>
                    {results.agentCount} agents · {results.workflowType} workflow
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {results.results.map((result: string, index: number) => (
                    <div key={index} className="p-4 border rounded-lg bg-background">
                      <p className="font-medium mb-2">Agent {index + 1}</p>
                      <p className="text-sm">{result}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MultiAgentPanel;