"use client";

import { useRouter } from "next/navigation";
import { useUserStore } from "./store/userStore";
import axios from "axios";
export default function Home() {
  const router = useRouter();
  const { isLoggedIn } = useUserStore();
  if(!isLoggedIn){
    router.push("/login");
  }
  const clickMe = async () => {
    const res = await axios.get("/api/login");
    if (res.data.message == "works") {
      router.push("/landing");
    }
  };
  return (
    <div
      className="size-full flex items-center justify-center text-6xl"
      onClick={() => clickMe()}
    >
     is this instrument-sans
    </div>
  );
}
