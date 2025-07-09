"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const schema = z.object({
  roomNumber: z.string().min(1, "Oda numarası girilmelidir"),
  floor: z.coerce.number().min(0, "Kat bilgisi geçersiz"),
  categoryId: z.string().min(1, "Kategori seçilmelidir"),
})

type FormValues = z.infer<typeof schema>

type Category = {
  _id: string
  name: string
}

export default function OdaEklePage() {
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(false)
  const [categories, setCategories] = useState<Category[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      roomNumber: "",
      floor: 0,
      categoryId: "",
    },
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/categories")
        const data = await res.json()
        setCategories(data)
      } catch {
        alert("❌ Kategoriler yüklenemedi")
      }
    }
    fetchCategories()
  }, [])

  const onSubmit = async (formData: FormValues) => {
    setLoading(true)
    try {
      const res = await fetch("http://localhost:5000/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Oda oluşturulamadı.")
      }

      alert("✅ Oda başarıyla eklendi.")
      reset()
      router.push("/dashboard/odalar")
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert("Bilinmeyen bir hata oluştu.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Yeni Oda Ekle</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label>Oda Numarası</Label>
              <Input {...register("roomNumber")} placeholder="Örn: 101" />
              {errors.roomNumber && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.roomNumber.message}
                </p>
              )}
            </div>

            <div>
              <Label>Kat</Label>
              <Input
                type="number"
                {...register("floor")}
                placeholder="Örn: 2"
              />
              {errors.floor && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.floor.message}
                </p>
              )}
            </div>

            <div>
              <Label>Oda Tipi (Kategori)</Label>
              <select
                {...register("categoryId")}
                className="w-full border rounded h-10 px-3 bg-white dark:bg-zinc-900 text-sm"
              >
                <option value="">-- Seçiniz --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Ekleniyor...
                </span>
              ) : (
                "Odayı Ekle"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
