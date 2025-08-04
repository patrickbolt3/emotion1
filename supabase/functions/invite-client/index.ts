import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface InviteRequest {
  firstName: string
  lastName: string
  email: string
  coachId: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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
    const { firstName, lastName, email, coachId }: InviteRequest = await req.json()

    // Validate required fields
    if (!firstName || !lastName || !email || !coachId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Generate a secure temporary password
    const generatePassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
      let password = ''
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return password
    }

    const tempPassword = generatePassword()

    // Create the user account
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        role: 'respondent',
        first_name: firstName,
        last_name: lastName,
        invited_by: coachId,
        temp_password: true
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Failed to create user account' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: 'User creation failed' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Wait a moment for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Update the profile to set the coach relationship
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        coach_id: coachId,
        first_name: firstName,
        last_name: lastName,
        email: email
      })
      .eq('id', authData.user.id)

    if (profileError) {
      console.error('Profile update error:', profileError)
      // Try to create the profile manually if update failed
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          first_name: firstName,
          last_name: lastName,
          role: 'respondent',
          coach_id: coachId
        })

      if (insertError) {
        console.error('Profile insert error:', insertError)
        return new Response(
          JSON.stringify({ error: 'Failed to create user profile' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Send invitation email using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (resendApiKey) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'EDI Assessment <noreply@yourdomain.com>',
            to: [email],
            subject: 'Invitation to Complete Your Emotional Dynamics Assessment',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Welcome to EDI™ Assessment</h2>
                
                <p>Hello ${firstName},</p>
                
                <p>You've been invited to complete the Emotional Dynamics Inventory (EDI™) assessment. This comprehensive assessment will help identify your emotional patterns and provide valuable insights for your personal development.</p>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #374151;">Your Login Credentials:</h3>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                </div>
                
                <p>To get started:</p>
                <ol>
                  <li>Visit the assessment portal</li>
                  <li>Log in with the credentials above</li>
                  <li>Complete the assessment (takes about 15-20 minutes)</li>
                  <li>Review your personalized results</li>
                </ol>
                
                <div style="margin: 30px 0;">
                  <a href="${supabaseUrl.replace('supabase.co', 'vercel.app')}/login" 
                     style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Start Assessment
                  </a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px;">
                  <strong>Security Note:</strong> Please change your password after your first login for security purposes.
                </p>
                
                <p>If you have any questions or need assistance, please don't hesitate to reach out.</p>
                
                <p>Best regards,<br>The EDI™ Team</p>
              </div>
            `,
          }),
        })

        if (!emailResponse.ok) {
          console.error('Failed to send email:', await emailResponse.text())
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError)
        // Don't fail the entire request if email fails
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Client invited successfully',
        userId: authData.user.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})