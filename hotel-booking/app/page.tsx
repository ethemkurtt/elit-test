"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
export default function HomePage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push(user.role === "admin" ? "/dashboard" : "/otel");
    }
  }, [user, router]);

  if (user) return null;
  return (
    <div className="flex h-screen">
      {/* Sol taraf: arka plan görseli */}
      
      <div className="relative w-1/2 hidden md:block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/landing/hotel.jpg"
          alt="Otel Görseli"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-10">
          <h1 className="text-3xl font-bold mb-2">Elite Otel Rezervasyon</h1>
          <p className="text-zinc-300">Konaklamanı kolayca ayırt!</p>
        </div>
      </div>

      {/* Sağ taraf: giriş */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-10 space-y-6">
        <h2 className="text-2xl font-bold">Hoş geldin 👋</h2>
        <p className="text-muted-foreground">
          Devam etmek için bir seçenek seç
        </p>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="default">Giriş Yap</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline">Kayıt Ol</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
