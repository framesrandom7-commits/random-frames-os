import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
// It's safe to instantiate it even if the key is missing (it will throw an error when sending instead)
const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

/**
 * Sends an email with the provided parameters
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set. Mocking email send to:", to, "Subject:", subject);
      return { success: true, messageId: 'mock_id' };
    }

    const data = await resend.emails.send({
      from: 'Random Frames <onboarding@randomframesbysavan.in>',
      to,
      subject,
      html: html || '',
      text: text || '',
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

/**
 * Specifically sends the Client Onboarding Form link
 */
export async function sendClientFormEmail(leadId: string, email: string, businessName: string) {
  const formLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding/${leadId}`;
  
  const subject = `Welcome to Random Frames, ${businessName}! Please complete your onboarding`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; padding: 24px;">
      <h2 style="color: #111;">Welcome to Random Frames!</h2>
      <p>Hi ${businessName},</p>
      <p>Thank you for choosing Random Frames. We're excited to work with you on your upcoming project!</p>
      <p>To ensure a smooth start, please take a moment to complete our client information form. This will help us gather the necessary details for our collaboration and invoicing.</p>
      
      <div style="margin: 32px 0; text-align: center;">
        <a href="${formLink}" style="background-color: #C1121F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
          Complete Client Form
        </a>
      </div>
      
      <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
      <p style="color: #666; word-break: break-all;">${formLink}</p>
      
      <p>Looking forward to a great shoot!</p>
      <br/>
      <p>Best regards,<br/>
      <strong>Savan Somaiah T P</strong><br/>
      Random Frames Studio</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject,
    html,
  });
}
