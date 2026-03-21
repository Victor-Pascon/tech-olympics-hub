import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the caller is an admin
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallbacks for standard Supabase environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://zinlfatzabxwnzpyqwwh.supabase.co";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("APP_SERVICE_ROLE_KEY");

    if (!supabaseUrl) throw new Error("SUPABASE_URL is missing");
    if (!anonKey) throw new Error("SUPABASE_ANON_KEY is missing");
    if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing (try adding APP_SERVICE_ROLE_KEY)");

    // Verify caller is admin using their JWT
    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: callerError } = await anonClient.auth.getUser();
    
    if (callerError || !caller) {
      return new Response(JSON.stringify({ error: "Não autorizado: Sessão inválida" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: isAdmin } = await adminClient.rpc("has_role", {
      _user_id: caller.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Apenas administradores podem criar usuários" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { nome, email, password, matricula, funcao } = await req.json();

    if (!nome || !email || !password) {
      return new Response(JSON.stringify({ error: "Nome, email e senha são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create user with admin client
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome },
    });

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update profile name
    await adminClient
      .from("profiles")
      .update({ nome })
      .eq("id", newUser.user.id);

    // Assign admin role
    await adminClient.from("user_roles").insert({
      user_id: newUser.user.id,
      role: "admin",
    });

    // Create admin_users record
    await adminClient.from("admin_users").insert({
      user_id: newUser.user.id,
      matricula: matricula || "",
      funcao: funcao || [],
    });

    return new Response(
      JSON.stringify({ success: true, user_id: newUser.user.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
