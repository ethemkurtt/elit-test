"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import { useDebounce } from "use-debounce"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Pagination from "@/components/Pagination"
import { useRoomStore } from "@/stores/useRoomStore"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type Room = {
  _id: string
  roomNumber: string
  floor: number
  isActive: boolean
  category: {
    name: string
    price: number
    capacity: number
  }
}

type Response = {
  data: Room[]
  total: number
}

export default function OdalarPage() {
  const { selectedRoom, setSelectedRoom } = useRoomStore()
  const [search, setSearch] = useState("")
  const [debouncedSearch] = useDebounce(search, 400)

  const [page, setPage] = useState(1)
  const limit = 5

  const {
    data,
    isLoading,
    refetch,
  } = useQuery<Response>({
    queryKey: ["rooms", page, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", String(limit))
      if (debouncedSearch.trim()) {
        params.set("search", debouncedSearch.trim())
      }

      const res = await fetch(`http://localhost:5000/api/rooms?${params.toString()}`)
      if (!res.ok) throw new Error("Odalar getirilemedi")
      return res.json()
    },
  })

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Bu odayı silmek istiyor musun?")
    if (!confirm) return

    const res = await fetch(`http://localhost:5000/api/rooms/${id}`, {
      method: "DELETE",
    })

    if (res.ok) {
      alert("✅ Oda silindi.")
      setSelectedRoom(null)
      refetch()
    } else {
      alert("❌ Oda silinemedi.")
    }
  }

  const handleStatusToggle = async () => {
    if (!selectedRoom) return

    const newStatus = !selectedRoom.isActive

    const res = await fetch(`http://localhost:5000/api/rooms/${selectedRoom._id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: newStatus }),
    })

    if (res.ok) {
      alert("✅ Durum güncellendi.")
      setSelectedRoom({ ...selectedRoom, isActive: newStatus })
      refetch()
    } else {
      alert("❌ Durum güncellenemedi.")
    }
  }

  const columns: ColumnDef<Room>[] = [
    { accessorKey: "roomNumber", header: "Oda No" },
    { accessorKey: "floor", header: "Kat" },
    {
      accessorFn: (row) => row.category?.name ?? "—",
      id: "kategori",
      header: "Oda Tipi",
    },
    {
      accessorKey: "isActive",
      header: "Durum",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean
        return (
          <span
            className={
              isActive
                ? "text-green-600 font-medium"
                : "text-red-600 font-medium"
            }
          >
            {isActive ? "✅ Aktif" : "⛔ Pasif"}
          </span>
        )
      },
    },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mt-10 px-4">
      {/* Sol: Oda Tablosu */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Oda Listesi</CardTitle>
            <Input
              placeholder="Oda numarası ile ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-3"
            />
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={data?.data || []}
              onRowClick={(room) => setSelectedRoom(room)}
              isLoading={isLoading}
            />

            {/* Sayfalama */}
            {debouncedSearch.trim() === "" && (
              <Pagination
                page={page}
                setPage={setPage}
                totalPages={Math.ceil((data?.total || 0) / limit)}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sağ: Oda Detay Paneli */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>{selectedRoom ? "Oda Detayı" : "Oda Seçiniz"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {selectedRoom ? (
              <>
                <p><strong>Oda No:</strong> {selectedRoom.roomNumber}</p>
                <p><strong>Kat:</strong> {selectedRoom.floor}</p>
                <p><strong>Oda Tipi:</strong> {selectedRoom.category?.name}</p>
                <p><strong>Durum:</strong>{" "}
                  <span className={selectedRoom.isActive ? "text-green-600" : "text-red-600"}>
                    {selectedRoom.isActive ? "Aktif" : "Pasif"}
                  </span>
                </p>

                <div className="flex flex-wrap gap-2 pt-4">
                  <Link href={`/dashboard/oda-duzenle/${selectedRoom._id}`}>
                    <Button size="sm" variant="outline">Düzenle</Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(selectedRoom._id)}
                  >
                    Sil
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleStatusToggle}
                  >
                    {selectedRoom.isActive ? "Pasif Yap" : "Aktif Yap"}
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Lütfen bir oda seçin.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
