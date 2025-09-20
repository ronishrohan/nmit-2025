"use server"

import nodemailer from "nodemailer";
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

export async function sendOtpEmail(toEmail: string, otp: number) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'Outworks <no-reply@outworks.com>',
    to: toEmail,
    subject: "Your OTP for Password Reset",
    html: `<p>Your OTP for password reset is: <b>${otp}</b></p><p>This code will expire in 10 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
}
