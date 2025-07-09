"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import Cookies from "js-cookie"
import { useAuthStore } from "@/lib/auth-store";

const navItems = [
  { href: "/otel", label: "Ana Sayfa" },
  { href: "/otel/rezervasyon-yap", label: "Rezervasyon Yap" },
  { href: "/otel/rezervasyonlarim", label: "Rezervasyonlarım" },
  { href: "/otel/profilim", label: "Profilim" },
]

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, token, logout } = useAuthStore()

  useEffect(() => {
    // Eğer giriş yapılmamışsa → ana sayfaya yönlendir
    if (!token) {
      router.replace("/")
    }
    // Eğer admin kullanıcı otel paneline girmeye çalışıyorsa → ana sayfaya yönlendir
    if (user && user.role !== "customer") {
      router.replace("/")
    }
  }, [token, user])

  const handleLogout = () => {
    logout()
    Cookies.remove("token")
    router.push("/")
  }

  return (
    <div className="flex min-h-screen">
      {/* Sol Menü */}
      <aside className="w-60 bg-gray-100 dark:bg-zinc-900 p-4 border-r">
        <h2 className="text-xl font-bold mb-6">🏨 Otel Paneli</h2>
        <nav className="space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-zinc-800 transition ${
                pathname === item.href ? "bg-gray-200 dark:bg-zinc-800 font-semibold" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-10 text-sm text-red-500 underline hover:text-red-700"
        >
          Çıkış Yap
        </button>
      </aside>

      {/* Sağ İçerik */}
      <main className="flex-1 p-6 bg-white dark:bg-black">{children}</main>
    </div>
  )
}
