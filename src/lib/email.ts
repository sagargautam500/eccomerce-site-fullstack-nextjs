// lib/email.ts
import nodemailer from "nodemailer";

// Reusable email sender function
export async function sendContactEmail({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  // Create reusable transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports (like 587)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Optional: debug in development
    debug: process.env.NODE_ENV === "development",
  });

  // Verify connection (optional but helpful)
  await transporter.verify();

  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: process.env.CONTACT_EMAIL, // e.g., "support@chimteshwarshop.com"
    subject: `Contact Form: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background: #f9f9f9;">
        <h2 style="color: #e1522d;">New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <div style="margin-top: 16px;">
          <strong>Message:</strong>
          <div style="background: white; padding: 12px; border-radius: 6px; margin-top: 8px; border-left: 3px solid #e1522d;">
            ${message.replace(/\n/g, "<br />")}
          </div>
        </div>
        <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ddd;" />
        <p style="font-size: 12px; color: #777;">
          Sent from Chimteshwar Shop Contact Form
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}