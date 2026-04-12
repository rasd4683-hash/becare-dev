import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT_AR = `أنت مساعد ذكي لشركة "بي كير" (BCare) للتأمين. تساعد العملاء بالإجابة على أسئلتهم حول:
- أنواع التأمين (مركبات، طبي، أخطاء طبية، سفر، عمالة منزلية)
- كيفية تقديم طلب تأمين
- كيفية تقديم مطالبة
- أسعار وتغطيات التأمين
- الأسئلة الشائعة

قواعد مهمة:
- أجب باللغة العربية دائماً
- كن مختصراً وواضحاً
- إذا لم تعرف الإجابة، اقترح التحدث مع فريق الدعم
- إذا طلب العميل التحدث مع موظف، أجب بالضبط: [TRANSFER_TO_AGENT]
- كن ودوداً ومهنياً`;

const SYSTEM_PROMPT_EN = `You are a smart assistant for "BCare" insurance company. You help customers by answering their questions about:
- Insurance types (vehicles, medical, medical malpractice, travel, domestic workers)
- How to submit an insurance request
- How to file a claim
- Insurance prices and coverage
- Frequently asked questions

Important rules:
- Always respond in English
- Be concise and clear
- If you don't know the answer, suggest speaking with the support team
- If the customer asks to speak with an agent, respond exactly: [TRANSFER_TO_AGENT]
- Be friendly and professional`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, lang } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = lang === 'en' ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_AR;

    const response = await fetch('https://api.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-10),
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API error [${response.status}]: ${errorText}`);
    }

    const data = await response.json();
    const fallback = lang === 'en' ? 'Sorry, I could not process your request.' : 'عذراً، لم أتمكن من معالجة طلبك.';
    const reply = data.choices?.[0]?.message?.content || fallback;

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Chat AI error:', error);
    return new Response(JSON.stringify({ 
      reply: 'عذراً، حدث خطأ. يمكنك التحدث مع فريق الدعم مباشرة.',
      error: true 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
