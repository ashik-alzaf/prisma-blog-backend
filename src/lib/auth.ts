import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS,
  },
});
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.APP_PUBLIC_URL!],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        const verificationUrl = `${process.env.APP_USER}/email-verify?token=${token}`;
        await transporter.sendMail({
          from: '"Prisma Blog" <prismablog.@ph.com>',
          to: user.email,
          subject: "Please verify your email",
          html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Verify Your Email Address: ${user.email}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f7f9fc;
      color: #333;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      background: #ffffff;
      margin: auto;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      text-align: center;
    }
    h1 {
      color: #2c7be5;
      margin-bottom: 20px;
    }
    p {
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 30px;
    }
    .btn {
      background-color: #2c7be5;
      color: white;
      padding: 12px 25px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      font-size: 16px;
      display: inline-block;
    }
    .footer {
      font-size: 12px;
      color: #999999;
      margin-top: 40px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Verify Your Email Address ${user.email}</h1>
    <p>Hello,</p>
    <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
    <a href="${verificationUrl}" class="btn">Verify Email ${verificationUrl}</a>
    <p>If you did not create an account, no further action is required.</p>
    <p>Thank you,<br />The Team</p>
    <div class="footer">
      This is an automated message, please do not reply.
    </div>
  </div>
</body>
</html>`,
        });
      } catch (error) {
        throw error;
      }
    },
  },
});
