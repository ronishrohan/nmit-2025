import { NextResponse } from "next/server";
import axios from "axios";
const BASE_URL = "http://172.17.54.64:3000/api";

export async function POST(request: Request) {
  const { loginId, password, email } = await request.json();

  if (!loginId || !password || !email) {
    return NextResponse.json({
      error: "Missing loginId or password",
    });
  }
  const res = await axios.post(`${BASE_URL}/auth/signup`, {
    loginId,
    password,
    email,
  });
  console.log(res.data);

  return NextResponse.json({
    message: res.data.message,
    user: res.data.user,
  });
}

export async function GET() {
  return NextResponse.json({
    message: "works",
  });
}
