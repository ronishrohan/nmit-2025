"use client";

import React from "react";
import { useState } from "react";
import axios from "axios";
import TextInputField from "../../components/ui/TextInputField";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/app/store/userStore";
export default function page() {
  const [loginId, setUserLoginId] = useState("");
  const [email, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, setEmail, setRole, setLoginId, setName } = useUserStore();
  const validateForm = () => {
    // Login ID validation
    if (!loginId.trim()) {
      setError("Please enter a login ID");
      return false;
    }
    if (loginId.length < 3) {
      setError("Login ID must be at least 3 characters long");
      return false;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(loginId)) {
      setError(
        "Login ID can only contain letters, numbers, underscores, and hyphens",
      );
      return false;
    }

    // Email validation
    if (!email.trim()) {
      setError("Please enter an email address");
      return false;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Password validation
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
        "Password must contain at least one special character (@$!%*?&)",
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("/api/signup", {
        loginId: loginId.trim(),
        email: email.trim(),
        password: password,
      });

      console.log("Signup successful", response.data);
      // Redirect to login page on success
      setEmail(response.data.user.email);
      setLoginId(response.data.user.loginId);
      setName(response.data.user.fullName);
      setRole("user");
      login();
      router.push("/");
    } catch (err: any) {
      console.log("Signup error:", err);

      // Handle different types of errors
      if (err.response?.status === 400) {
        setError(
          err.response.data?.error || "Please check your input and try again.",
        );
      } else if (err.response?.status === 409) {
        setError("An account with this login ID or email already exists.");
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Signup failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSignup(e as any);
    }
  };

  return (
    <>
      <div className="flex flex-col w-full items-center justify-center min-h-screen py-2">
        <form
          onSubmit={handleSignup}
          className="flex flex-col items-center w-full px-8"
        >
          <TextInputField
            type="text"
            placeholder="Enter login id"
            value={loginId}
            onChange={(e) => setUserLoginId(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <TextInputField
            type="email"
            placeholder="Enter email id"
            value={email}
            onChange={(e) => setUserEmail(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <TextInputField
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <TextInputField
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyPress={handleKeyPress}
          />

          {/* Password Requirements */}
          {/* <div className="w-full lg:w-1/4 mb-4">
            <p className="text-xs text-gray-600 mb-2">Password requirements:</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li className={`${password.length >= 8 ? 'text-green-600' : ''}`}>
                • At least 8 characters long
              </li>
              <li className={`${/(?=.*[a-z])/.test(password) ? 'text-green-600' : ''}`}>
                • One lowercase letter
              </li>
              <li className={`${/(?=.*[A-Z])/.test(password) ? 'text-green-600' : ''}`}>
                • One uppercase letter
              </li>
              <li className={`${/(?=.*\d)/.test(password) ? 'text-green-600' : ''}`}>
                • One number
              </li>
              <li className={`${/(?=.*[@$!%*?&])/.test(password) ? 'text-green-600' : ''}`}>
                • One special character (@$!%*?&)
              </li>
            </ul>
          </div> */}

          {error && (
            <div className="w-full lg:w-1/4 mb-4">
              <p className="text-red-500 text-sm font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`font-medium text-white p-3 rounded-xl lg:w-1/4 w-full cursor-pointer ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-accent hover:brightness-90"
            }`}
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>

          <div className="flex items-center w-full lg:w-1/4 my-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <button
            type="button"
            onClick={() => {
              router.push("/login");
            }}
            className="border border-accent font-medium text-black p-3 rounded-xl lg:w-1/4 w-full cursor-pointer hover:bg-gray-50"
          >
            Login
          </button>
        </form>
      </div>
    </>
  );
}
