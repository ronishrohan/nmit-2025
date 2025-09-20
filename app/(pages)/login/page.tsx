"use client";

import React from "react";
import axios from "axios";
import { useState } from "react";
import TextInputField from "../../components/ui/TextInputField";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/app/store/userStore";
import { GearSix } from "@phosphor-icons/react/dist/ssr/GearSix";
import { backend } from "@/app/util/axios";
export default function page() {
  const [loginId, setUserLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { login, setUser,setToken } = useUserStore();

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
      const response = await backend.post("/auth/login", {
        loginId: loginId,
        pwd: password,
      });

      console.log("Login successful", response.data);
      // console.log("token here", response.data.token);
      // Redirect to dashboard or home page on success
      setUser(response.data.user);

      setToken(response.data.message);
      login(loginId, password);
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
        <div className="flex  w-[800px] gap-4 bg-white rounded-xl p-4">
          <div className="w-1/2 flex flex-col">
          <div className="text-3xl font-bold mb-4 flex gap-2"><GearSix weight="fill" size={30} />OUTWORKS</div>
          <TextInputField
          className="!w-full mb-2"
            type="text"
            placeholder="Login ID"
            value={loginId}
            onChange={(e) => setUserLoginId(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <TextInputField
          className="!w-full mb-2"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            
          />

          {error && (
            <div className="w-full  mb-2">
              <p className="text-red-500 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="w-full flex justify-end mb-4">
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
            className={`font-medium text-white p-3 rounded-xl  w-full cursor-pointer ${
              isLoading
                ? "bg-accent cursor-not-allowed brightness-80"
                : "bg-accent hover:bg-accent/90"
            }`}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>

          <div className="flex items-center w-full my-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <button
            type="button"
            onClick={() => {
              router.push("/signup");
            }}
            className="border border-accent font-medium text-black p-3 rounded-xl  w-full cursor-pointer hover:bg-gray-50"
          >
            Create Account
          </button>
        
          </div>
          <div className="w-1/2 rounded-xl bg-accent overflow-hidden relative flex items-center justify-center" >
          <img src="/images/flower.jpg" className="size-full absolute left-0 top-0 object-cover" alt="" /></div>
        </div>
      </div>
    </>
  );
}
