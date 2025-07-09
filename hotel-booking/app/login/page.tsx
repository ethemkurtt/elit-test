"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import Cookies from "js-cookie"

const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
})

type LoginValues = z.infer<typeof loginSchema>

type LoginResponse = {
  token: string
  user: {
    _id: string
    fullName: string
    email: string
    phone: string
    birthDate: string
    role: "admin" | "customer"
  }
}

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginValues) => {
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Giriş başarısız")
      }

      const result: LoginResponse = await response.json()

      login(result)

      Cookies.set("token", result.token, {
        path: "/",
        secure: process.env.NODE_ENV === "production",
      })

      if (result.user.role === "admin") {
        router.push("/dashboard")
      } else {
        router.push("/otel")
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert("Bilinmeyen bir hata oluştu.")
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg bg-white dark:bg-zinc-900 p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Giriş Yap</h1>
          <p className="text-sm text-muted-foreground">
            E-posta ve şifrenizi girerek devam edin.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">E-posta</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Şifre</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full">
            Giriş Yap
          </Button>
        </form>
      </div>
    </div>
  )
}
