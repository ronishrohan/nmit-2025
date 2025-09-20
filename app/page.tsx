"use client";

import { useRouter } from "next/navigation";
import { useUserStore } from "./store/userStore";
import axios from "axios";
export default function Home() {
  const router = useRouter();
  const { name } = useUserStore();
  const clickMe = async () => {
    const res = await axios.get("/api/login");
    if (res.data.message == "works") {
      router.push("/pages/landing");
    }
  };
  return (
    <div
      className="cursor-pointer text-blue-600 underline"
      onClick={() => clickMe()}
    >
      {name || "Click me please"}
    </div>
  );
}
