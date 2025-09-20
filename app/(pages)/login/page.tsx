"use client";

import React from "react";
import axios from "axios";
import { useState } from "react";
import TextInputField from "../../components/ui/TextInputField";

export default function page() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post("/api/login", {
        loginId: loginId,
        password: password,
      });

      console.log("Login successful", response.data);
    } catch (err: any) {
      console.log("Login error:", err.message);
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
            onChange={(e) => setLoginId(e.target.value)}
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
            className="bg-accent font-medium text-white p-3 rounded-xl lg:w-1/4 w-full cursor-pointer"
          >
            Login
          </button>

          <div className="flex items-center w-full lg:w-1/4 my-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <button
            type="button"
            className="border border-accent font-medium text-black p-3 rounded-xl lg:w-1/4 w-full cursor-pointer hover:bg-gray-50"
          >
            Create Account
          </button>
        </div>
      </div>
    </>
  );
}
