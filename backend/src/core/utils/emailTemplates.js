const BASE_STYLES = `
  body { margin: 0; padding: 0; background: #0f1117; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .wrapper { max-width: 560px; margin: 40px auto; background: #1a1d27; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
  .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); padding: 40px 48px 36px; text-align: center; }
  .header h1 { margin: 0; font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
  .header p  { margin: 8px 0 0; font-size: 14px; color: rgba(255,255,255,0.75); }
  .body   { padding: 40px 48px; color: #c9cce0; line-height: 1.6; }
  .body p { margin: 0 0 16px; font-size: 15px; }
  .body .greeting { font-size: 18px; font-weight: 600; color: #e8eaf6; }
  .cta-wrap { text-align: center; margin: 32px 0; }
  .cta { display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #6366f1, #a855f7); color: #fff !important; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 10px; letter-spacing: 0.2px; box-shadow: 0 4px 20px rgba(99,102,241,0.4); }
  .divider { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 28px 0; }
  .meta  { font-size: 12px; color: #6b7280; text-align: center; }
  .meta a { color: #818cf8; word-break: break-all; }
  .footer { background: #13151e; padding: 20px 48px; text-align: center; font-size: 12px; color: #4b5563; }
  .badge  { display: inline-block; background: rgba(99,102,241,0.15); color: #818cf8; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 100px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; }
`;

function htmlShell(content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Ecomm</h1>
      <p>Your premium shopping destination</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Ecomm. All rights reserved.<br/>
      This is an automated message – please do not reply.
    </div>
  </div>
</body>
</html>`;
}

export function verificationEmail(name, verifyUrl) {
  const subject = 'Verify your Ecomm email address';

  const html = htmlShell(`
    <span class="badge">Action Required</span>
    <p class="greeting">Hi ${escHtml(name)},</p>
    <p>
      Thanks for signing up! Before you can start shopping, we need to confirm
      that this email address belongs to you.
    </p>
    <p>Click the button below to verify your email. This link expires in <strong>24 hours</strong>.</p>
    <div class="cta-wrap">
      <a class="cta" href="${verifyUrl}" target="_blank" rel="noopener noreferrer">
        Verify Email Address
      </a>
    </div>
    <hr class="divider" />
    <p class="meta">
      If the button doesn't work, copy and paste this link into your browser:<br/>
      <a href="${verifyUrl}">${verifyUrl}</a>
    </p>
    <p class="meta" style="margin-top:16px;">
      If you didn't create an account, you can safely ignore this email.
    </p>
  `);

  const text = `Hi ${name},

Thanks for signing up with Ecomm!

Please verify your email address by visiting the link below (expires in 24 hours):

${verifyUrl}

If you didn't create an account, ignore this email.

— The Ecomm Team`;

  return { subject, html, text };
}

export function welcomeEmail(name) {
  const subject = "You're verified! Welcome to Ecomm 🎉";

  const html = htmlShell(`
    <span class="badge">Welcome</span>
    <p class="greeting">You're all set, ${escHtml(name)}! 🎉</p>
    <p>
      Your email address has been successfully verified.
      Your account is now fully active and ready to use.
    </p>
    <p>Start exploring our catalogue and enjoy seamless, secure shopping.</p>
    <div class="cta-wrap">
      <a class="cta" href="${process.env.CLIENT_URL || '#'}/shop" target="_blank" rel="noopener noreferrer">
        Start Shopping
      </a>
    </div>
    <hr class="divider" />
    <p class="meta">Have questions? Contact our support team any time.</p>
  `);

  const text = `Hi ${name},

Your email address has been verified! Your Ecomm account is now fully active.

Head to the shop to get started.

— The Ecomm Team`;

  return { subject, html, text };
}

export function adminPendingApprovalEmail(adminEmail, { name, email, userId }) {
  const subject = `[Ecomm Admin] New user pending approval: ${email}`;

  const html = htmlShell(`
    <span class="badge">Admin Action</span>
    <p class="greeting">New user pending approval</p>
    <p>A new user has verified their email and is awaiting admin approval.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr>
        <td style="padding:8px 0;color:#9ca3af;font-size:13px;width:100px;">Name</td>
        <td style="padding:8px 0;color:#e8eaf6;font-size:13px;font-weight:600;">${escHtml(name)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#9ca3af;font-size:13px;">Email</td>
        <td style="padding:8px 0;color:#e8eaf6;font-size:13px;">${escHtml(email)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#9ca3af;font-size:13px;">User ID</td>
        <td style="padding:8px 0;color:#e8eaf6;font-size:13px;font-family:monospace;">${escHtml(userId)}</td>
      </tr>
    </table>
    <p>Use the Admin API to approve this account:</p>
    <pre style="background:#0f1117;border-radius:8px;padding:16px;color:#a5b4fc;font-size:12px;overflow-x:auto;">PATCH /api/auth/admin/approve/${userId}</pre>
  `);

  const text = `[Ecomm Admin] New user pending approval

Name    : ${name}
Email   : ${email}
User ID : ${userId}

Approve via: PATCH /api/auth/admin/approve/${userId}`;

  return { subject, html, text };
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
