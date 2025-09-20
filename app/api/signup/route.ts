import { NextResponse } from "next/server";
import axios from "axios";
const BASE_URL = "http://172.17.54.86:3000/api";

export async function POST(request: Request) {
  try {
    const { loginId, email,password } = await request.json();

    // Check for missing fields
    if (!loginId || !password || !email) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: loginId, password, and email are required",
        },
        { status: 400 },
      );
    }

    // Validate loginId
    if (loginId.length < 3) {
      return NextResponse.json(
        { error: "Login ID must be at least 3 characters long" },
        { status: 400 },
      );
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(loginId)) {
      return NextResponse.json(
        {
          error:
            "Login ID can only contain letters, numbers, underscores, and hyphens",
        },
        { status: 400 },
      );
    }

    // Validate email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 },
      );
    }

    // Validate password
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 },
      );
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one lowercase letter" },
        { status: 400 },
      );
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one uppercase letter" },
        { status: 400 },
      );
    }
    if (!/(?=.*\d)/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one number" },
        { status: 400 },
      );
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return NextResponse.json(
        {
          error:
            "Password must contain at least one special character (@$!%*?&)",
        },
        { status: 400 },
      );
    }

    const res = await axios.post(`${BASE_URL}/auth/signup`, {
      loginId,
      pwd: password,
      email,
    });

    console.log(res.data);

    return NextResponse.json({
      message: res.data.message,
      user: res.data.user,
    });
  } catch (error: any) {
    console.log("Signup API error:", error.response?.data || error.message);

    // Handle different types of signup errors
    if (error.response?.status === 409) {
      return NextResponse.json(
        { error: "An account with this login ID or email already exists" },
        { status: 409 },
      );
    } else if (error.response?.status === 400) {
      return NextResponse.json(
        { error: error.response.data?.message || "Invalid input data" },
        { status: 400 },
      );
    } else {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  }
}

export async function GET() {
  return NextResponse.json({
    message: "works",
  });
}
