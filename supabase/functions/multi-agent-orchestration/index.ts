import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Please sign in' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { agentIds, task, workflowType } = await req.json();

    console.log(`Multi-agent orchestration started by user ${user.id}: ${agentIds.length} agents, workflow: ${workflowType}`);

    // Get all agents
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('*')
      .in('id', agentIds);

    if (agentsError) throw agentsError;

    let results = [];

    if (workflowType === 'sequential') {
      // Sequential workflow - each agent builds on previous results
      let context = task;
      for (const agent of agents) {
        const result = await processWithAgent(agent, context);
        results.push(result);
        context = `${context}\n\nPrevious agent (${agent.name}) response: ${result}`;
      }
    } else if (workflowType === 'parallel') {
      // Parallel workflow - all agents work on the same task
      const promises = agents.map(agent => processWithAgent(agent, task));
      results = await Promise.all(promises);
    } else if (workflowType === 'hierarchical') {
      // Hierarchical workflow - first agent coordinates, others execute
      const coordinator = agents[0];
      const workers = agents.slice(1);
      
      const coordinatorResult = await processWithAgent(
        coordinator,
        `You are a coordinator. Analyze this task and delegate subtasks: ${task}`
      );
      
      results.push(coordinatorResult);
      
      const workerPromises = workers.map(agent =>
        processWithAgent(agent, `Execute this subtask: ${coordinatorResult}`)
      );
      const workerResults = await Promise.all(workerPromises);
      results.push(...workerResults);
    }

    console.log(`Multi-agent orchestration completed with ${results.length} results`);

    return new Response(
      JSON.stringify({
        success: true,
        results,
        agentCount: agents.length,
        workflowType
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Multi-agent orchestration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processWithAgent(agent: any, task: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: agent.model || 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: `You are ${agent.name}. ${agent.description || ''}`
          },
          { role: 'user', content: task }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error(`Error processing with agent ${agent.name}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return `Error: ${errorMessage}`;
  }
}
