import { createClient } from 'npm:@supabase/supabase-js@2.39.7'

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
      
      // Provide more specific error messages
      let errorMessage = 'Failed to create user account'
      
      if (authError.message) {
        if (authError.message.includes('User already registered') || 
            authError.message.includes('already been registered')) {
          errorMessage = 'A user with this email address already exists'
        } else if (authError.message.includes('Invalid email')) {
          errorMessage = 'Please provide a valid email address'
        } else if (authError.message.includes('Password')) {
          errorMessage = 'Password requirements not met'
        } else {
          errorMessage = authError.message
        }
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
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

    // Update the profile to set the coach relationship and ensure email is stored
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        coach_id: coachId,
        first_name: firstName,
        last_name: lastName,
        email: email,
        role: 'respondent'
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
          email: email,
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

    // Get coach information for the email
    const { data: coachData, error: coachError } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', coachId)
      .single()

    const coachName = coachData ? `${coachData.first_name || ''} ${coachData.last_name || ''}`.trim() : 'Your coach'

    // Send invitation email using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (resendApiKey) {
      try {
        console.log('Sending email to:', email)
        console.log('Using Resend API key:', resendApiKey ? 'Present' : 'Missing')
        
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'EDI Assessment <noreply@send.emotionindicator.com>',
            to: [email],
            subject: 'Invitation to Complete Your Emotional Dynamics Assessment',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #2563eb; margin-bottom: 10px;">🧠 Emotional Dynamics Indicator™</h1>
                  <h2 style="color: #374151; margin-top: 0;">You're Invited to Take the Assessment</h2>
                </div>
                
                <p style="font-size: 16px; line-height: 1.6; color: #374151;">Hello ${firstName},</p>
                
                <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                  ${coachName} has invited you to complete the Emotional Dynamics Inventory (EDI™) assessment. 
                  This comprehensive assessment will help identify your emotional patterns and provide valuable 
                  insights for your personal development journey.
                </p>
                
                <div style="background-color: #f8fafc; border: 2px solid #e2e8f0; padding: 25px; border-radius: 12px; margin: 25px 0;">
                  <h3 style="margin-top: 0; color: #1e40af; font-size: 18px;">🔑 Your Login Credentials</h3>
                  <div style="background-color: white; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;">
                    <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                    <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${tempPassword}</code></p>
                  </div>
                </div>
                
                <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="margin-top: 0; color: #92400e;">📋 How to Get Started:</h4>
                  <ol style="color: #92400e; margin: 10px 0;">
                    <li>Click the button below to access the assessment portal</li>
                    <li>Log in with the credentials provided above</li>
                    <li>Complete the assessment (takes about 15-20 minutes)</li>
                    <li>Review your personalized results and insights</li>
                  </ol>
                </div>
                
                <div style="text-align: center; margin: 35px 0;">
                  <a href="https://emotionindicator.com/login" 
                     style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    🚀 Start Your Assessment
                  </a>
                </div>
                
                <div style="background-color: #fef2f2; border: 1px solid #fca5a5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #991b1b; font-size: 14px;">
                    <strong>🔒 Security Note:</strong> Please change your password after your first login for security purposes.
                  </p>
                </div>
                
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
                    If you have any questions or need assistance, please don't hesitate to reach out to ${coachName} or our support team.
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
          console.error('Failed to send email. Status:', emailResponse.status)
          console.error('Error response:', errorText)
          
          // Don't fail the entire request, but log the issue
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Client account created successfully, but email delivery failed',
              userId: authData.user.id,
              tempPassword: tempPassword,
              emailError: `Email failed: ${errorText}`
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        } else {
          const emailResult = await emailResponse.json()
          console.log('Email sent successfully:', emailResult)
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError)
        // Don't fail the entire request if email fails, but include the error info
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Client account created successfully, but email delivery encountered an error',
            userId: authData.user.id,
            tempPassword: tempPassword,
            emailError: emailError.message
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    } else {
      console.log('RESEND_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Client account created successfully, but email not sent (API key missing)',
          userId: authData.user.id,
          tempPassword: tempPassword
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Client invited successfully and email sent',
        userId: authData.user.id,
        tempPassword: tempPassword
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