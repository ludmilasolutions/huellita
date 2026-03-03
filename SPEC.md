# Mi Huellita - Specification Document

## 1. Project Overview

**Name**: Mi Huellita  
**Tagline**: La historia de tu mascota, siempre contigo.  
**Developer**: AFM Solutions

**Type**: Progressive Web App (PWA)  
**Core Functionality**: Digital medical history for pets with PIN-based vet access + solidarity network for shelters/adoptions  
**Target Market**: Pet owners, veterinary clinics, and shelters in Argentina

## 2. Technical Architecture

### Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Build Tool**: Vite (optional for development)
- **Styling**: Tailwind CSS (via CDN for simplicity)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Edge Functions**: TypeScript (Deno runtime)
- **Hosting**: Static files (Netlify/Vercel compatible)

### Constraints
- NO Node.js in production
- NO Express, Next.js, or Node-based frameworks
- All backend logic via Supabase services

## 3. Database Schema (PostgreSQL)

### Tables

#### `profiles` (extends Supabase auth.users)
- `id` UUID PRIMARY KEY (references auth.users)
- `email` TEXT
- `full_name` TEXT
- `role` TEXT ('owner', 'vet', 'admin', 'shelter')
- `phone` TEXT
- `avatar_url` TEXT
- `created_at` TIMESTAMPTZ
- `updated_at` TIMESTAMPTZ

#### `veterinaries`
- `id` UUID PRIMARY KEY
- `user_id` UUID (references profiles.id)
- `name` TEXT
- `address` TEXT
- `city` TEXT
- `phone` TEXT
- `email` TEXT
- `license` TEXT (veterinary license number)
- `created_at` TIMESTAMPTZ

#### `pets`
- `id` UUID PRIMARY KEY
- `owner_id` UUID (references profiles.id)
- `name` TEXT
- `species` TEXT ('perro', 'gato', 'otro')
- `breed` TEXT
- `birth_date` DATE
- `gender` TEXT ('macho', 'hembra')
- `color` TEXT
- `weight` FLOAT
- `photo_url` TEXT
- `microchip` TEXT
- `notes` TEXT
- `created_at` TIMESTAMPTZ
- `updated_at` TIMESTAMPTZ

#### `medical_records`
- `id` UUID PRIMARY KEY
- `pet_id` UUID (references pets.id)
- `vet_id` UUID (references profiles.id)
- `veterinary_name` TEXT
- `type` TEXT ('consulta', 'vacuna', 'cirugia', 'analisis', 'tratamiento', 'otro')
- `description` TEXT
- `date` DATE
- `next_visit` DATE (optional)
- `attachments` TEXT[] (urls to stored files)
- `created_at` TIMESTAMPTZ

#### `access_tokens`
- `id` UUID PRIMARY KEY
- `pet_id` UUID (references pets.id)
- `pin` TEXT (6-digit)
- `expires_at` TIMESTAMPTZ
- `is_active` BOOLEAN
- `created_at` TIMESTAMPTZ

#### `access_logs`
- `id` UUID PRIMARY KEY
- `pet_id` UUID (references pets.id)
- `vet_id` UUID (references profiles.id)
- `token_id` UUID (references access_tokens.id)
- `accessed_at` TIMESTAMPTZ

#### `shelters`
- `id` UUID PRIMARY KEY
- `user_id` UUID (references profiles.id)
- `name` TEXT
- `description` TEXT
- `address` TEXT
- `city` TEXT
- `phone` TEXT
- `email` TEXT
- `website` TEXT
- `photo_url` TEXT
- `bank_info` TEXT (for donations - optional)
- `created_at` TIMESTAMPTZ
- `updated_at` TIMESTAMPTZ

#### `pets_for_adoption`
- `id` UUID PRIMARY KEY
- `shelter_id` UUID (references shelters.id)
- `name` TEXT
- `species` TEXT
- `age` TEXT
- `gender` TEXT
- `description` TEXT
- `photo_url` TEXT
- `status` TEXT ('disponible', 'adoptado', 'en_tratamiento')
- `urgent` BOOLEAN
- `created_at` TIMESTAMPTZ
- `updated_at` TIMESTAMPTZ

#### `volunteers`
- `id` UUID PRIMARY KEY
- `shelter_id` UUID (references shelters.id)
- `name` TEXT
- `phone` TEXT
- `email` TEXT
- `skills` TEXT
- `availability` TEXT
- `created_at` TIMESTAMPTZ

## 4. Security (RLS Policies)

All tables have Row Level Security enabled with policies:
- **profiles**: Users can read all, update only their own
- **pets**: Owners can CRUD their pets; vets can read pets they have access to
- **medical_records**: Owners can read their pets' records; vets can read/write if they have valid access token
- **access_tokens**: Only owner can generate; only specific token can be validated
- **shelters/pets_for_adoption**: Public read, authenticated create/update by shelter owners

## 5. Edge Functions

### `generate-pin`
- **Method**: POST
- **Input**: pet_id, user_id (from auth)
- **Process**: Validate ownership, generate 6-digit PIN, save with 15-min expiry
- **Output**: { success: true, pin: "123456" }

### `validate-pin`
- **Method**: POST
- **Input**: pin, vet_id
- **Process**: Find active, non-expired token, log access
- **Output**: { valid: true, pet_id, pet_name, access_token }

### `add-medical-record`
- **Method**: POST
- **Input**: pet_id, vet_id, type, description, date, next_visit, access_token
- **Process**: Validate token, insert record
- **Output**: { success: true, record_id }

## 6. UI/UX Design

### Color Palette
- **Primary**: #5D4E37 (warm brown)
- **Secondary**: #F5E6D3 (cream)
- **Accent**: #E8985E (warm orange)
- **Success**: #6B9B7A (soft green)
- **Error**: #C75D5D (soft red)
- **Background**: #FDF8F3 (warm white)
- **Text**: #3D3D3D (dark gray)

### Typography
- **Headings**: "Nunito", sans-serif (warm, friendly)
- **Body**: "Open Sans", sans-serif

### Layout
- Responsive mobile-first
- Card-based interface
- Bottom navigation for mobile
- Sidebar for desktop

## 7. File Structure

```
/
├── index.html
├── login.html
├── register.html
├── dashboard.html
├── solidary.html
├── adopt.html
├── css/
│   └── styles.css
├── js/
│   ├── supabase-client.js
│   ├── auth.js
│   ├── owner.js
│   ├── vet.js
│   ├── admin.js
│   └── public.js
├── assets/
│   └── (images, icons)
└── supabase/
    └── functions/
        ├── generate-pin/
        │   └── index.ts
        ├── validate-pin/
        │   └── index.ts
        └── add-medical-record/
            └── index.ts
```

## 8. Acceptance Criteria

1. ✅ User can register/login with Google OAuth
2. ✅ User can select role (owner/vet/shelter) on registration
3. ✅ Owner can add pets with photo and details
4. ✅ Owner can generate 6-digit PIN for vet access
5. ✅ Vet can validate PIN and view pet info
6. ✅ Vet can add medical records after PIN validation
7. ✅ Owner can view full medical history
8. ✅ Public can view shelters and pets for adoption
9. ✅ All sensitive operations use Edge Functions
10. ✅ RLS policies protect data at row level
