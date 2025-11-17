-- Fix analytics_events table to require user_id
ALTER TABLE public.analytics_events 
ALTER COLUMN user_id SET NOT NULL;

-- Add comment explaining the security requirement
COMMENT ON COLUMN public.analytics_events.user_id IS 'Required for security - all analytics events must be tied to an authenticated user';

-- Add DELETE policy for agent_tasks table
CREATE POLICY "Users can delete their own tasks"
ON public.agent_tasks
FOR DELETE
USING (auth.uid() = user_id);