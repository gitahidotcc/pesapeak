import { createTransport } from "nodemailer";
import serverConfig from "@pesapeak/shared/config";

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string,
) {
  if (!serverConfig.email.smtp) {
    throw new Error("SMTP is not configured");
  }

  const transporter = createTransport({
    host: serverConfig.email.smtp.host,
    port: serverConfig.email.smtp.port,
    secure: serverConfig.email.smtp.secure,
    auth:
      serverConfig.email.smtp.user && serverConfig.email.smtp.password
        ? {
            user: serverConfig.email.smtp.user,
            pass: serverConfig.email.smtp.password,
          }
        : undefined,
  });

  const verificationUrl = `${serverConfig.publicUrl}/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

  const mailOptions = {
    from: serverConfig.email.smtp.from,
    to: email,
    subject: "Verify your email address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Pesapeak, ${name}!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <p>
          <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </p>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account with us, please ignore this email.</p>
      </div>
    `,
    text: `
Welcome to Pesapeak, ${name}!

Please verify your email address by visiting this link:
${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account with us, please ignore this email.
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendInviteEmail(
  email: string,
  token: string,
  inviterName: string,
) {
  if (!serverConfig.email.smtp) {
    throw new Error("SMTP is not configured");
  }

  const transporter = createTransport({
    host: serverConfig.email.smtp.host,
    port: serverConfig.email.smtp.port,
    secure: serverConfig.email.smtp.secure,
    auth:
      serverConfig.email.smtp.user && serverConfig.email.smtp.password
        ? {
            user: serverConfig.email.smtp.user,
            pass: serverConfig.email.smtp.password,
          }
        : undefined,
  });

  const inviteUrl = `${serverConfig.publicUrl}/invite/${encodeURIComponent(token)}`;

  const mailOptions = {
    from: serverConfig.email.smtp.from,
    to: email,
    subject: "You've been invited to join Pesapeak",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You've been invited to join Pesapeak!</h2>
        <p>${inviterName} has invited you to join Pesapeak, the bookmark everything app.</p>
        <p>Click the link below to accept your invitation and create your account:</p>
        <p>
          <a href="${inviteUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Accept Invitation
          </a>
        </p>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p><a href="${inviteUrl}">${inviteUrl}</a></p>

        <p>If you weren't expecting this invitation, you can safely ignore this email.</p>
      </div>
    `,
    text: `
You've been invited to join Pesapeak!

${inviterName} has invited you to join Pesapeak, a powerful bookmarking and content organization platform.

Accept your invitation by visiting this link:
${inviteUrl}



If you weren't expecting this invitation, you can safely ignore this email.
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string,
  resetUrl?: string,
) {
  if (!serverConfig.email.smtp) {
    throw new Error("SMTP is not configured");
  }

  const transporter = createTransport({
    host: serverConfig.email.smtp.host,
    port: serverConfig.email.smtp.port,
    secure: serverConfig.email.smtp.secure,
    auth:
      serverConfig.email.smtp.user && serverConfig.email.smtp.password
        ? {
            user: serverConfig.email.smtp.user,
            pass: serverConfig.email.smtp.password,
          }
        : undefined,
  });

  // Verify connection before sending
  try {
    await transporter.verify();
  } catch (error) {
    console.error("SMTP connection verification failed:", error);
    throw new Error(`SMTP connection failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Use provided URL from Better Auth, or construct our own if not provided
  const url = resetUrl || `${serverConfig.publicUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;

  const mailOptions = {
    from: serverConfig.email.smtp.from,
    to: email,
    subject: "Reset your password",
    html: `
      <div style="font-family: 'Geist', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 10px; color: #0b0b0b;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="margin-bottom: 24px;">
            <img src="https://www.pesapeak.app/icons/logo-icon.svg" alt="Pesapeak Logo" style="width: 48px; height: 48px; display: block; margin: 0 auto;" />
          </div>
          <h1 style="color: #0b0b0b; font-size: 24px; font-weight: 700; margin: 0; margin-bottom: 8px;">Password Reset Request</h1>
          <p style="color: #686767; font-size: 16px; margin: 0;">Hi ${name},</p>
        </div>

        <div style="background-color: #ece8e4; padding: 24px; border-radius: 10px; margin: 24px 0;">
          <p style="color: #353434; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
            You requested to reset your password for your Pesapeak account. Click the button below to reset your password:
          </p>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${url}" style="background-color: #fa5207; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 10px; display: inline-block; font-weight: 600; font-size: 16px; transition: all 0.2s ease;">
              Reset Password
            </a>
          </div>

          <p style="color: #686767; font-size: 14px; line-height: 1.5; margin: 16px 0 0 0;">
            If the button doesn't work, you can copy and paste this link into your browser:
          </p>
          <p style="word-break: break-all; margin: 8px 0;">
            <a href="${url}" style="color: #fa5207; text-decoration: none; font-size: 14px;">${url}</a>
          </p>
        </div>

        <div style="border-top: 1px solid #e5e5e5; padding-top: 24px; margin-top: 32px;">
          <p style="color: #686767; font-size: 14px; line-height: 1.5; margin: 8px 0;">
            <strong style="color: #353434;">Important:</strong> This link will expire in 1 hour.
          </p>
          <p style="color: #686767; font-size: 14px; line-height: 1.5; margin: 8px 0;">
            If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
          </p>
        </div>

        <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e5e5;">
          <p style="color: #84848c; font-size: 12px; margin: 0;">
            The Pesapeak Team
          </p>
        </div>
      </div>
    `,
    text: `
Hi ${name},

You requested to reset your password for your Pesapeak account. Click the link below to reset your password:

${url}

Important: This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

The Pesapeak Team
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent successfully:", {
      messageId: info.messageId,
      to: email,
      accepted: info.accepted,
      rejected: info.rejected,
    });
    return info;
  } catch (error) {
    console.error("Failed to send password reset email:", {
      error,
      to: email,
      smtpHost: serverConfig.email.smtp.host,
      smtpPort: serverConfig.email.smtp.port,
    });
    throw error;
  }
}
