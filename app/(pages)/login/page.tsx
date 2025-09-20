"use client";

import React from "react";
import axios from "axios";
import { useState } from "react";
import TextInputField from "../../components/ui/TextInputField";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/app/store/userStore";
export default function page() {
  const [loginId, setUserLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { login, setName, setEmail, setRole, setLoginId } = useUserStore();

  const validateForm = () => {
    if (!loginId.trim()) {
      setError("Please enter your login ID");
      return false;
    }
    if (!password.trim()) {
      setError("Please enter your password");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    setError(""); // Clear previous errors

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("/api/login", {
        loginId: loginId,
        password: password,
      });

      console.log("Login successful", response.data);
      // Redirect to dashboard or home page on success
      setEmail(response.data.email);
      setRole("user");
      setLoginId(response.data.loginId);
      login();
      router.push("/dashboard");
    } catch (err: any) {
      console.log("Login error:", err);

      // Handle different types of errors
      if (err.response?.status === 401) {
        setError(
          "Invalid login credentials. Please check your login ID and password.",
        );
      } else if (err.response?.status === 400) {
        setError("Please enter both login ID and password.");
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <>
      <div className="flex flex-col w-full items-center justify-center min-h-screen py-2">
        <div className="flex flex-col items-center w-full px-8">
          <TextInputField
            type="text"
            placeholder="Login ID"
            value={loginId}
            onChange={(e) => setUserLoginId(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <TextInputField
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            className="mb-1"
          />

          {error && (
            <div className="w-full lg:w-1/4 mb-2">
              <p className="text-red-500 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="w-full lg:w-1/4 flex justify-end mb-4">
            <button
              type="button"
              className="font-medium text-xs text-black/60 cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>
          <button
            type="button"
            onClick={handleLogin}
            disabled={isLoading}
            className={`font-medium text-white p-3 rounded-xl lg:w-1/4 w-full cursor-pointer ${
              isLoading
                ? "bg-accent cursor-not-allowed brightness-80"
                : "bg-accent hover:bg-accent/90"
            }`}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>

          <div className="flex items-center w-full lg:w-1/4 my-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <button
            type="button"
            onClick={() => {
              router.push("/signup");
            }}
            className="border border-accent font-medium text-black p-3 rounded-xl lg:w-1/4 w-full cursor-pointer hover:bg-gray-50"
          >
            Create Account
          </button>
        </div>
      </div>
    </>
  );
}
