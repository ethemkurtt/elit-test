"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"

const schema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalı."),
  price: z.coerce.number().min(0, "Fiyat 0 veya daha fazla olmalı."),
  capacity: z.coerce.number().min(1, "Kapasite en az 1 olmalı."),
  image: z.custom<FileList>((val) => val instanceof FileList && val.length > 0, {
    message: "Fotoğraf yüklenmelidir.",
  }),
})

type FormData = z.infer<typeof schema>

export default function OdaTipiEklePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const form = new FormData()
      form.append("name", data.name)
      form.append("price", String(data.price))
      form.append("capacity", String(data.capacity))
      form.append("image", data.image[0]) // sadece ilk dosya

      const res = await fetch("http://localhost:5000/api/categories", {
        method: "POST",
        body: form,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Kategori eklenemedi.")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      alert("✅ Kategori başarıyla eklendi.")
      router.push("/dashboard/oda-tipleri")
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert("Bilinmeyen bir hata oluştu.")
      }
    },
  })

  const onSubmit = (data: FormData) => {
    setLoading(true)
    mutation.mutate(data, {
      onSettled: () => setLoading(false),
    })
  }

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Yeni Oda Tipi Ekle</CardTitle>
          <CardDescription>Lütfen tüm alanları eksiksiz doldurun.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Oda İsmi</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Örn: Deluxe Suite"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Fiyat (₺)</Label>
              <Input
                id="price"
                type="number"
                {...register("price")}
                placeholder="Örn: 1500"
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Kapasite (kişi)</Label>
              <Input
                id="capacity"
                type="number"
                {...register("capacity")}
                placeholder="Örn: 2"
              />
              {errors.capacity && (
                <p className="text-sm text-red-500">{errors.capacity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Fotoğraf</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                {...register("image")}
              />
              {errors.image && (
                <p className="text-sm text-red-500">{errors.image.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </span>
              ) : (
                "Kaydet"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
