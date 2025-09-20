"use client";

import React from "react";
import { useState } from "react";
import TextInputField from "../../components/ui/TextInputField";
import { useRouter } from "next/navigation";
import { GearSix } from "@phosphor-icons/react/dist/ssr/GearSix";
import { backend } from "@/app/util/axios";
import { sendOtpEmail } from "@/app/util/sendOtpMail";
import axios from "axios";


export default function page() {
  const [step, setStep] = useState<"email" | "reset">("email");

  // Email step state
  const [email, setEmail] = useState("");

  // Reset step state
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Common state
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateEmailForm = () => {
    if (!email.trim()) {
      setError("Please enter your email address");
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const validateResetForm = () => {
    if (!otp.trim()) {
      setError("Please enter the OTP code");
      return false;
    }
    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return false;
    }
    if (!password.trim()) {
      setError("Please enter a new password");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (!/(?=.*[a-z])/.test(password)) {
      setError("Password must contain at least one lowercase letter");
      return false;
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      setError("Password must contain at least one uppercase letter");
      return false;
    }
    if (!/(?=.*\d)/.test(password)) {
      setError("Password must contain at least one number");
      return false;
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      setError(
        "Password must contain at least one special character (@$!%*?&)"
      );
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleForgotPassword = async () => {
    setError(""); // Clear previous errors
    setSuccess(""); // Clear previous success messages

    if (!validateEmailForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response= await axios.post("http://172.17.54.86:3000/getotp",{
        email:email
      })
      const otp = response.data.otp;
      
      await sendOtpEmail(email,otp);


      // console.log("Forgot password request successful", response.data);
      setSuccess("OTP has been sent to your email address.");

      setStep("reset");
    } catch (err: any) {
      console.log("Forgot password error:", err);

      // Handle different types of errors
      if (err.response?.status === 404) {
        setError("No account found with this email address.");
      } else if (err.response?.status === 400) {
        setError("Please enter a valid email address.");
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError(""); // Clear previous errors
    setSuccess(""); // Clear previous success messages

    if (!validateResetForm()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log("email",email);
      const response = await axios.post("http://172.17.54.86:3000/resetpass", {
        email: email,
        otp: otp,
        newPass: password,
      });
      
      console.log("Password reset successful", response.data);
      setSuccess("Password reset successfully! Redirecting to login...");

      // Redirect to login page after successful reset
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      console.log("Reset password error:", err);

      setError(err.response?.data?.error);
      // Handle different types of errors
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (step === "email") {
        handleForgotPassword();
      } else {
        handleResetPassword();
      }
    }
  };

  const goBackToEmail = () => {
    setStep("email");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
  };

  return (
    <>
      <div className="flex flex-col w-full items-center justify-center min-h-screen py-2">
        <div className="flex w-[800px] gap-4 bg-white rounded-xl p-4">
          <div className="w-1/2 flex flex-col">
            <div className="text-3xl font-bold mb-4 flex gap-2">
              <GearSix weight="fill" size={30} />
              OUTWORKS
            </div>

            {step === "email" ? (
              // Email Step
              <>
                <div className="text-lg font-semibold mb-2">Reset Password</div>
                <div className="text-sm text-gray-600 mb-4">
                  Enter your email address and we'll send you an OTP to reset
                  your password.
                </div>

                <TextInputField
                  className="!w-full mb-2"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                />

                {error && (
                  <div className="w-full mb-2">
                    <p className="text-red-500 text-sm font-medium">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="w-full mb-2">
                    <p className="text-green-500 text-sm font-medium">
                      {success}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                  className={`font-medium text-white p-3 rounded-xl w-full cursor-pointer ${
                    isLoading
                      ? "bg-accent cursor-not-allowed brightness-80"
                      : "bg-accent hover:bg-accent/90"
                  }`}
                >
                  {isLoading ? "Sending OTP..." : "Send OTP"}
                </button>

                <div className="flex items-center w-full my-4">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <span className="px-4 text-gray-500 text-sm">or</span>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    router.push("/login");
                  }}
                  className="border border-accent font-medium text-black p-3 rounded-xl w-full cursor-pointer hover:bg-gray-50"
                >
                  Back to Login
                </button>
              </>
            ) : (
              // Reset Step
              <>
                <div className="text-lg font-semibold mb-2">
                  Enter OTP & New Password
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  Enter the 6-digit OTP sent to <strong>{email}</strong> and
                  your new password.
                </div>

                <TextInputField
                  className="!w-full mb-2"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  onKeyPress={handleKeyPress}
                />

                <TextInputField
                  className="!w-full mb-2"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                />

                <TextInputField
                  className="!w-full mb-2"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                />

                {error && (
                  <div className="w-full mb-2">
                    <p className="text-red-500 text-sm font-medium">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="w-full mb-2">
                    <p className="text-green-500 text-sm font-medium">
                      {success}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={isLoading}
                  className={`font-medium text-white p-3 rounded-xl w-full cursor-pointer ${
                    isLoading
                      ? "bg-accent cursor-not-allowed brightness-80"
                      : "bg-accent hover:bg-accent/90"
                  }`}
                >
                  {isLoading ? "Resetting Password..." : "Reset Password"}
                </button>

                <div className="flex items-center w-full my-4">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <span className="px-4 text-gray-500 text-sm">or</span>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>

                <button
                  type="button"
                  onClick={goBackToEmail}
                  className="border border-accent font-medium text-black p-3 rounded-xl w-full cursor-pointer hover:bg-gray-50"
                >
                  Back to Email Entry
                </button>
              </>
            )}
          </div>
          <div className="w-1/2 rounded-xl bg-accent overflow-hidden relative flex items-center justify-center">
            <img
              src="/images/flower.jpg"
              className="size-full absolute left-0 top-0 object-cover"
              alt=""
            />
          </div>
        </div>
      </div>
    </>
  );
}
