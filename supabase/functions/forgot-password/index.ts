import { createClient } from 'npm:@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ForgotPasswordRequest {
  email: string
}

Deno.serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get request body
    const { email }: ForgotPasswordRequest = await req.json()

    // Validate required fields
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Please provide a valid email address' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Check if user exists in our system
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role')
      .eq('email', email)
      .maybeSingle()

    if (profileError) {
      console.error('Error checking user profile:', profileError)
      return new Response(
        JSON.stringify({ error: 'Failed to process request' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Always return success to prevent email enumeration attacks
    // But only send email if user actually exists
    if (profile) {
      try {
        // Generate password reset link using Supabase Auth
        const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
          type: 'recovery',
          email: email,
          options: {
            redirectTo: 'https://emotionindicator.com/reset-password'
          }
        })

        if (resetError) {
          console.error('Error generating reset link:', resetError)
          throw resetError
        }

        // Send password reset email using Resend
        const resendApiKey = Deno.env.get('RESEND_API_KEY')
        
        if (resendApiKey) {
          console.log('Sending password reset email to:', email)
          
          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'EDI Assessment <noreply@send.emotionindicator.com>',
              to: [email],
              subject: 'Reset Your EDI™ Password',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #2563eb; margin-bottom: 10px;">🧠 Emotional Dynamics Indicator™</h1>
                    <h2 style="color: #374151; margin-top: 0;">Password Reset Request</h2>
                  </div>
                  
                  <p style="font-size: 16px; line-height: 1.6; color: #374151;">Hello ${profile.first_name || 'there'},</p>
                  
                  <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                    We received a request to reset your password for your EDI™ account. If you didn't make this request, 
                    you can safely ignore this email.
                  </p>
                  
                  <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <h4 style="margin-top: 0; color: #92400e;">🔒 Security Information:</h4>
                    <ul style="color: #92400e; margin: 10px 0;">
                      <li>This link will expire in 1 hour for security</li>
                      <li>You can only use this link once</li>
                      <li>If you didn't request this, please ignore this email</li>
                    </ul>
                  </div>
                  
                  <div style="text-align: center; margin: 35px 0;">
                    <a href="${resetData.properties?.action_link}" 
                       style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                      🔑 Reset Your Password
                    </a>
                  </div>
                  
                  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <h4 style="margin-top: 0; color: #374151;">Alternative Method:</h4>
                    <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                      If the button doesn't work, copy and paste this link into your browser:
                    </p>
                    <p style="word-break: break-all; background-color: white; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; color: #374151;">
                      ${resetData.properties?.action_link}
                    </p>
                  </div>
                  
                  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
                      If you continue to have trouble accessing your account, please contact our support team.
                    </p>
                    
                    <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                      Best regards,<br>
                      <strong>The EDI™ Team</strong>
                    </p>
                  </div>
                </div>
              `,
            }),
          })

          console.log('Email API response status:', emailResponse.status)
          
          if (!emailResponse.ok) {
            const errorText = await emailResponse.text()
            console.error('Failed to send password reset email. Status:', emailResponse.status)
            console.error('Error response:', errorText)
          } else {
            const emailResult = await emailResponse.json()
            console.log('Password reset email sent successfully:', emailResult)
          }
        } else {
          console.log('RESEND_API_KEY not found in environment variables')
        }
      } catch (emailError) {
        console.error('Error sending password reset email:', emailError)
        // Don't fail the request if email fails - user still gets success message
      }
    } else {
      console.log('No user found with email:', email)
      // Still log this but don't reveal it to prevent email enumeration
    }

    // Always return success to prevent email enumeration attacks
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'If an account with that email exists, a password reset link has been sent.'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error in forgot-password function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})