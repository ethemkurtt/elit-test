"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import Image from "next/image";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";

const schema = z.object({
  categoryId: z.string().min(1, "Kategori seçilmelidir"),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  people: z.coerce.number().min(1, "En az 1 kişi olmalı"),
});

type FormData = z.infer<typeof schema>;

type Category = {
  _id: string;
  name: string;
  price: number;
  capacity: number;
  image: string;
};

type Room = {
  _id: string;
  roomNumber: string;
  floor: number;
  isActive: boolean;
  category: Category;
};

export default function RezervasyonYapPage() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isReserving, setIsReserving] = useState(false);

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      people: 1,
    },
  });

  const selectedCategoryId = watch("categoryId");
  const dateRange = watch("dateRange");
  const people = watch("people");

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/categories");
      if (!res.ok) throw new Error("Kategoriler alınamadı");
      return res.json();
    },
  });

  const { data: availableRooms = [], refetch } = useQuery<Room[]>({
    queryKey: ["available-rooms", selectedCategoryId, dateRange],
    enabled: false,
    queryFn: async () => {
      const start = dateRange?.from?.toISOString();
      const end = dateRange?.to?.toISOString();
      const res = await fetch(
        `http://localhost:5000/api/reservations/available?start=${start}&end=${end}`
      );
      if (!res.ok) throw new Error("Müsaitlik verisi alınamadı");
      return res.json();
    },
  });

  const onSubmit = (formData: FormData) => {
    refetch().then(({ data }) => {
      const suitable =
        data?.filter(
          (r) =>
            r.category._id === formData.categoryId &&
            r.category.capacity >= formData.people
        ) || [];

      if (suitable.length === 0) {
        alert("❌ Uygun oda bulunamadı.");
        setSelectedRoom(null);
      } else {
        const random = suitable[Math.floor(Math.random() * suitable.length)];
        setSelectedRoom(random);
      }
    });
  };

  const makeReservation = async () => {
    if (!selectedRoom || !dateRange?.from || !dateRange?.to || !user?._id) {
      alert("❗ Rezervasyon için gerekli bilgiler eksik.");
      return;
    }

    const payload = {
      roomId: selectedRoom._id,
      startDate: dateRange.from.toISOString(),
      endDate: dateRange.to.toISOString(),
      guestCount: people,
      userId: user._id,
    };

    setIsReserving(true);

    try {
      const res = await fetch("http://localhost:5000/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Rezervasyon oluşturulamadı");
      }

      alert("✅ Rezervasyon başarıyla oluşturuldu.");
      setSelectedRoom(null);
    } catch (error) {
      if (error instanceof Error) {
        alert("❌ Hata: " + error.message);
      } else {
        alert("❌ Bilinmeyen hata oluştu.");
      }
    } finally {
      setIsReserving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl">🛏️ Rezervasyon Yap</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Label>Kategori</Label>
              <select
                {...register("categoryId")}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-zinc-900"
              >
                <option value="">Seçiniz</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-sm text-red-500">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            <div>
              <Label>Tarih Aralığı</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange?.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        `${format(dateRange.from, "dd.MM.yyyy")} - ${format(
                          dateRange.to,
                          "dd.MM.yyyy"
                        )}`
                      ) : (
                        format(dateRange.from, "dd.MM.yyyy")
                      )
                    ) : (
                      <span>Tarih seçiniz</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => setValue("dateRange", range as any)}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              {errors.dateRange && (
                <p className="text-sm text-red-500">Tarih aralığı gereklidir</p>
              )}
            </div>

            <div>
              <Label>Kişi Sayısı</Label>
              <Input type="number" {...register("people")} min={1} />
              {errors.people && (
                <p className="text-sm text-red-500">{errors.people.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full">
              Müsait Oda Ata
            </Button>
          </form>

          {selectedRoom && (
            <div className="border rounded p-4 mt-6 space-y-3 bg-muted">
              <p>
                <strong>Oda No:</strong> {selectedRoom.roomNumber}
              </p>
              <p>
                <strong>Kat:</strong> {selectedRoom.floor}
              </p>
              <p>
                <strong>Kategori:</strong> {selectedRoom.category.name}
              </p>
              <p>
                <strong>Fiyat:</strong> {selectedRoom.category.price} ₺
              </p>
              <p>
                <strong>Kapasite:</strong> {selectedRoom.category.capacity} kişi
              </p>
              <p>
                <strong>Giriş Saati:</strong> 14:00
              </p>
              <p>
                <strong>Çıkış Saati:</strong> 12:00
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`http://localhost:5000/${selectedRoom.category.image}`}
                alt="Kategori Görseli"
                width={400}
                height={250}
                className="rounded-md border"
              />
              <Button
                onClick={makeReservation}
                className="w-full mt-4"
                disabled={isReserving}
              >
                {isReserving
                  ? "Rezervasyon Yapılıyor..."
                  : "Rezervasyonu Tamamla"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
