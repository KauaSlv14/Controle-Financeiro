-- Allow users to search for other users by email (for friend search)
CREATE POLICY "Users can search profiles by email" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Drop the old restrictive select policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view accepted friends profiles" ON public.profiles;