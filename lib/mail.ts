import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
    try {
        await resend.emails.send({
            from: 'Flowershop <onboarding@resend.dev>', // Default testing domain for Resend
            to: email,
            subject: 'Reset Your Flowershop Password',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Times New Roman', serif; background-color: #f9fafb; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #f3f4f6; }
            .logo { text-align: center; margin-bottom: 30px; }
            .logo img { height: 60px; }
            h1 { color: #111827; text-align: center; font-size: 24px; margin-bottom: 20px; }
            p { color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px; }
            .btn-container { text-align: center; margin: 30px 0; }
            .btn { background-color: #db2777; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; }
            .btn:hover { background-color: #be185d; }
            .footer { text-align: center; color: #9ca3af; font-size: 14px; margin-top: 40px; border-top: 1px solid #f3f4f6; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <!-- Ideally link to a hosted image, but for now we'll use a placeholder or absolute URL if user had one hosted. 
                   Since this is local dev, inline images or local URLs won't show in email. 
                   Using a text logo for fallback or a generic flower icon online if available. -->
              <span style="font-size: 28px; font-weight: bold; color: #1f2937;">Flowershop.</span>
            </div>
            <h1>Password Reset Request</h1>
            <p>Hello,</p>
            <p>We received a request to reset the password for your Flowershop account. If you didn't make this request, you can safely ignore this email.</p>
            <div class="btn-container">
              <a href="${resetUrl}" class="btn">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #db2777;">${resetUrl}</p>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Flowershop. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to send email:', error);
        return { success: false, error };
    }
}
