import { supabase } from "@/integrations/supabase/client";

export const logActivity = async (
  action: string,
  entityType: string,
  entityId?: string,
  details?: string
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("activity_logs" as any).insert({
      user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      details: details || null,
    } as any);
  } catch (err) {
    // activity log failed silently
  }
};
