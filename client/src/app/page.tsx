'use client'
import Image from "next/image";
import LoginPage from "./login/page";
import Workspace from "./workspace/page";
import { useEffect } from "react";

export default function Home() {
  let token = "";
  useEffect(() => {
    token = localStorage.getItem("token") as string || "";
  }, [])
  return (
    token ? <Workspace /> : <LoginPage />
  );
}
