"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "./store/userStore";
import axios from "axios";
export default function Home() {
  const router = useRouter();
  const { isLoggedIn, name } = useUserStore();
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      router.push("/dashboard");
    }
  }, []);

  const clickMe = async () => {
    const res = await axios.get("/api/login");
    if (res.data.message == "works") {
      router.push("/landing");
    }
  };
  if (!isLoggedIn) return null;
  return (
    <div
      className="size-full flex items-center justify-center text-6xl"
      onClick={() => clickMe()}
    >
    </div>
  );
}
