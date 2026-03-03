-- Mi Huellita Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'vet', 'admin', 'shelter')),
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'owner')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- VETERINARIES TABLE
-- ============================================
CREATE TABLE veterinaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    phone TEXT,
    email TEXT,
    license TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PETS TABLE
-- ============================================
CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    species TEXT CHECK (species IN ('perro', 'gato', 'otro')),
    breed TEXT,
    birth_date DATE,
    gender TEXT CHECK (gender IN ('macho', 'hembra')),
    color TEXT,
    weight FLOAT,
    photo_url TEXT,
    microchip TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MEDICAL RECORDS TABLE
-- ============================================
CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    vet_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    veterinary_name TEXT,
    type TEXT CHECK (type IN ('consulta', 'vacuna', 'cirugia', 'analisis', 'tratamiento', 'otro')),
    description TEXT,
    date DATE NOT NULL,
    next_visit DATE,
    attachments TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ACCESS TOKENS TABLE (PIN system)
-- ============================================
CREATE TABLE access_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    pin TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ACCESS LOGS TABLE
-- ============================================
CREATE TABLE access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    vet_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    token_id UUID REFERENCES access_tokens(id) ON DELETE SET NULL,
    accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SHELTERS TABLE
-- ============================================
CREATE TABLE shelters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    city TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    photo_url TEXT,
    bank_info TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PETS FOR ADOPTION TABLE
-- ============================================
CREATE TABLE pets_for_adoption (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shelter_id UUID REFERENCES shelters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    species TEXT CHECK (species IN ('perro', 'gato', 'otro')),
    age TEXT,
    gender TEXT CHECK (gender IN ('macho', 'hembra')),
    description TEXT,
    photo_url TEXT,
    status TEXT DEFAULT 'disponible' CHECK (status IN ('disponible', 'adoptado', 'en_tratamiento')),
    urgent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VOLUNTEERS TABLE
-- ============================================
CREATE TABLE volunteers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shelter_id UUID REFERENCES shelters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    skills TEXT,
    availability TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE veterinaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets_for_adoption ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can read all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- VETERINARIES POLICIES
CREATE POLICY "Anyone can read veterinaries" ON veterinaries FOR SELECT USING (true);
CREATE POLICY "Vets can insert their own clinic" ON veterinaries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Vets can update their clinic" ON veterinaries FOR UPDATE USING (auth.uid() = user_id);

-- PETS POLICIES
CREATE POLICY "Anyone can read pets" ON pets FOR SELECT USING (true);
CREATE POLICY "Owners can create pets" ON pets FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update their pets" ON pets FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete their pets" ON pets FOR DELETE USING (auth.uid() = owner_id);

-- MEDICAL RECORDS POLICIES
CREATE POLICY "Anyone can read medical records" ON medical_records FOR SELECT USING (true);
CREATE POLICY "Vets can create medical records" ON medical_records FOR INSERT WITH CHECK (auth.uid() = vet_id);
CREATE POLICY "Owners can update their pets records" ON medical_records FOR UPDATE USING (
    EXISTS (SELECT 1 FROM pets WHERE id = medical_records.pet_id AND owner_id = auth.uid())
);
CREATE POLICY "Owners can delete their pets records" ON medical_records FOR DELETE USING (
    EXISTS (SELECT 1 FROM pets WHERE id = medical_records.pet_id AND owner_id = auth.uid())
);

-- ACCESS TOKENS POLICIES
CREATE POLICY "Anyone can read access tokens" ON access_tokens FOR SELECT USING (true);
CREATE POLICY "Pet owners can create access tokens" ON access_tokens FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM pets WHERE id = access_tokens.pet_id AND owner_id = auth.uid())
);

-- ACCESS LOGS POLICIES
CREATE POLICY "Anyone can read access logs" ON access_logs FOR SELECT USING (true);
CREATE POLICY "Vets can create access logs" ON access_logs FOR INSERT WITH CHECK (auth.uid() = vet_id);

-- SHELTERS POLICIES
CREATE POLICY "Anyone can read shelters" ON shelters FOR SELECT USING (true);
CREATE POLICY "Shelters can insert their profile" ON shelters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Shelters can update their profile" ON shelters FOR UPDATE USING (auth.uid() = user_id);

-- PETS FOR ADOPTION POLICIES
CREATE POLICY "Anyone can read pets for adoption" ON pets_for_adoption FOR SELECT USING (true);
CREATE POLICY "Shelters can manage pets for adoption" ON pets_for_adoption FOR ALL USING (
    EXISTS (SELECT 1 FROM shelters WHERE id = pets_for_adoption.shelter_id AND user_id = auth.uid())
);

-- VOLUNTEERS POLICIES
CREATE POLICY "Anyone can read volunteers" ON volunteers FOR SELECT USING (true);
CREATE POLICY "Shelters can manage volunteers" ON volunteers FOR ALL USING (
    EXISTS (SELECT 1 FROM shelters WHERE id = volunteers.shelter_id AND user_id = auth.uid())
);

-- ============================================
-- STORAGE BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-photos', 'pet-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view pet photos" ON storage.objects FOR SELECT USING (bucket_id = 'pet-photos');
CREATE POLICY "Authenticated users can upload pet photos" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'pet-photos' AND auth.role() = 'authenticated'
);
CREATE POLICY "Users can delete their pet photos" ON storage.objects FOR DELETE USING (
    bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_pets_owner_id ON pets(owner_id);
CREATE INDEX idx_medical_records_pet_id ON medical_records(pet_id);
CREATE INDEX idx_access_tokens_pet_id ON access_tokens(pet_id);
CREATE INDEX idx_access_tokens_pin ON access_tokens(pin);
CREATE INDEX idx_access_logs_vet_id ON access_logs(vet_id);
CREATE INDEX idx_pets_for_adoption_shelter_id ON pets_for_adoption(shelter_id);
