/**
 * HackSphere - Lightweight Spam-Resistant Email Templates
 * Designed for high deliverability with minimal CSS and clean plain-text alternatives.
 * Complies with strict guidelines: Sender is 'HackSphere' <matrucareai@gmail.com>
 */

export const PRODUCTION_CLIENT_URL = 'https://hacksphere-remissg.vercel.app';

/**
 * Resolves safe client portal URL, always falling back to the official production URL
 * if empty or if pointing to localhost/outdated preview domains.
 */
export const resolvePortalUrl = (url) => {
  if (
    !url ||
    typeof url !== 'string' ||
    url.includes('localhost') ||
    url.includes('127.0.0.1') ||
    url.includes('client-seven-gold-99.vercel.app')
  ) {
    return PRODUCTION_CLIENT_URL;
  }
  return url.replace(/\/$/, '');
};

/**
 * Account Verification OTP Template
 */
export const generateOtpEmailTemplate = ({ otp, expiryMinutes = 10 }) => {
  const text = `HackSphere — Hackathon Verification Code

Hello,

Thank you for signing up for the HackSphere National Innovation Hackathon 2026.

Your 6-digit verification code is: ${otp}

This code expires in ${expiryMinutes} minutes. For security, please do not share this code with anyone.

If you did not initiate this request, you can safely ignore this email.

— HackSphere Organizing Committee
matrucareai@gmail.com`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="font-size: 20px; font-weight: 700; color: #0284c7; margin: 0 0 16px 0;">HackSphere</h2>
      <p style="font-size: 15px; line-height: 1.5; color: #334155; margin: 0 0 16px 0;">
        Thank you for signing up for the <strong>HackSphere National Innovation Hackathon 2026</strong>.
      </p>
      <p style="font-size: 15px; line-height: 1.5; color: #334155; margin: 0 0 16px 0;">
        Please enter the verification code below to verify your account:
      </p>
      <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 16px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #0284c7; font-family: monospace;">${otp}</span>
        <p style="font-size: 12px; color: #64748b; margin: 6px 0 0 0;">Valid for ${expiryMinutes} minutes only</p>
      </div>
      <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin: 0 0 20px 0;">
        If you did not request this code, no action is needed.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #94a3b8; margin: 0;">
        HackSphere • Innovation Arena • <a href="mailto:matrucareai@gmail.com" style="color: #0284c7; text-decoration: none;">matrucareai@gmail.com</a>
      </p>
    </div>
  `;

  return { html, text };
};

/**
 * Registration Confirmation Template
 */
export const generateRegistrationEmailTemplate = ({
  participantName,
  eventName = 'HackSphere National Innovation Hackathon 2026',
  domain,
  projectName,
  teamSize,
  teamMembers = [],
  pptLink,
  prototypeLink,
  demoVideoLink,
  portalUrl = PRODUCTION_CLIENT_URL,
}) => {
  const safePortalUrl = resolvePortalUrl(portalUrl);
  const memberTextList =
    teamMembers && teamMembers.length > 0
      ? teamMembers.map((m, i) => `  ${i + 1}. ${m.name} (${m.email})`).join('\n')
      : '  Solo Participation';

  const text = `HackSphere Hackathon — Registration Confirmed!

Hello ${participantName},

Your project registration for the "${eventName}" has been confirmed successfully.

Project Details:
- Project Name: ${projectName}
- Track / Domain: ${domain}
- Team Size: ${teamSize}
- Team Members:
${memberTextList}
- Presentation (PPT): ${pptLink}
- Prototype Link: ${prototypeLink}
${demoVideoLink ? `- Demo Video: ${demoVideoLink}\n` : ''}
You can log in to your dashboard to review evaluation updates and manage your submission:
${safePortalUrl}/dashboard

Best regards,
HackSphere Organizing Committee
matrucareai@gmail.com`;

  const membersHtml =
    teamMembers && teamMembers.length > 0
      ? teamMembers
          .map(
            (m, i) =>
              `<tr>
                <td style="padding: 6px 10px; font-size: 13px; color: #475569;">#${i + 1}</td>
                <td style="padding: 6px 10px; font-size: 13px; font-weight: 600; color: #0f172a;">${m.name}</td>
                <td style="padding: 6px 10px; font-size: 13px; color: #475569;">${m.email}</td>
              </tr>`
          )
          .join('')
      : `<tr><td colspan="3" style="padding: 8px 10px; font-size: 13px; color: #64748b;">Solo Participation</td></tr>`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="font-size: 20px; font-weight: 700; color: #0284c7; margin: 0 0 4px 0;">HackSphere</h2>
      <p style="font-size: 13px; color: #64748b; margin: 0 0 16px 0;">${eventName}</p>
      
      <p style="font-size: 15px; line-height: 1.5; color: #334155; margin: 0 0 14px 0;">
        Hello <strong>${participantName}</strong>,
      </p>
      <p style="font-size: 15px; line-height: 1.5; color: #334155; margin: 0 0 16px 0;">
        Your project registration has been confirmed successfully!
      </p>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; margin-bottom: 18px;">
        <p style="margin: 4px 0; font-size: 14px;"><strong>Project:</strong> ${projectName}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Domain / Track:</strong> <span style="color: #0284c7; font-weight: 600;">${domain}</span></p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Team Size:</strong> ${teamSize} ${teamSize === 1 ? 'member' : 'members'}</p>
      </div>

      <h3 style="font-size: 14px; font-weight: 700; color: #334155; margin: 0 0 8px 0;">Team Roster</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
        <tbody>
          ${membersHtml}
        </tbody>
      </table>

      <p style="font-size: 14px; line-height: 1.5; color: #475569; margin: 0 0 16px 0;">
        View your submission status and event pass on your personal dashboard:
        <br/>
        <a href="${safePortalUrl}/dashboard" style="color: #0284c7; font-weight: 600; text-decoration: none;">Open Dashboard →</a>
      </p>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #94a3b8; margin: 0;">
        HackSphere • Innovation Arena • <a href="mailto:matrucareai@gmail.com" style="color: #0284c7; text-decoration: none;">matrucareai@gmail.com</a>
      </p>
    </div>
  `;

  return { html, text };
};

