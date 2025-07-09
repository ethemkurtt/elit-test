"use client"

import { Button } from "@/components/ui/button"

type Props = {
  page: number
  setPage: (page: number) => void
  totalPages: number
}

export default function Pagination({ page, setPage, totalPages }: Props) {
  return (
    <div className="flex justify-center items-center gap-4 mt-4">
      <Button
        variant="outline"
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
      >
        ⬅ Önceki
      </Button>
      <span className="text-sm">Sayfa {page} / {totalPages}</span>
      <Button
        variant="outline"
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
      >
        Sonraki ➡
      </Button>
    </div>
  )
}
