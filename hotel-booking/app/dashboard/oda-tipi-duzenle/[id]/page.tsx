"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";

const schema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalı"),
  price: z.coerce.number().min(1, "Fiyat girilmeli"),
  capacity: z.coerce.number().min(1, "Kapasite girilmeli"),
  image: z.any().optional(), // dosya alanı zorunlu değil
});

type FormData = z.infer<typeof schema>;

type Category = {
  _id: string;
  name: string;
  price: number;
  capacity: number;
  image: string;
};

export default function OdaTipiDuzenlePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: category, isLoading } = useQuery<Category>({
    queryKey: ["category", id],
    queryFn: async () => {
      const res = await fetch(`http://localhost:5000/api/categories/${id}`);
      if (!res.ok) throw new Error("Kategori getirilemedi");
      return res.json();
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        price: category.price,
        capacity: category.capacity,
        image: undefined,
      });
    }
  }, [category, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("price", String(data.price));
      formData.append("capacity", String(data.capacity));

      if (data.image?.[0]) {
        formData.append("image", data.image[0]);
      }

      const res = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Güncelleme başarısız");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      alert("✅ Kategori başarıyla güncellendi.");
      router.push("/dashboard/oda-tipleri");
    },
    onError: (err: unknown) => {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("❌ Bir hata oluştu.");
      }
    },
  });

  if (isLoading) {
    return <p className="p-4 text-muted-foreground">Yükleniyor...</p>;
  }

  if (!category) {
    return <p className="p-4 text-red-500">Kategori bulunamadı.</p>;
  }

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Kategori Düzenle</CardTitle>
          <CardDescription>
            Oda tipinin bilgilerini bu formdan güncelleyebilirsin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(updateMutation.mutate)}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="name">İsim</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Fiyat (₺)</Label>
              <Input id="price" type="number" {...register("price")} />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Kapasite</Label>
              <Input id="capacity" type="number" {...register("capacity")} />
              {errors.capacity && (
                <p className="text-sm text-red-500">
                  {errors.capacity.message}
                </p>
              )}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <Label>Mevcut Görsel</Label>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`http://localhost:5000/${category.image}`}
                alt={category.name}
                width={300}
                height={180}
                className="rounded border shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Yeni Görsel (Opsiyonel)</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                {...register("image")}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Güncelleniyor..." : "Güncelle"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
