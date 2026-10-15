// @ts-nocheck
// Supabase Edge Function: notify-teacher
// Triggered when a student submits a homework assignment.
// Sends an email notification to the course instructor via Resend.
//
// Required Supabase Secrets (set in Supabase Dashboard -> Project Settings -> Edge Functions -> Secrets):
// - RESEND_API_KEY: Your Resend API Key (re_...)
// - TEACHER_EMAIL: Instructor's email address (e.g. mahmudimunisa8@gmail.com)
// - FROM_EMAIL: Verified Resend sender email (e.g. "AIRY PLANE School" <onboarding@resend.dev> or custom domain)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  student_name: string;
  student_email: string;
  assignment_title: string;
  assignment_week: number;
  submission_text: string;
  file_url?: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const teacherEmail = Deno.env.get('TEACHER_EMAIL') || 'mahmudimunisa8@gmail.com';
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'AIRY PLANE <onboarding@resend.dev>';

    const body: WebhookPayload = await req.json();
    const { student_name, student_email, assignment_title, assignment_week, submission_text, file_url } = body;

    if (!resendApiKey) {
      console.warn('RESEND_API_KEY is not configured in Supabase secrets. Notification skipped.');
      return new Response(
        JSON.stringify({
          status: 'skipped',
          message: 'RESEND_API_KEY not configured. Submission saved in database.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #f0e4e4; border-radius: 16px; background-color: #faf5f5;">
        <h2 style="color: #1f1b1c; font-size: 22px; margin-bottom: 8px;">Новая сданная работа ученика! ✈️</h2>
        <p style="color: #665b5d; font-size: 14px; margin-top: 0;">Школа графического дизайна AIRY PLANE</p>
        
        <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #eddcdc;">
          <p style="margin: 0 0 10px 0;"><strong>Ученик:</strong> ${escapeHtml(student_name)} (${escapeHtml(student_email)})</p>
          <p style="margin: 0 0 10px 0;"><strong>Неделя курса:</strong> Неделя ${assignment_week}</p>
          <p style="margin: 0 0 10px 0;"><strong>Задание:</strong> ${escapeHtml(assignment_title)}</p>
          <div style="margin-top: 16px; padding: 12px; background-color: #faf7f7; border-left: 3px solid #d4a5a5; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #332b2d; white-space: pre-wrap;">${escapeHtml(submission_text)}</p>
          </div>
          ${
            file_url
              ? `<p style="margin-top: 16px;"><a href="${file_url}" style="display: inline-block; padding: 10px 18px; background-color: #1a1516; color: #ffffff; text-decoration: none; border-radius: 9999px; font-size: 13px; font-weight: 600;">📎 Открыть прикрепленный файл</a></p>`
              : '<p style="margin-top: 12px; color: #887b7d; font-size: 13px;">Файл не прикреплен.</p>'
          }
        </div>

        <p style="font-size: 13px; color: #887b7d; text-align: center; margin-top: 24px;">
          Перейдите в панель преподавателя для проверки и обратной связи.
        </p>
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [teacherEmail],
        subject: `[AIRY PLANE] Новое ДЗ: ${assignment_title} (от ${student_name})`,
        html: htmlContent,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Resend API error:', data);
      return new Response(JSON.stringify({ error: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: res.status,
      });
    }

    return new Response(JSON.stringify({ status: 'sent', data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Edge function error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

function escapeHtml(text: string): string {
  return (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
