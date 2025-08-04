import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface InviteRequest {
  firstName: string
  lastName: string
  email: string
  trainerId: string
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
    const { firstName, lastName, email, trainerId }: InviteRequest = await req.json()

    // Validate required fields
    if (!firstName || !lastName || !email || !trainerId) {
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

    // Generate a unique assessment code
    const generateAssessmentCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let code = ''
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return code
    }

    // Ensure the assessment code is unique
    const generateUniqueAssessmentCode = async () => {
      let attempts = 0
      const maxAttempts = 10
      
      while (attempts < maxAttempts) {
        const code = generateAssessmentCode()
        
        // Check if this code already exists
        const { data: existingCoach, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('assessment_code', code)
          .eq('role', 'coach')
          .maybeSingle()
        
        if (checkError) {
          console.error('Error checking assessment code uniqueness:', checkError)
          attempts++
          continue
        }
        
        if (!existingCoach) {
          return code // Code is unique
        }
        
        attempts++
      }
      
      throw new Error('Failed to generate unique assessment code')
    }

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
    const assessmentCode = await generateUniqueAssessmentCode()

    // Create the user account
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        role: 'coach',
        first_name: firstName,
        last_name: lastName,
        temp_password: true
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      
      // Provide more specific error messages based on the error
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
          // Return the actual error message if it's informative
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

    // Update the profile to set the coach role, trainer relationship, and assessment code
    // Update the profile to set the coach role and trainer relationship
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        email: email,
        role: 'coach',
        trainer_id: trainerId,
        assessment_code: assessmentCode
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
          role: 'coach',
          trainer_id: trainerId,
          assessment_code: assessmentCode
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
            subject: 'Welcome to EDI™ - Coach Account Created',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Welcome to EDI™ Coach Portal</h2>
                
                <p>Hello ${firstName},</p>
                
                <p>You've been invited to join the Emotional Dynamics Inventory (EDI™) platform as a Coach. As a coach, you'll be able to invite clients, manage their assessments, and provide coaching based on their emotional dynamics results.</p>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #374151;">Your Login Credentials:</h3>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                </div>
                
                <p>As a Coach, you can:</p>
                <ul>
                  <li>Invite clients to take the EDI™ assessment</li>
                  <li>View and analyze client assessment results</li>
                  <li>Access coaching recommendations and insights</li>
                  <li>Track client progress over time</li>
                </ul>
                
                <div style="margin: 30px 0;">
                  <a href="${supabaseUrl.replace('supabase.co', 'vercel.app')}/login" 
                     style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Access Coach Portal
                  </a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px;">
                  <strong>Security Note:</strong> Please change your password after your first login for security purposes.
                </p>
                
                <p>If you have any questions about your coach account or need assistance, please don't hesitate to reach out to our support team.</p>
                
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
        message: 'Coach invited successfully',
        userId: authData.user.id,
        tempPassword: tempPassword,
        assessmentCode: assessmentCode
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