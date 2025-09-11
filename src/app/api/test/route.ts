// /app/api/test/route.ts
import { createClient } from "@/utils/supabase/client";

export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("projects").select("*");

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ data }), { status: 200 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
