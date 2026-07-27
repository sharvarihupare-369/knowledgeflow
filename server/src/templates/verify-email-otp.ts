interface VerificationEmailTemplateProps {
    name: string;
    verificationLink: string;
    otp: string;
}

export const verifylinkAndOTPTemplate = ({
    name,
    verificationLink,
    otp,
}: VerificationEmailTemplateProps): string => {
    return `
<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8">
<title>Verify Your Email</title>
</head>

<body style="
margin:0;
padding:0;
background:#f4f6f9;
font-family:Arial, Helvetica, sans-serif;
">

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
">

<tr>
<td>

<h1
style="
margin:0;
color:#2563eb;
">
KnowledgeFlow AI
</h1>

<p style="margin-top:30px;">
Hello <strong>${name}</strong>,
</p>

<p>
Welcome to <strong>KnowledgeFlow AI</strong>.
</p>

<p>
To complete your registration, you can use <strong>either</strong> of the following methods.
</p>

<hr style="margin:30px 0;" />

<h3 style="margin-bottom:10px;">
Option 1 — Verify with one click
</h3>

<div
style="
text-align:center;
margin:25px 0 40px;
">

<a
href="${verificationLink}"
style="
background:#2563eb;
color:#ffffff;
text-decoration:none;
padding:14px 28px;
border-radius:8px;
display:inline-block;
font-weight:bold;
">
Verify Email
</a>

</div>

<hr style="margin:30px 0;" />

<h3 style="margin-bottom:10px;">
Option 2 — Enter this OTP
</h3>

<p>
If you're verifying from another device or prefer using a code, enter the OTP below.
</p>

<div
style="
margin:30px 0;
text-align:center;
">

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
">
${otp}
</span>

</div>

<p>
Both the verification link and OTP will expire in <strong>10 minutes</strong>.
</p>

<p>
Never share your verification code with anyone.
</p>

<hr style="margin:35px 0;" />

<p
style="
font-size:13px;
color:#777;
">
If you didn't request this account, you can safely ignore this email.
</p>

<p
style="
font-size:13px;
color:#777;
">
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