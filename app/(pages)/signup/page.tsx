"use client";

import { motion } from "motion/react";
import React from "react";
import { useState } from "react";
import axios from "axios";
import TextInputField from "../../components/ui/TextInputField";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/app/store/userStore";
import { GearSix } from "@phosphor-icons/react/dist/ssr/GearSix";

export default function page() {
  const [loginId, setUserLoginId] = useState("");
  const [email, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, setUser, setToken, setName, setLoginId, setEmail } = useUserStore();

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

  const handleSignup = async () => {
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
      setUser(response.data.user);
      setName(response.data.user.name);
      setLoginId(response.data.user.loginId);
      setToken(response.data.message);
      setEmail(response.data.user.email);
      login(response.data.user.loginId, "hardcoded for now");
      router.push("/");
    } catch (err: any) {
      console.log("Signup errorr:", err);

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
      handleSignup();
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
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setUserEmail(e.target.value)}
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
            <TextInputField
              className="!w-full mb-2"
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyPress={handleKeyPress}
            />

            {error && (
              <div className="w-full  ">
                <p className="text-red-500 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="w-full mt-auto flex flex-col">
              <button
                type="button"
                onClick={handleSignup}
                disabled={isLoading}
                className={`font-medium text-white text-2xl p-3 rounded-xl  w-full cursor-pointer ${
                  isLoading
                    ? "bg-accent cursor-not-allowed brightness-80"
                    : "bg-accent hover:bg-accent/90"
                }`}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
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
                className="border mb-2 border-accent font-medium text-2xl text-black p-3 rounded-xl  w-full cursor-pointer hover:bg-gray-50"
              >
                Login
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