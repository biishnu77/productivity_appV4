import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(req: Request) {
  try {
    const { email, username } = await req.json();

    if (!email || !username) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const msg = {
      to: email,
      from: 'biishnuthapa@gmail.com', // Use a verified sender email
      subject: 'Your Account Username',
      text: `Your username is: ${username}`,
      html: `<strong>Your username is:</strong> ${username}`,
    };

    await sgMail.send(msg);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error sending username email:', error);
    return NextResponse.json(
      { error: 'Failed to send username email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
