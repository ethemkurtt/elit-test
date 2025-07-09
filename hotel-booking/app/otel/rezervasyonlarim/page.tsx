"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import Image from "next/image";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";

interface Reservation {
  _id: string;
  startDate: string;
  endDate: string;
  guestCount: number;
  roomNumber: string;
  floor: number;
  categoryName: string;
  categoryPrice: number;
  categoryImage: string;
  roomId: string;
}

export default function ReservationsPage() {
  const [token, setToken] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    const t = Cookies.get("token");
    if (t) setToken(t);
  }, []);

  const { data: reservations = [], isLoading } = useQuery<Reservation[]>({
    queryKey: ["my-reservations"],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/reservations/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Rezervasyonlar alınamadı");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`http://localhost:5000/api/reservations/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Rezervasyon silinemedi");
    },
    onSuccess: () => {
      toast.success("✅ Rezervasyon iptal edildi.");
      queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
    },
    onError: () => {
      toast.error("❌ Rezervasyon iptal edilemedi.");
    },
  });

  const columns: ColumnDef<Reservation>[] = [
    {
      accessorKey: "categoryImage",
      header: "Görsel",
      cell: ({ row }) => (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`http://localhost:5000/${row.original.categoryImage}`}
            alt="Oda Görseli"
            width={120}
            height={80}
            className="rounded-lg border object-cover"
          />
        </>
      ),
    },
    { accessorKey: "roomNumber", header: "Oda No" },
    { accessorKey: "floor", header: "Kat" },
    { accessorKey: "categoryName", header: "Kategori" },
    {
      accessorKey: "categoryPrice",
      header: "Fiyat",
      cell: ({ row }) => <span>{row.original.categoryPrice} ₺</span>,
    },
    {
      accessorKey: "startDate",
      header: "Giriş",
      cell: ({ row }) => format(new Date(row.original.startDate), "dd.MM.yyyy"),
    },
    {
      accessorKey: "endDate",
      header: "Çıkış",
      cell: ({ row }) => format(new Date(row.original.endDate), "dd.MM.yyyy"),
    },
    { accessorKey: "guestCount", header: "Kişi" },
    {
      id: "actions",
      header: "İşlemler",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                İptal Et
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <p>Bu rezervasyonu iptal etmek istediğinize emin misiniz?</p>
              <AlertDialogFooter>
                <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate(row.original._id)}
                >
                  Evet, İptal Et
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto mt-12 px-4">
      <Card className="shadow-lg rounded-xl border">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">
            Rezervasyonlarım
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="w-full h-14 rounded-md" />
              ))}
            </div>
          ) : reservations.length === 0 ? (
            <p className="text-muted-foreground">
              Henüz bir rezervasyonunuz yok.
            </p>
          ) : (
            <DataTable
              columns={columns}
              data={reservations}
              className="rounded-lg border"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
