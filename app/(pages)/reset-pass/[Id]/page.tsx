"use client";

import { motion } from "motion/react";
import React from "react";
import { useState, useEffect } from "react";
import TextInputField from "../../../components/ui/TextInputField";
import { useRouter, useParams } from "next/navigation";
import { GearSix } from "@phosphor-icons/react/dist/ssr/GearSix";

export default function page() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const router = useRouter();
  const params = useParams();
  const resetToken = params.Id;

  // Prevent any redirects - this page should always be accessible
  useEffect(() => {
    // Validate token format but don't redirect if invalid
    if (!resetToken || typeof resetToken !== "string") {
      setError(
        "Invalid reset link. Please check your email for the correct link."
      );
      setTokenValid(false);
    }
  }, [resetToken]);

  const validateForm = () => {
    if (!password.trim()) {
      setError("Please enter a password");
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

    // Confirm password validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSetNewPassword = async () => {
    setError(""); // Clear previous errors
    setSuccess(""); // Clear previous success

    if (!tokenValid) {
      setError("Invalid reset token. Please request a new password reset.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Make API call to reset password
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: resetToken,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(
          "Password reset successfully! You can now log in with your new password."
        );
        // Optional: Redirect to login after a delay, but don't force it
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(data.error || "Failed to reset password. Please try again.");
      }
    } catch (err: any) {
      console.log("Reset password error:", err);
      setError("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSetNewPassword();
    }
  };

  return (
    <>
      <div className="flex flex-col w-full items-center justify-center min-h-screen py-2">
        <div className="flex w-[60vw] h-[60vh] gap-4 bg-white rounded-xl p-4">
          <div className="w-1/2 flex flex-col">
            <div className="text-3xl font-bold mb-4 flex items-center">
              <motion.div
                initial={{ rotateZ: "0deg" }}
                animate={{ rotateZ: "360deg" }}
                transition={{
                  duration: 8,
                  repeatType: "loop",
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <GearSix weight="fill" size={30} />
              </motion.div>
              UTWORKS
            </div>

            <div className="text-lg font-semibold mb-2">Set New Password</div>
            <div className="text-sm text-gray-600 mb-4">
              Please enter your new password below.
            </div>

            <TextInputField
              className="!w-full mb-2"
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <TextInputField
              className="!w-full mb-2"
              type="password"
              placeholder="Confirm New Password"
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
                <p className="text-green-500 text-sm font-medium">{success}</p>
              </div>
            )}

            <div className="w-full mt-auto flex flex-col">
              <button
                type="button"
                onClick={handleSetNewPassword}
                disabled={isLoading}
                className={`font-medium text-white text-2xl p-3 rounded-xl w-full cursor-pointer ${
                  isLoading
                    ? "bg-accent cursor-not-allowed brightness-80"
                    : "bg-accent hover:bg-accent/90"
                }`}
              >
                {isLoading ? "Setting Password..." : "Set New Password"}
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
                className="border mb-2 border-accent font-medium text-2xl text-black p-3 rounded-xl w-full cursor-pointer hover:bg-gray-50"
              >
                Back to Login
              </button>
            </div>
          </div>
          <div className="w-1/2 rounded-xl bg-accent overflow-hidden relative flex items-center justify-center">
            <img
              src="/images/squirrel.jpg"
              className="size-full absolute left-0 top-0 object-cover"
              alt=""
            />
          </div>
        </div>
      </div>
    </>
  );
}
