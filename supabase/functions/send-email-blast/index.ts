import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { Resend } from "npm:resend@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Recipient {
  email: string
  name: string
  cohort: string
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { subject, body, recipients } = await req.json() as {
      subject: string
      body: string
      recipients: Recipient[]
    }

    // 1. Check for API Key
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not found in Edge Function environment variables')
    }

    const resend = new Resend(resendApiKey)

    // 2. Determine "From" address
    const fromAddress = Deno.env.get('EMAIL_FROM') || 'Joy in Living Academy <onboarding@resend.dev>'

    // 3. Send personalized emails to each recipient
    const results = await Promise.all(
      recipients.map(async (recipient) => {
        // Replace placeholders with actual data
        const personalizedSubject = subject
          .replace(/\[Name\]/g, recipient.name)
          .replace(/\[Cohort\]/g, recipient.cohort)
        
        const personalizedBody = body
          .replace(/\[Name\]/g, recipient.name)
          .replace(/\[Email\]/g, recipient.email)
          .replace(/\[Cohort\]/g, recipient.cohort)
          .replace(/\n/g, '<br>')

        const { data, error } = await resend.emails.send({
          from: fromAddress,
          to: recipient.email,
          subject: personalizedSubject,
          html: personalizedBody,
        })

        if (error) {
          console.error(`Error sending to ${recipient.email}:`, error)
          return { email: recipient.email, success: false, error: error.message }
        }
        return { email: recipient.email, success: true, id: data?.id }
      })
    )

    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    return new Response(
      JSON.stringify({ 
        message: `Sent ${successful} emails, ${failed} failed`,
        results 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error: any) {
    console.error('Edge Function Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
