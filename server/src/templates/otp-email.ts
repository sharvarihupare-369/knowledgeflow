interface OtpEmailTemplateProps {
  name: string;
  otp: string;
}

export const otpEmailTemplate = ({ name, otp }: OtpEmailTemplateProps): string => {
  return `
<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8" />
  <title>Your Verification Code</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f4f6f9;
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
KnowledgeFlow AI
</h1>

<p style="margin-top:30px;">
Hello <strong>${name}</strong>,
</p>

<p>
Your email has been verified successfully.
</p>

<p>
Use the verification code below to complete your registration.
</p>

<div
style="
  margin:35px 0;
  text-align:center;
"
>

<span
style="
  display:inline-block;
  font-size:34px;
  font-weight:bold;
  letter-spacing:8px;
  color:#2563eb;
  padding:16px 28px;
  border:2px dashed #2563eb;
  border-radius:10px;
"
>
${otp}
</span>

</div>

<p>
This OTP will expire in
<strong>10 minutes</strong>.
</p>

<p>
Never share this OTP with anyone.
</p>

<hr style="margin:35px 0;" />

<p
style="
  font-size:13px;
  color:#777;
"
>
If you didn't request this verification, please ignore this email.
</p>

<p
style="
  font-size:13px;
  color:#777;
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
