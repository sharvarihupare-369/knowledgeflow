import type { VerificationEmailTemplateProps } from "../types/auth.js";
import { env } from "../config/env.js";

export const verificationEmailTemplate = ({
    name,
    verificationLink,
}: VerificationEmailTemplateProps): string => {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Verify Your Email</title>
      </head>

      <body
        style="
          margin:0;
          padding:0;
          background:#f5f5f5;
          font-family:Arial, Helvetica, sans-serif;
        "
      >

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="padding:40px 0;"
        >
          <tr>
            <td align="center">

              <table
                width="600"
                cellpadding="0"
                cellspacing="0"
                style="
                  background:#ffffff;
                  border-radius:12px;
                  padding:40px;
                "
              >

                <tr>
                  <td>

                    <h1
                      style="
                        margin:0;
                        color:#2563eb;
                      "
                    >
                      ${env.APP_NAME}
                    </h1>

                    <p style="margin-top:30px;">
                      Hi <strong>${name}</strong>,
                    </p>

                    <p>
                      Thanks for creating your KnowledgeFlow AI account.
                    </p>

                    <p>
                      Please verify your email address by clicking the button
                      below.
                    </p>

                    <div
                      style="
                        text-align:center;
                        margin:40px 0;
                      "
                    >
                      <a
                        href="${verificationLink}"
                        style="
                          background:#2563eb;
                          color:white;
                          text-decoration:none;
                          padding:14px 28px;
                          border-radius:8px;
                          display:inline-block;
                          font-weight:bold;
                        "
                      >
                        Verify Email
                      </a>
                    </div>

                    <p>
                      This verification link will expire in
                      <strong>15 minutes</strong>.
                    </p>

                    <p>
                      If you didn't create this account, you can safely ignore
                      this email.
                    </p>

                    <hr />

                    <p
                      style="
                        color:#777;
                        font-size:13px;
                      "
                    >
                      © ${new Date().getFullYear()} KnowledgeFlow AI
                    </p>

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