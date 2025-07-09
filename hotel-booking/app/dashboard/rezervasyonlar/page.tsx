"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Image from "next/image";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Reservation {
  _id: string;
  room?: {
    roomNumber?: string;
    floor?: number;
    category?: {
      name?: string;
      price?: number;
      capacity?: number;
      image?: string;
    };
  };
  startDate: string;
  endDate: string;
  guestCount: number;
}

export default function AdminReservationsPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const token = Cookies.get("token");

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);

  const { data, isLoading, refetch } = useQuery<{
    reservations: Reservation[];
    total: number;
  }>({
    queryKey: ["admin-reservations", page, debouncedSearch],
    queryFn: async () => {
      const res = await fetch(
        `http://localhost:5000/api/reservations?page=${page}&limit=${limit}&search=${debouncedSearch}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Veri alınamadı");
      return res.json();
    },
    enabled: !!token,
  });

  useEffect(() => {
    if (token) refetch();
  }, [page, token, refetch, debouncedSearch]);

  const handleDelete = async (id: string) => {
    if (!token) return toast.error("Giriş yapmanız gerekiyor");

    try {
      const res = await fetch(`http://localhost:5000/api/reservations/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "İptal işlemi başarısız");
      }

      toast.success("✅ Rezervasyon başarıyla iptal edildi.");
      refetch();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Bilinmeyen bir hata oluştu.");
      }
    }
  };

  const columns = useMemo<ColumnDef<Reservation>[]>(
    () => [
      {
        accessorKey: "room.roomNumber",
        header: "Oda No",
        cell: ({ row }) => row.original.room?.roomNumber ?? "-",
      },
      {
        accessorKey: "room.category.name",
        header: "Kategori",
        cell: ({ row }) => row.original.room?.category?.name ?? "-",
      },
      {
        accessorKey: "room.category.image",
        header: "Görsel",
        cell: ({ row }) =>
          row.original.room?.category?.image ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`http://localhost:5000/${row.original.room.category.image}`}
                alt="Kategori Görseli"
                width={60}
                height={40}
                className="rounded-md border"
              />
            </>
          ) : (
            "-"
          ),
      },
      {
        accessorKey: "room.category.price",
        header: "Fiyat",
        cell: ({ row }) =>
          row.original.room?.category?.price
            ? `${row.original.room.category.price} ₺`
            : "-",
      },
      {
        accessorKey: "room.category.capacity",
        header: "Kapasite",
        cell: ({ row }) => row.original.room?.category?.capacity ?? "-",
      },
      {
        accessorKey: "startDate",
        header: "Tarih",
        cell: ({ row }) =>
          `${format(new Date(row.original.startDate), "dd.MM.yyyy")} - ${format(
            new Date(row.original.endDate),
            "dd.MM.yyyy"
          )}`,
      },
      {
        accessorKey: "guestCount",
        header: "Kişi",
        cell: ({ row }) => row.original.guestCount,
      },
      {
        accessorKey: "actions",
        header: "İşlem",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDelete(row.original._id)}
            >
              İptal Et
            </Button>
          </div>
        ),
      },
    ],
    [refetch, token]
  );

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Tüm Rezervasyonlar</CardTitle>
          <CardDescription>
            Bu alanda otelinize ait tüm rezervasyonları görüntüleyebilir ve
            iptal edebilirsiniz.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <Input
            placeholder="Oda numarası ile ara..."
            className="mb-4 max-w-xs"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />

          <DataTable
            columns={columns}
            data={data?.reservations || []}
            isLoading={isLoading}
          />

          <div className="mt-6 flex justify-end">
            <Pagination
              page={page}
              setPage={setPage}
              totalPages={Math.ceil((data?.total ?? 0) / limit)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
