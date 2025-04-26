import { NextResponse } from "next/server";
import { Resend } from 'resend';

// Store verification codes temporarily (in production, use a database)
const verificationCodes = new Map<string, { code: string, expiresAt: Date }>();

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  try {
    const { email } = await request.json();
    
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store the code with 10-minute expiration
    verificationCodes.set(email, {
      code: verificationCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    const { data, error } = await resend.emails.send({
      from: 'Shahmatki <onboarding@resend.dev>',
      to: email,
      subject: 'Email Verification',
      html: `
        <h1>Verify your email</h1>
        <p>Your verification code is: <strong>${verificationCode}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ message: 'Failed to send email' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { email, code } = await request.json();
    
    const storedData = verificationCodes.get(email);
    
    if (!storedData) {
      return NextResponse.json({ error: 'No verification code found' }, { status: 400 });
    }
    
    if (new Date() > storedData.expiresAt) {
      verificationCodes.delete(email);
      return NextResponse.json({ error: 'Verification code expired' }, { status: 400 });
    }
    
    if (storedData.code !== code) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }
    
    // Clear the verification code after successful verification
    verificationCodes.delete(email);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
