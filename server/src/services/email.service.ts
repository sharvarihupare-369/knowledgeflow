import { env } from '../config/env.js';
import { transporter } from '../config/mail.js';
import { otpEmailTemplate } from '../templates/otp-email.js';
import { verificationEmailTemplate } from '../templates/verification-email.js';
import { verifylinkAndOTPTemplate } from '../templates/verify-email-otp.js';
import type { SendOtpAndVerifyLinkEmailPayload, SendOtpEmailPayload, sendVerificationEmailInterface } from '../types/auth.js';

export const sendVerificationEmail = async ({ email, name, verificationLink }: sendVerificationEmailInterface) => {
  const html = verificationEmailTemplate({ name, verificationLink });
  const info = await transporter.sendMail({
    from: env.EMAIL_USER,
    to: email,
    subject: 'Verify your email',
    html,
  });
  return info;
};

export const sendOtpEmail = async ({ email, name, otp }: SendOtpEmailPayload) => {
  const html = otpEmailTemplate({ name, otp });
  const info = await transporter.sendMail({
    from: env.EMAIL_USER,
    to: email,
    subject: 'Your Verification Code',
    html,
  });
  return info;
};

// sendPasswordResetEmail(...)

export const sendVerificationEmailAndOTP = async ({ email, name, verificationLink, otp }: SendOtpAndVerifyLinkEmailPayload) => {
  const html = verifylinkAndOTPTemplate({ name, verificationLink, otp });
  const info = await transporter.sendMail({
    from: env.EMAIL_USER,
    to: email,
    subject: 'Verify your email',
    html,
  });
  return info;
};

export const sendApprovalEmail = async ({ email, name }: { email: string; name: string }) => {
  const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Account Approved</h2>
            <p>Hi ${name},</p>
            <p>Your request to join the organisation on KnowledgeFlow AI has been approved by the administrator!</p>
            <p>You can now log in to your account and start using the platform.</p>
            <p>Best regards,<br>The KnowledgeFlow AI Team</p>
        </div>
    `;
  const info = await transporter.sendMail({
    from: env.EMAIL_USER,
    to: email,
    subject: 'Your KnowledgeFlow AI Account has been Approved',
    html,
  });
  return info;
};

export const sendRejectionEmail = async ({ email, name }: { email: string; name: string }) => {
  const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Account Request Rejected</h2>
            <p>Hi ${name},</p>
            <p>Unfortunately, your request to join the organisation on KnowledgeFlow AI has been rejected by the administrator.</p>
            <p>If you believe this is a mistake, please contact your organisation administrator directly.</p>
            <p>Best regards,<br>The KnowledgeFlow AI Team</p>
        </div>
    `;
  const info = await transporter.sendMail({
    from: env.EMAIL_USER,
    to: email,
    subject: 'KnowledgeFlow AI Account Request Status',
    html,
  });
  return info;
};

export const sendInvitationEmail = async ({
  email,
  token,
  inviterName,
  orgName,
}: {
  email: string;
  token: string;
  inviterName: string;
  orgName: string;
}) => {
  // Determine base URL (e.g. http://localhost:3000 for local dev)
  const baseUrl = env.FRONTEND_URL || 'http://localhost:3000';
  const inviteLink = `${baseUrl}/accept-invite?token=${token}`;

  const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
            <h2>You've been invited to join ${orgName} on KnowledgeFlow AI!</h2>
            <p>Hi there,</p>
            <p><strong>${inviterName}</strong> has invited you to join their organisation on KnowledgeFlow AI.</p>
            <p>KnowledgeFlow AI is a platform for your team to easily manage, search, and chat with your documents using advanced AI.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Accept Invitation</a>
            </div>
            <p style="color: #666; font-size: 14px;">If the button above doesn't work, you can copy and paste this link into your browser:</p>
            <p style="color: #666; font-size: 14px; word-break: break-all;">${inviteLink}</p>
            <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 30px 0;" />
            <p style="color: #999; font-size: 12px;">This invitation will expire in 7 days.</p>
        </div>
    `;
  const info = await transporter.sendMail({
    from: env.EMAIL_USER,
    to: email,
    subject: `Invitation to join ${orgName} on KnowledgeFlow AI`,
    html,
  });
  return info;
};
