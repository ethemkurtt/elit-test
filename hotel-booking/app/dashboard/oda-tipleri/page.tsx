"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

type Category = {
  _id: string;
  name: string;
  image: string;
  price: number;
  capacity: number;
};

export default function OdaTipleriPage() {
  const queryClient = useQueryClient();

  const {
    data: categories = [],
    isLoading,
    isError,
  } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/categories");
      if (!res.ok) throw new Error("Kategoriler getirilemedi");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Silme hatası");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => {
      alert("❌ Silme işlemi sırasında hata oluştu.");
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-4 space-y-4">
            <Skeleton className="h-40 w-full rounded-md" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-center text-red-500 mt-10">
        Kategoriler yüklenirken hata oluştu.
      </p>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Oda Tipleri</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Henüz oda tipi eklenmemiş.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <Card key={cat._id} className="shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`http://localhost:5000/${cat.image}`}
                      alt={cat.name}
                      width={400}
                      height={200}
                      className="rounded-md object-cover h-40 w-full border"
                    />
                    <div>
                      <h3 className="text-lg font-semibold">{cat.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Fiyat: {cat.price} ₺
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Kapasite: {cat.capacity} kişi
                      </p>
                    </div>
                    <div className="flex gap-2 justify-between pt-2">
                      <Link href={`/dashboard/oda-tipi-duzenle/${cat._id}`}>
                        <Button variant="outline" size="sm">
                          Düzenle
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const confirmed = window.confirm(
                            `"${cat.name}" kategorisini silmek istiyor musun?`
                          );
                          if (confirmed) {
                            deleteMutation.mutate(cat._id);
                          }
                        }}
                      >
                        Sil
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
