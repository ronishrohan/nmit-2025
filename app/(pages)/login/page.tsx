import React from "react";

export default function page() {
  return (
    <>
      <div className="flex flex-col w-full items-center justify-center min-h-screen py-2">
        <form className="flex flex-col items-center w-full px-8">
          <input
            type="email"
            placeholder="Login ID"
            className="p-3 font-medium bg-card rounded-xl w-full mb-4 lg:w-1/4"
          />
          <input
            type="password"
            placeholder="Password"
            className=" p-3 font-medium bg-card rounded-xl w-full mb-1 lg:w-1/4 "
          />
          <div className="w-full lg:w-1/4 flex justify-end mb-4">
            <button className="font-medium text-xs text-black/60 cursor-pointer">
              Forgot Password?
            </button>
          </div>
          <button
            type="submit"
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
        </form>
      </div>
    </>
  );
}
