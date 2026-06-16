-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'publisher', 'member');

-- Create enum for document visibility
CREATE TYPE public.doc_visibility AS ENUM ('private', 'team');

-- Create enum for document status
CREATE TYPE public.doc_status AS ENUM ('draft', 'published');

-- Create enum for document type
CREATE TYPE public.doc_type AS ENUM ('bug', 'feature', 'how_to', 'troubleshooting', 'faq', 'policy');

-- Create enum for document category
CREATE TYPE public.doc_category AS ENUM ('product', 'engineering', 'support', 'sales', 'marketing', 'operations');

-- Create enum for whitelist entry type
CREATE TYPE public.whitelist_entry_type AS ENUM ('email', 'domain');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  content JSONB,
  category doc_category NOT NULL,
  type doc_type NOT NULL,
  status doc_status NOT NULL DEFAULT 'draft',
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visibility doc_visibility NOT NULL DEFAULT 'private',
  tags TEXT[],
  screenshots TEXT[],
  slack_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create publishing_whitelist table
CREATE TABLE public.publishing_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry TEXT NOT NULL UNIQUE,
  entry_type whitelist_entry_type NOT NULL,
  added_by UUID NOT NULL REFERENCES auth.users(id),
  added_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on publishing_whitelist
ALTER TABLE public.publishing_whitelist ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- Create security definer function to check if user is whitelisted
CREATE OR REPLACE FUNCTION public.is_whitelisted(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  user_domain TEXT;
BEGIN
  -- Get user email
  SELECT email INTO user_email FROM public.profiles WHERE id = _user_id;
  
  IF user_email IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Extract domain from email
  user_domain := '@' || split_part(user_email, '@', 2);
  
  -- Check if email or domain is whitelisted
  RETURN EXISTS (
    SELECT 1
    FROM public.publishing_whitelist
    WHERE (entry_type = 'email' AND entry = user_email)
       OR (entry_type = 'domain' AND entry = user_domain)
  );
END;
$$;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for documents updated_at
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Assign default 'member' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view all roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for documents
CREATE POLICY "Users can view published documents"
  ON public.documents
  FOR SELECT
  TO authenticated
  USING (status = 'published');

CREATE POLICY "Users can view their own drafts"
  ON public.documents
  FOR SELECT
  TO authenticated
  USING (status = 'draft' AND creator_id = auth.uid());

CREATE POLICY "Users can view team drafts"
  ON public.documents
  FOR SELECT
  TO authenticated
  USING (status = 'draft' AND visibility = 'team');

CREATE POLICY "Users can create documents"
  ON public.documents
  FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creators can update their own drafts"
  ON public.documents
  FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid() AND status = 'draft');

CREATE POLICY "Team members can update team drafts"
  ON public.documents
  FOR UPDATE
  TO authenticated
  USING (status = 'draft' AND visibility = 'team');

CREATE POLICY "Creators can delete their own documents"
  ON public.documents
  FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid());

CREATE POLICY "Admins can delete any document"
  ON public.documents
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for publishing_whitelist
CREATE POLICY "Users can view whitelist"
  ON public.publishing_whitelist
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert whitelist entries"
  ON public.publishing_whitelist
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete whitelist entries"
  ON public.publishing_whitelist
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));