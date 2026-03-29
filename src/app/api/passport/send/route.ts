import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ----------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, passportNumber, holderName } = body;

    // Validate required fields
    if (!email || !passportNumber || !holderName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // In a production environment, you would:
    // 1. Generate the PDF server-side using something like puppeteer or @react-pdf/renderer
    // 2. Send the email using a service like Resend, SendGrid, or nodemailer
    
    // For now, we'll simulate success and log the request
    console.log('[Passport Send] Request received:', {
      to: email,
      passportNumber,
      holderName,
      requestedBy: user.id,
      timestamp: new Date().toISOString(),
    });

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In production, you would store this in a database table like `passport_send_history`
    // and actually send the email

    return NextResponse.json({
      success: true,
      message: `Passport would be sent to ${email}`,
      // In production, return actual email delivery info
    });

  } catch (error) {
    console.error('[Passport Send] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send passport' },
      { status: 500 }
    );
  }
}
