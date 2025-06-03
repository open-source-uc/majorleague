-- Fix registration issue by ensuring profile creation works

-- Update the profile creation trigger to use SECURITY DEFINER and bypass RLS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Set search path and bypass RLS for profile creation
  PERFORM set_config('search_path', 'public', false);
  PERFORM set_config('row_security', 'off', true);
  
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name',
    0  -- Default role is 0 (regular user)
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger function can bypass RLS for profile creation
GRANT INSERT ON public.profiles TO service_role;

-- Add a policy to allow the service role to insert profiles (for registration)
CREATE POLICY "Allow service role to insert profiles" ON public.profiles
  FOR INSERT TO service_role
  WITH CHECK (true); 