/**
 * Teammate Invitation / Notification Email Template
 */
export const generateTeammateInviteEmailTemplate = ({
  memberName,
  memberEmail = '',
  teamLeadName,
  teamLeadEmail,
  eventName = 'HackSphere National Innovation Hackathon 2026',
  domain,
  projectName,
  ticketId,
  portalUrl = PRODUCTION_CLIENT_URL,
}) => {
  const safePortalUrl = resolvePortalUrl(portalUrl);
  const inviteUrl = `${safePortalUrl}/team-invite?passId=${ticketId}${memberEmail ? `&email=${encodeURIComponent(memberEmail)}` : ''}`;

  const text = `HackSphere Hackathon — Team Invitation

Hello ${memberName},

${teamLeadName} (${teamLeadEmail}) has registered your team for the "${eventName}"!

Project Details:
- Project Name: ${projectName}
- Track / Domain: ${domain}
- Pass ID: ${ticketId}
- Team Lead: ${teamLeadName} (${teamLeadEmail})

Click the link below to accept your invitation, confirm your spot, and claim your admission pass:
${inviteUrl}

(If you do not have an account yet, you will be prompted to create one with this email address.)

Best regards,
HackSphere Organizing Committee
matrucareai@gmail.com`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="font-size: 20px; font-weight: 700; color: #0284c7; margin: 0 0 4px 0;">HackSphere</h2>
      <p style="font-size: 13px; color: #64748b; margin: 0 0 16px 0;">Teammate Invitation Notice</p>

      <p style="font-size: 15px; line-height: 1.5; color: #334155; margin: 0 0 14px 0;">
        Hello <strong>${memberName}</strong>,
      </p>
      <p style="font-size: 15px; line-height: 1.5; color: #334155; margin: 0 0 16px 0;">
        <strong>${teamLeadName}</strong> (<a href="mailto:${teamLeadEmail}" style="color: #0284c7; text-decoration: none;">${teamLeadEmail}</a>) has registered your project team for the <strong>${eventName}</strong>.
      </p>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; margin-bottom: 20px;">
        <p style="margin: 4px 0; font-size: 14px;"><strong>Project:</strong> ${projectName}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Track:</strong> <span style="color: #0284c7; font-weight: 600;">${domain}</span></p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Pass ID:</strong> <span style="font-family: monospace; font-weight: 700; color: #0284c7;">${ticketId}</span></p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Team Lead:</strong> ${teamLeadName} (${teamLeadEmail})</p>
      </div>

      <p style="font-size: 14px; line-height: 1.5; color: #475569; margin: 0 0 16px 0;">
        Please click below to review and accept your spot on the team:
      </p>

      <div style="margin: 20px 0;">
        <a href="${inviteUrl}" style="background-color: #0284c7; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block;">
          Accept Team Invitation & Claim Pass →
        </a>
      </div>

      <p style="font-size: 12px; color: #64748b; margin: 12px 0 0 0;">
        Or paste this link in your browser: <br/>
        <a href="${inviteUrl}" style="color: #0284c7; word-break: break-all;">${inviteUrl}</a>
      </p>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #94a3b8; margin: 0;">
        HackSphere • Innovation Arena • <a href="mailto:matrucareai@gmail.com" style="color: #0284c7; text-decoration: none;">matrucareai@gmail.com</a>
      </p>
    </div>
  `;

  return { html, text };
};

/**
 * Project Status Milestone Notification Template (Spam-Proof)
 */
export const generateStatusUpdateEmailTemplate = ({
  participantName,
  projectName,
  status,
  domain,
  ticketId,
  portalUrl = PRODUCTION_CLIENT_URL,
}) => {
  const safePortalUrl = resolvePortalUrl(portalUrl);
  let statusMessage = '';
  let badgeColor = '#0284c7';

  switch (status) {
    case 'Under Review':
      statusMessage =
        'Your project submission is currently undergoing formal technical review by the HackSphere judging committee.';
      badgeColor = '#0284c7';
      break;
    case 'Shortlisted':
      statusMessage =
        '🎉 Congratulations! Your project has demonstrated exceptional innovation and has been officially SHORTLISTED for Round 2 mentorship and evaluation!';
      badgeColor = '#10b981';
      break;
    case 'Finalist':
      statusMessage =
        '🏆 Outstanding Achievement! Your team has been selected as a NATIONAL FINALIST for the HackSphere National Innovation Grand Finale 2026!';
      badgeColor = '#8b5cf6';
      break;
    case 'Rejected':
      statusMessage =
        'Thank you for your participation in the HackSphere Hackathon. While your project was not selected for advancement, we commend your dedication and technical initiative.';
      badgeColor = '#64748b';
      break;
    default:
      statusMessage = `Your project status has been updated to "${status}".`;
  }

  const text = `HackSphere Hackathon — Project Status Update

Hello ${participantName},

This is an official milestone notification regarding your hackathon project "${projectName}".

Status Milestone: ${status.toUpperCase()}
Project Name: ${projectName}
Track / Domain: ${domain}
Pass ID: ${ticketId}

${statusMessage}

You can log in to your dashboard to review evaluation updates:
${safePortalUrl}/dashboard

Best regards,
HackSphere Organizing Committee
matrucareai@gmail.com`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="font-size: 20px; font-weight: 700; color: #0284c7; margin: 0 0 4px 0;">HackSphere</h2>
      <p style="font-size: 13px; color: #64748b; margin: 0 0 16px 0;">Hackathon Evaluation Status Notice</p>

      <p style="font-size: 15px; line-height: 1.5; color: #334155; margin: 0 0 14px 0;">
        Hello <strong>${participantName}</strong>,
      </p>
      <p style="font-size: 15px; line-height: 1.5; color: #334155; margin: 0 0 16px 0;">
        This is an official milestone notification regarding your project team:
      </p>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
        <div style="margin-bottom: 12px;">
          <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; display: block; margin-bottom: 4px;">Updated Status</span>
          <span style="background-color: ${badgeColor}; color: #ffffff; padding: 4px 12px; border-radius: 4px; font-weight: 700; font-size: 13px; display: inline-block;">
            ${status.toUpperCase()}
          </span>
        </div>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Project:</strong> ${projectName}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Domain:</strong> <span style="color: #0284c7; font-weight: 600;">${domain}</span></p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Pass ID:</strong> <span style="font-family: monospace; font-weight: 700; color: #0284c7;">${ticketId}</span></p>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 20px 0;">
        ${statusMessage}
      </p>

      <div style="margin: 20px 0;">
        <a href="${safePortalUrl}/dashboard" style="background-color: #0284c7; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block;">
          Open Dashboard to View Details →
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #94a3b8; margin: 0;">
        HackSphere • Evaluation Committee • <a href="mailto:matrucareai@gmail.com" style="color: #0284c7; text-decoration: none;">matrucareai@gmail.com</a>
      </p>
    </div>
  `;

  return { html, text };
};

