-- Drop the previous view
DROP VIEW IF EXISTS public.marketplace_agents;

-- Create a view WITHOUT security definer (uses SECURITY INVOKER by default which is safer)
-- This view shows only publicly listed agents for the marketplace
CREATE VIEW public.marketplace_agents 
WITH (security_invoker = true)
AS
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

-- Grant SELECT permission on the view
GRANT SELECT ON public.marketplace_agents TO authenticated;
GRANT SELECT ON public.marketplace_agents TO anon;