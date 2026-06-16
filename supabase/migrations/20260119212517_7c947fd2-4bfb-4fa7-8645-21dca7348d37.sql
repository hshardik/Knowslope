-- Drop the policy that allows users to view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- The "Admins can view all profiles" policy already exists and will remain
-- This ensures only admins can SELECT from the profiles table