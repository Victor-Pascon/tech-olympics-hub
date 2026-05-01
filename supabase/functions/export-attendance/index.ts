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
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("APP_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Variáveis de ambiente SUPABASE_URL e SERVICE_ROLE_KEY são obrigatórias");
    }

    // Verify admin caller
    const anonClient = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: callerError } = await anonClient.auth.getUser();
    if (callerError || !caller) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
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
      return new Response(JSON.stringify({ error: "Apenas administradores podem exportar" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse filters from request body
    const { olympiad_id, workshop_id, lecture_id, data_inicio, data_fim } = await req.json();

    // Build query
    let query = adminClient
      .from("attendance")
      .select(`
        id, presente, data, validation_code, created_at,
        user_id,
        olympiad_id,
        activity_id,
        workshop_id,
        lecture_id
      `)
      .eq("presente", true);

    if (olympiad_id) query = query.eq("olympiad_id", olympiad_id);
    if (workshop_id) query = query.eq("workshop_id", workshop_id);
    if (lecture_id) query = query.eq("lecture_id", lecture_id);
    if (data_inicio) query = query.gte("data", data_inicio);
    if (data_fim) query = query.lte("data", data_fim);

    const { data: attendanceData, error } = await query.order("data", { ascending: false });

    if (error) throw error;

    // Fetch related names
    const userIds = [...new Set((attendanceData || []).map((a: any) => a.user_id))];
    const olympiadIds = [...new Set((attendanceData || []).map((a: any) => a.olympiad_id).filter(Boolean))];
    const workshopIds = [...new Set((attendanceData || []).map((a: any) => a.workshop_id).filter(Boolean))];
    const lectureIds = [...new Set((attendanceData || []).map((a: any) => a.lecture_id).filter(Boolean))];

    const [profilesRes, olympiadsRes, workshopsRes, lecturesRes] = await Promise.all([
      userIds.length ? adminClient.from("profiles").select("id, nome, email, cpf").in("id", userIds) : Promise.resolve({ data: [] }),
      olympiadIds.length ? adminClient.from("olympiads").select("id, nome").in("id", olympiadIds) : Promise.resolve({ data: [] }),
      workshopIds.length ? adminClient.from("workshops").select("id, nome").in("id", workshopIds) : Promise.resolve({ data: [] }),
      lectureIds.length ? adminClient.from("lectures").select("id, nome").in("id", lectureIds) : Promise.resolve({ data: [] }),
    ]);

    const profileMap = new Map((profilesRes.data || []).map((p: any) => [p.id, p]));
    const olympiadMap = new Map((olympiadsRes.data || []).map((o: any) => [o.id, o.nome]));
    const workshopMap = new Map((workshopsRes.data || []).map((w: any) => [w.id, w.nome]));
    const lectureMap = new Map((lecturesRes.data || []).map((l: any) => [l.id, l.nome]));

    // Build CSV
    const header = "Nome;Email;CPF;Data Presença;Código Validação;Evento;Tipo Evento";
    const rows = (attendanceData || []).map((a: any) => {
      const profile = profileMap.get(a.user_id) || {};
      let evento = "";
      let tipo = "";
      if (a.olympiad_id) { evento = olympiadMap.get(a.olympiad_id) || ""; tipo = a.workshop_id ? "Oficina" : a.lecture_id ? "Palestra" : "Olimpíada"; }
      if (a.workshop_id) { evento = workshopMap.get(a.workshop_id) || ""; tipo = "Oficina"; }
      if (a.lecture_id) { evento = lectureMap.get(a.lecture_id) || ""; tipo = "Palestra"; }
      return `${profile.nome || "Desconhecido"};${profile.email || ""};${profile.cpf || ""};${a.data || ""};${a.validation_code || ""};${evento};${tipo}`;
    }).join("\n");

    const csv = `${header}\n${rows}`;

    return new Response(csv, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="presencas-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
