import { NextResponse } from "next/server";
import axios from "axios";
const BASE_URL = "http://172.17.54.86:3000/api";

export async function POST(request: Request) {
  try {
    const { loginId, password } = await request.json();

    if (!loginId || !password) {
      return NextResponse.json(
        { error: "Missing loginId or password" },
        { status: 400 },
      );
    }

    const res = await axios.post(`${BASE_URL}/auth/login`, {
      loginId,
      password,
    });

    console.log(res.data);

    return NextResponse.json({
      message: res.data.message,
      user: res.data.user,
    });
  } catch (error: any) {
    console.log("Login API error:", error.response?.data || error.message);

    // Handle different types of authentication errors
    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: "Invalid login credentials" },
        { status: 401 },
      );
    } else if (error.response?.status === 400) {
      return NextResponse.json(
        { error: error.response.data?.message || "Bad request" },
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
