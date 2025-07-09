"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type Room = {
  _id: string;
  roomNumber: string;
  floor: number;
  categoryId: string;
  isActive: boolean;
};

type Category = {
  _id: string;
  name: string;
  image: string;
  price: number;
  capacity: number;
};

const formSchema = z.object({
  roomNumber: z.string().min(1, "Oda numarası zorunludur"),
  floor: z.coerce.number().int().min(0, "Kat 0 veya daha büyük olmalıdır"),
  categoryId: z.string().min(1, "Oda tipi seçmelisiniz"),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function OdaDuzenlePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: roomData,
    isLoading: isRoomLoading,
    isError: isRoomError,
  } = useQuery<Room>({
    queryKey: ["room", id],
    queryFn: async () => {
      const res = await fetch(`http://localhost:5000/api/rooms/${id}`);
      if (!res.ok) throw new Error("Oda getirilemedi");
      return res.json();
    },
  });

  const { data: categories = [], isLoading: isCatLoading } = useQuery<
    Category[]
  >({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/categories");
      return res.json();
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomNumber: "",
      floor: 0,
      categoryId: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (roomData) {
      form.reset({
        roomNumber: roomData.roomNumber,
        floor: roomData.floor,
        categoryId: roomData.categoryId,
        isActive: roomData.isActive,
      });
    }
  }, [roomData, form]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await fetch(`http://localhost:5000/api/rooms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Güncelleme başarısız");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      alert("✅ Oda güncellendi");
      router.push("/dashboard/odalar");
    },
    onError: () => {
      alert("❌ Güncelleme hatası oluştu");
    },
  });

  if (isRoomLoading || isCatLoading) {
    return (
      <div className="max-w-xl mx-auto mt-10">
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (isRoomError || !roomData) {
    return (
      <div className="text-center text-red-600 mt-10">Oda bulunamadı.</div>
    );
  }

  const { register, handleSubmit, formState, watch, setValue } = form;
  const selectedCategoryId = watch("categoryId");

  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Oda Düzenle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <form
            onSubmit={handleSubmit((values) => mutation.mutate(values))}
            className="space-y-5"
          >
            <div>
              <Label>Oda Numarası</Label>
              <Input {...register("roomNumber")} />
              {formState.errors.roomNumber && (
                <p className="text-sm text-red-600 mt-1">
                  {formState.errors.roomNumber.message}
                </p>
              )}
            </div>

            <div>
              <Label>Kat</Label>
              <Input type="number" {...register("floor")} />
              {formState.errors.floor && (
                <p className="text-sm text-red-600 mt-1">
                  {formState.errors.floor.message}
                </p>
              )}
            </div>

            <div>
              <Label>Oda Tipi</Label>
              <select
                {...register("categoryId")}
                className="w-full border rounded h-10 px-3 text-sm"
              >
                <option value="">-- Oda Tipi Seçin --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {formState.errors.categoryId && (
                <p className="text-sm text-red-600 mt-1">
                  {formState.errors.categoryId.message}
                </p>
              )}
              {selectedCategoryId && (
                <div className="mt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`http://localhost:5000/${
                      categories.find((c) => c._id === selectedCategoryId)
                        ?.image
                    }`}
                    alt="Oda Tipi Görseli"
                    width={300}
                    height={180}
                    className="rounded border object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={watch("isActive")}
                onCheckedChange={(val) => setValue("isActive", val)}
              />
              <Label>{watch("isActive") ? "Aktif" : "Pasif"}</Label>
            </div>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Güncelleniyor..." : "Güncelle"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
