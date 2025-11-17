-- Fix agents table RLS policy to restrict SELECT to owner only
DROP POLICY IF EXISTS "Users can view all agents" ON public.agents;

CREATE POLICY "Users can view their own agents"
  ON public.agents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create a public view for marketplace listings showing only listed agents
CREATE OR REPLACE VIEW public.marketplace_agents AS
SELECT 
  a.id,
  a.name,
  a.model,
  a.description,
  a.performance_score,
  a.total_tasks,
  a.successful_tasks,
  a.is_nft,
  a.nft_token_id,
  a.created_at
FROM public.agents a
INNER JOIN public.marketplace_listings ml ON a.id = ml.agent_id
WHERE a.is_nft = true 
  AND ml.is_active = true;

-- Grant SELECT permission on the view to authenticated users
GRANT SELECT ON public.marketplace_agents TO authenticated;
GRANT SELECT ON public.marketplace_agents TO anon;