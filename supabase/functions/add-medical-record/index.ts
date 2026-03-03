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

    const {
      pet_id,
      type,
      description,
      date,
      next_visit,
      veterinary_name,
      attachments,
      access_token
    } = await req.json();

    if (!pet_id || !type || !description || !date) {
      return new Response(
        JSON.stringify({ error: "pet_id, type, description, and date are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: vetProfile, error: vetError } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .single();

    if (vetError || !vetProfile) {
      return new Response(
        JSON.stringify({ error: "Veterinary profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (vetProfile.role !== 'vet') {
      return new Response(
        JSON.stringify({ error: "Only veterinarians can add medical records" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: { data: recentLogs }, error: logCheckError } = await supabase
      .from("access_logs")
      .select("accessed_at, token_id")
      .eq("pet_id", pet_id)
      .eq("vet_id", user.id)
      .order("accessed_at", { ascending: false })
      .limit(1)
      .single();

    let hasAccess = false;

    if (recentLogs) {
      const accessTime = new Date(recentLogs.accessed_at);
      const now = new Date();
      const diffMinutes = (now.getTime() - accessTime.getTime()) / (1000 * 60);
      hasAccess = diffMinutes <= 30;
    }

    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: "No tienes acceso reciente a esta mascota. Por favor valida el PIN nuevamente." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let vetName = veterinary_name;
    if (!vetName) {
      const { data: vetClinic } = await supabase
        .from("veterinaries")
        .select("name")
        .eq("user_id", user.id)
        .single();
      if (vetClinic) {
        vetName = vetClinic.name;
      } else {
        vetName = vetProfile.full_name || "Veterinaria";
      }
    }

    const { data: record, error: recordError } = await supabase
      .from("medical_records")
      .insert({
        pet_id: pet_id,
        vet_id: user.id,
        veterinary_name: vetName,
        type: type,
        description: description,
        date: date,
        next_visit: next_visit || null,
        attachments: attachments || [],
      })
      .select()
      .single();

    if (recordError) {
      return new Response(
        JSON.stringify({ error: "Failed to create medical record: " + recordError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        record: record,
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
