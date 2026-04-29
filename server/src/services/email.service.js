const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!env.smtpUser || !env.smtpPass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.smtpHost || 'smtp.gmail.com',
    port: env.smtpPort || 587,
    secure: false,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    }
  });

  return transporter;
};

const sendResetCode = async (email, code) => {
  const transport = getTransporter();

  if (!transport) {
    console.log(`[PASSWORD RESET] Codigo para ${email}: ${code} (SMTP nao configurado)`);
    return;
  }

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperar Senha - Lions Business Network</title>
</head>
<body style="margin:0;padding:0;background-color:#070a08;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#070a08;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:linear-gradient(145deg,rgba(14,24,19,0.98),rgba(10,16,13,0.98));border:1px solid rgba(0,255,102,0.18);border-radius:20px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:36px 36px 24px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06);">
              <div style="font-family:'Segoe UI',Arial,sans-serif;font-size:10px;font-weight:800;letter-spacing:3px;color:rgba(0,255,102,0.7);text-transform:uppercase;margin-bottom:8px;">LIONS</div>
              <div style="font-family:'Segoe UI',Arial,sans-serif;font-size:8px;font-weight:600;letter-spacing:2px;color:rgba(247,251,248,0.45);text-transform:uppercase;">BUSINESS NETWORK</div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 36px 28px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:1px;color:rgba(247,251,248,0.55);text-transform:uppercase;">Seu código de verificação</p>
              <div style="margin:24px 0;display:inline-block;background:rgba(0,255,102,0.08);border:1px solid rgba(0,255,102,0.28);border-radius:16px;padding:20px 40px;">
                <span style="font-size:44px;font-weight:800;letter-spacing:12px;color:#00ff66;font-family:'Courier New',monospace;">${code}</span>
              </div>
              <p style="margin:20px 0 0;font-size:14px;color:rgba(247,251,248,0.6);line-height:1.6;">
                Use este código para redefinir sua senha.<br>
                <strong style="color:rgba(247,251,248,0.85);">Expira em 5 minutos.</strong>
              </p>
              <p style="margin:16px 0 0;font-size:12px;color:rgba(247,251,248,0.35);line-height:1.6;">
                Se você não solicitou a redefinição de senha,<br>ignore este email com segurança.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 36px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;font-size:11px;color:rgba(247,251,248,0.28);">Lions Business Network &copy; ${new Date().getFullYear()}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  await transport.sendMail({
    from: `"Lions Business Network" <${env.smtpUser}>`,
    to: email,
    subject: `${code} - Seu código de verificação | Lions Business Network`,
    html
  });
};

module.exports = { sendResetCode };