/**
 * Staff Role Provisioning & Onboarding Email Template
 */
export const generateStaffOnboardingEmailTemplate = ({
  fullName,
  email,
  role,
  startingPassword,
  portalUrl = PRODUCTION_CLIENT_URL,
}) => {
  const safePortalUrl = resolvePortalUrl(portalUrl);
  // Direct Login Link is always guaranteed to point to production
  const directLoginUrl = `${PRODUCTION_CLIENT_URL}/login`;

  const roleDisplayNames = {
    evaluator: 'Official Evaluator & Judge',
    volunteer: 'Gate Attendance Volunteer',
    admin: 'Co-Administrator',
  };
  const roleName = roleDisplayNames[role] || 'Event Staff';

  const roleUrls = {
    evaluator: `${safePortalUrl}/judge`,
    volunteer: `${safePortalUrl}/volunteer`,
    admin: `${safePortalUrl}/admin`,
  };
  const destinationUrl = roleUrls[role] || directLoginUrl;

  const text = `
HackSphere 2026 — Official Staff Appointment

Hello ${fullName},

You have been officially provisioned as a "${roleName}" for HackSphere National Innovation Hackathon 2026.

Your Official Staff Credentials:
- Assigned Role: ${roleName}
- Login Email: ${email}
- Starting Password: ${startingPassword}
- Direct Login Link: ${directLoginUrl}
- Staff Console Link: ${destinationUrl}

For security, please log in and change your starting password from your profile settings.

Authorized by HackSphere Admin Team
matrucareai@gmail.com
  `.trim();

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; color: #1e293b; background-color: #ffffff;">
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 22px; font-weight: 800; color: #0284c7; margin: 0 0 4px 0; letter-spacing: -0.5px;">HackSphere 2026</h2>
        <p style="font-size: 13px; color: #64748b; margin: 0;">Official Staff Provisioning &amp; Access Authorization</p>
      </div>

      <p style="font-size: 15px; line-height: 1.5; color: #334155; margin: 0 0 14px 0;">
        Hello <strong>${fullName}</strong>,
      </p>
      <p style="font-size: 15px; line-height: 1.5; color: #334155; margin: 0 0 16px 0;">
        You have been officially appointed and authorized as a <strong>${roleName}</strong> for the HackSphere National Innovation Hackathon 2026.
      </p>

      <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
        <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #0284c7; letter-spacing: 0.5px; display: block; margin-bottom: 8px;">Authorized Credentials</span>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Assigned Role:</strong> <span style="background-color: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-weight: 600;">${roleName}</span></p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Login Email:</strong> <span style="font-family: monospace; font-weight: 600; color: #334155;">${email}</span></p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Starting Password:</strong> <span style="font-family: monospace; font-weight: 700; color: #0284c7; background-color: #f1f5f9; padding: 3px 8px; border-radius: 4px;">${startingPassword}</span></p>
      </div>

      <p style="font-size: 14px; line-height: 1.5; color: #475569; margin: 0 0 20px 0;">
        🔒 <em>Security Notice:</em> Please sign in at the official portal and update your starting password to a personal password in your profile.
      </p>

      <div style="margin: 24px 0;">
        <a href="${destinationUrl}" style="background-color: #0284c7; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 700; display: inline-block; box-shadow: 0 2px 4px rgba(2, 132, 199, 0.2);">
          Launch ${roleName} Console →
        </a>
      </div>

      <p style="font-size: 12px; color: #64748b; margin: 16px 0 0 0;">
        Direct Login Link: <br/>
        <a href="${directLoginUrl}" style="color: #0284c7; word-break: break-all;">${directLoginUrl}</a>
      </p>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
      <p style="font-size: 12px; color: #94a3b8; margin: 0;">
        HackSphere Governance Committee • Authorized via <a href="mailto:matrucareai@gmail.com" style="color: #0284c7; text-decoration: none;">matrucareai@gmail.com</a>
      </p>
    </div>
  `;

  return { html, text };
};

/**
 * Password Reset OTP Template
 */
export const generatePasswordResetOtpTemplate = ({ fullName = 'Participant', otp, expiryMinutes = 10 }) => {
  const text = `HackSphere — Password Reset Verification Code

Hello ${fullName},

We received a request to reset the password for your HackSphere 2026 account.

Your 6-digit password reset OTP is: ${otp}

This code expires in ${expiryMinutes} minutes. Do not share this code with anyone.
If you did not request a password reset, you can safely ignore this email — your password will remain unchanged.

— HackSphere Security Team
matrucareai@gmail.com`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="font-size: 20px; font-weight: 700; color: #0284c7; margin: 0 0 16px 0;">HackSphere • Password Reset</h2>
      <p style="font-size: 15px; line-height: 1.5; color: #334155; margin: 0 0 14px 0;">
        Hello <strong>${fullName}</strong>,
      </p>
      <p style="font-size: 15px; line-height: 1.5; color: #334155; margin: 0 0 16px 0;">
        Use the 6-digit verification code below to reset your password for the <strong>HackSphere 2026 Portal</strong>:
      </p>
      <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 16px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #0284c7; font-family: monospace;">${otp}</span>
        <p style="font-size: 12px; color: #64748b; margin: 6px 0 0 0;">Valid for ${expiryMinutes} minutes only</p>
      </div>
      <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin: 0 0 20px 0;">
        If you did not request a password reset, no action is needed — your existing credentials stay secure.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #94a3b8; margin: 0;">
        HackSphere Security • <a href="mailto:matrucareai@gmail.com" style="color: #0284c7; text-decoration: none;">matrucareai@gmail.com</a>
      </p>
    </div>
  `;

  return { html, text };
};
