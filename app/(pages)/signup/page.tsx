import React from "react";
import TextInputField from "../../components/ui/TextInputField";

export default function page() {
  return (
    <>
      <div className="flex flex-col w-full items-center justify-center min-h-screen py-2">
        <form className="flex flex-col items-center w-full px-8">
          <TextInputField type="email" placeholder="Enter login id" />
          <TextInputField type="email" placeholder="Enter email id" />
          <TextInputField type="password" placeholder="Password" />
          <TextInputField type="password" placeholder="Re-enter password" />

          <button
            type="submit"
            className="bg-accent font-medium text-white p-3 rounded-xl lg:w-1/4 w-full cursor-pointer"
          >
            Sign Up
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
            Login
          </button>
        </form>
      </div>
    </>
  );
}
