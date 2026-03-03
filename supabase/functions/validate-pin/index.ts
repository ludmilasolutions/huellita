import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { pin } = await req.json();

    if (!pin) {
      return new Response(
        JSON.stringify({ error: "PIN is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: tokenData, error: tokenError } = await supabase
      .from("access_tokens")
      .select("id, pet_id, expires_at, is_active")
      .eq("pin", pin)
      .eq("is_active", true)
      .single();

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ valid: false, error: "PIN inválido o no encontrado" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);

    if (now > expiresAt) {
      await supabase
        .from("access_tokens")
        .update({ is_active: false })
        .eq("id", tokenData.id);

      return new Response(
        JSON.stringify({ valid: false, error: "El PIN ha expirado" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: pet, error: petError } = await supabase
      .from("pets")
      .select("id, name, species, breed, birth_date, gender, color, weight, photo_url, owner_id")
      .eq("id", tokenData.pet_id)
      .single();

    if (petError || !pet) {
      return new Response(
        JSON.stringify({ error: "Pet not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: owner, error: ownerError } = await supabase
      .from("profiles")
      .select("full_name, phone, email")
      .eq("id", pet.owner_id)
      .single();

    const { error: logError } = await supabase
      .from("access_logs")
      .insert({
        pet_id: pet.id,
        vet_id: user.id,
        token_id: tokenData.id,
      });

    const accessToken = crypto.randomUUID();

    return new Response(
      JSON.stringify({
        valid: true,
        pet_id: pet.id,
        pet_name: pet.name,
        pet: pet,
        owner: owner || null,
        access_token: accessToken,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
