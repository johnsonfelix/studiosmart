import nodemailer from "nodemailer";

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export async function sendMagicPhotosEmail(userEmail: string, photos: { previewUrl: string, fullResUrl: string }[]) {
  if (!smtpUser || !smtpPass) {
    console.error("Missing SMTP credentials in environment variables.");
    return;
  }

  const photoLinksHtml = photos.map(
    (p, i) => `
    <div style="margin-bottom: 20px;">
      <p style="margin: 0 0 10px 0; font-weight: bold;">Photo ${i + 1}</p>
      <img src="${p.previewUrl}" alt="Your Photo" style="max-width: 100%; border-radius: 8px; margin-bottom: 10px;" />
    </div>
  `
  ).join("");

  const mailOptions = {
    from: `"StudioSmart AI" <${smtpUser}>`,
    to: userEmail,
    subject: "✨ Your Event Photos are Here!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1f2937;">Your AI Matched Photos</h1>
        <p style="color: #4b5563; font-size: 16px;">
          Thanks for scanning the QR code! Our AI has found ${photos.length} photos of you from the event.
        </p>
        <div style="margin-top: 30px;">
          ${photoLinksHtml}
        </div>
        <p style="margin-top: 40px; color: #9ca3af; font-size: 14px; text-align: center;">
          Powered by <a href="${process.env.NEXT_PUBLIC_APP_URL || '#'}" style="color: #2563eb; text-decoration: none;">StudioSmart</a>
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Magic Email sent: " + info.response);
    return { success: true };
  } catch (error) {
    console.error("Error sending magic email:", error);
    return { success: false, error };
  }
}

export async function sendSelectionSubmittedEmail(
  ownerEmail: string,
  albumTitle: string,
  clientName: string,
  selectedCount: number,
  galleryUrl: string
) {
  if (!smtpUser || !smtpPass) {
    console.error("Missing SMTP credentials for selection email.");
    return;
  }

  const mailOptions = {
    from: `"StudioSmart Selection" <${smtpUser}>`,
    to: ownerEmail,
    subject: `📸 Selection Completed: ${albumTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #111827; margin-bottom: 16px;">Photo Selection Completed!</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
          Great news! <strong>${clientName}</strong> has completed their photo selection for the album <strong>"${albumTitle}"</strong>.
        </p>
        <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; margin: 24px 0;">
          <p style="margin: 0; color: #374151; font-weight: 600;">Selection Summary:</p>
          <p style="margin: 8px 0 0 0; color: #059669; font-size: 18px; font-weight: bold;">
            ${selectedCount} photos selected
          </p>
        </div>
        <p style="color: #4b5563; font-size: 14px;">
          The client's gallery is now locked. You can view the selection in your studio dashboard or by visiting the gallery directly.
        </p>
        <div style="margin-top: 32px; text-align: center;">
          <a href="${galleryUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
            View Gallery
          </a>
        </div>
        <hr style="margin: 32px 0; border: 0; border-top: 1px solid #e5e7eb;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          This is an automated notification from <a href="${process.env.NEXT_PUBLIC_APP_URL || '#'}" style="color: #2563eb; text-decoration: none;">StudioSmart</a>.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Selection completion email sent: " + info.response);
    return { success: true };
  } catch (error) {
    console.error("Error sending selection completion email:", error);
    return { success: false, error };
  }
}
