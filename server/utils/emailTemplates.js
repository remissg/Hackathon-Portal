/**
 * MatruCare AI - Branded Email Templates
 * Complies with strict guidelines: Sender is always 'MatruCare AI' <matrucareai@gmail.com>
 */

export const generateOtpEmailTemplate = ({ otp, expiryMinutes = 10 }) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your MatruCare AI Verification Code</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 10px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #0b132b 0%, #1c2541 100%); padding: 32px 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 26px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">MatruCare AI</h1>
                <p style="margin: 6px 0 0; color: #38bdf8; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">Hackathon Registration Portal</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 36px 32px 28px;">
                <h2 style="margin: 0 0 16px; color: #0f172a; font-size: 20px; font-weight: 600;">Account Verification</h2>
                <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #475569;">
                  Thank you for registering for the <strong>MatruCare AI Hackathon</strong>. Please use the following 6-digit One-Time Password (OTP) to verify your account and complete your signup.
                </p>

                <!-- OTP Box -->
                <div style="background-color: #f8fafc; border: 2px dashed #0284c7; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0;">
                  <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0284c7; display: inline-block;">${otp}</span>
                  <p style="margin: 8px 0 0; font-size: 12px; color: #64748b; font-weight: 500;">
                    ⏱️ Valid for <strong>${expiryMinutes} minutes</strong> only. Do not share this code.
                  </p>
                </div>

                <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #64748b;">
                  If you did not initiate this request, you can safely ignore this email.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
                <p style="margin: 0 0 6px; font-weight: 600; color: #334155;">MatruCare AI • Full Stack Developer Internship Programme</p>
                <p style="margin: 0; color: #94a3b8;">Contact: <a href="mailto:matrucareai@gmail.com" style="color: #0284c7; text-decoration: none;">matrucareai@gmail.com</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

export const generateRegistrationEmailTemplate = ({
  participantName,
  eventName = 'MatruCare AI National Innovation Hackathon 2026',
  domain,
  projectName,
  teamSize,
  teamMembers = [],
  pptLink,
  prototypeLink,
  demoVideoLink,
}) => {
  const membersHtml =
    teamMembers.length > 0
      ? teamMembers
          .map(
            (m, i) =>
              `<tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px 12px; font-size: 13px; color: #334155;">#${i + 1}</td>
                <td style="padding: 8px 12px; font-size: 13px; font-weight: 600; color: #0f172a;">${m.name}</td>
                <td style="padding: 8px 12px; font-size: 13px; color: #64748b;">${m.email}</td>
              </tr>`
          )
          .join('')
      : `<tr><td colspan="3" style="padding: 10px; text-align: center; font-size: 13px; color: #64748b;">Solo Participation</td></tr>`;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Confirmed - MatruCare AI Hackathon</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 10px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #0b132b 0%, #1c2541 100%); padding: 32px 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 26px; font-weight: 700; color: #ffffff;">MatruCare AI</h1>
                <p style="margin: 6px 0 0; color: #38bdf8; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">Registration Confirmation</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 32px 30px;">
                <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
                  <p style="margin: 0; color: #065f46; font-size: 15px; font-weight: 600;">
                    🎉 Congratulations, ${participantName}!
                  </p>
                  <p style="margin: 4px 0 0; color: #047857; font-size: 13px;">
                    Your registration for <strong>${eventName}</strong> has been successfully submitted and confirmed.
                  </p>
                </div>

                <h3 style="margin: 0 0 12px; color: #0f172a; font-size: 16px; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
                  Project & Domain Details
                </h3>

                <table role="presentation" width="100%" style="margin-bottom: 24px; font-size: 14px;">
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; width: 140px;">Project Name:</td>
                    <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${projectName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">Domain / Track:</td>
                    <td style="padding: 6px 0; font-weight: 600; color: #0284c7;">${domain}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">Team Size:</td>
                    <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${teamSize} ${teamSize === 1 ? 'Member (Solo)' : 'Members'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">Presentation (PPT):</td>
                    <td style="padding: 6px 0;"><a href="${pptLink}" target="_blank" style="color: #0284c7; text-decoration: underline;">View Slide Deck</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">Prototype / Repo:</td>
                    <td style="padding: 6px 0;"><a href="${prototypeLink}" target="_blank" style="color: #0284c7; text-decoration: underline;">View Prototype</a></td>
                  </tr>
                  ${
                    demoVideoLink
                      ? `<tr>
                    <td style="padding: 6px 0; color: #64748b;">Demo Video:</td>
                    <td style="padding: 6px 0;"><a href="${demoVideoLink}" target="_blank" style="color: #0284c7; text-decoration: underline;">Watch Demo Video</a></td>
                  </tr>`
                      : ''
                  }
                </table>

                ${
                  teamSize > 1
                    ? `
                <h3 style="margin: 0 0 12px; color: #0f172a; font-size: 16px; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
                  Registered Team Members
                </h3>
                <table role="presentation" width="100%" style="border-collapse: collapse; margin-bottom: 24px; background-color: #f8fafc; border-radius: 6px; overflow: hidden;">
                  <thead>
                    <tr style="background-color: #e2e8f0; text-align: left;">
                      <th style="padding: 8px 12px; font-size: 12px; color: #475569; font-weight: 700;">#</th>
                      <th style="padding: 8px 12px; font-size: 12px; color: #475569; font-weight: 700;">Name</th>
                      <th style="padding: 8px 12px; font-size: 12px; color: #475569; font-weight: 700;">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${membersHtml}
                  </tbody>
                </table>
                `
                    : ''
                }

                <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 12px 16px; border-radius: 4px; margin-top: 16px;">
                  <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.5;">
                    💡 <strong>Next Steps:</strong> Check your personal dashboard to track evaluation stages, access event guidelines, and receive announcements.
                  </p>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
                <p style="margin: 0 0 6px; font-weight: 600; color: #334155;">MatruCare AI • Full Stack Developer Internship Programme</p>
                <p style="margin: 0; color: #94a3b8;">Official Inquiries: <a href="mailto:matrucareai@gmail.com" style="color: #0284c7; text-decoration: none;">matrucareai@gmail.com</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};
