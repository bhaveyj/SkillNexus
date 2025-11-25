import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface MasterclassEmailData {
  to: string;
  userName: string;
  masterclassTitle: string;
  instructorName: string;
  date: string;
  time: string;
  duration: string;
  meetLink: string;
}

export async function sendMasterclassRegistrationEmail(data: MasterclassEmailData) {
  const {
    to,
    userName,
    masterclassTitle,
    instructorName,
    date,
    time,
    duration,
    meetLink,
  } = data;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 10px 10px 0 0;
          text-align: center;
        }
        .content {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .details {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          padding: 10px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: 600;
          width: 140px;
          color: #495057;
        }
        .detail-value {
          color: #212529;
        }
        .meet-link {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 14px 32px;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
          font-weight: 600;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #6c757d;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0; font-size: 28px;">Registration Confirmed! 🎉</h1>
      </div>
      <div class="content">
        <p>Hi ${userName},</p>
        <p>You've successfully registered for the masterclass!</p>
        
        <div class="details">
          <h2 style="margin-top: 0; color: #667eea;">${masterclassTitle}</h2>
          <div class="detail-row">
            <span class="detail-label">Instructor:</span>
            <span class="detail-value">${instructorName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${date}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Time:</span>
            <span class="detail-value">${time}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Duration:</span>
            <span class="detail-value">${duration}</span>
          </div>
        </div>

        <div style="text-align: center;">
          <a href="${meetLink}" class="meet-link">Join Google Meet</a>
        </div>

        <p style="margin-top: 20px;">
          <strong>Important:</strong> Please save this email and use the link above to join the session at the scheduled time.
        </p>

        <p>We recommend joining 5 minutes early to test your audio and video settings.</p>

        <p>See you at the masterclass!</p>
        
        <p>Best regards,<br/>The SkillNexus Team</p>
      </div>
      <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Registration Confirmed!

    Hi ${userName},

    You've successfully registered for the masterclass!

    Masterclass Details:
    - Title: ${masterclassTitle}
    - Instructor: ${instructorName}
    - Date: ${date}
    - Time: ${time}
    - Duration: ${duration}

    Google Meet Link: ${meetLink}

    Please save this email and use the link above to join the session at the scheduled time.

    We recommend joining 5 minutes early to test your audio and video settings.

    See you at the masterclass!

    Best regards,
    The SkillNexus Team
  `;

  try {
    const info = await transporter.sendMail({
      from: `"SkillNexus" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: `Registration Confirmed: ${masterclassTitle}`,
      text: textContent,
      html: htmlContent,
    });

    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send registration email');
  }
}
