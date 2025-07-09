"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

const registerSchema = z
  .object({
    fullName: z.string().min(2, "İsim en az 2 karakter olmalı"),
    email: z.string().email("Geçerli bir e-posta adresi girin"),
    phone: z.string().min(10, "Telefon numarası eksik"),
    birthDate: z.string().refine(
      (val) => {
        const date = new Date(val)
        return !isNaN(date.getTime())
      },
      {
        message: "Geçerli bir doğum tarihi girin",
      }
    ),
    password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler uyuşmuyor",
    path: ["confirmPassword"],
  })

type RegisterValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  })

  const router = useRouter()

  const onSubmit = async (data: RegisterValues) => {
    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData: { message?: string } = await response.json()
        throw new Error(errorData.message || "Kayıt başarısız")
      }

      alert("✅ Kayıt başarılı. Giriş yapabilirsiniz.")
      router.push("/login")
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert("❌ Bilinmeyen bir hata oluştu.")
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white dark:bg-zinc-900 p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Kayıt Ol</h1>
          <p className="text-sm text-muted-foreground">
            Aşağıdaki formu doldurarak kaydolabilirsiniz.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Ad Soyad</Label>
            <Input id="fullName" {...register("fullName")} placeholder="Ahmet Yılmaz" />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">E-posta</Label>
            <Input id="email" type="email" {...register("email")} placeholder="ornek@mail.com" />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Telefon</Label>
            <Input id="phone" type="tel" {...register("phone")} placeholder="05551234567" />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="birthDate">Doğum Tarihi</Label>
            <Input id="birthDate" type="date" {...register("birthDate")} />
            {errors.birthDate && (
              <p className="text-sm text-red-500">{errors.birthDate.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Şifre</Label>
            <Input id="password" type="password" {...register("password")} placeholder="••••••••" />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full">
            Kayıt Ol
          </Button>
        </form>
      </div>
    </div>
  )
}
