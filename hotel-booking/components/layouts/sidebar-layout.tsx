'use client'

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight, Menu } from "lucide-react"

export default function Sidebar() {
  const [openRooms, setOpenRooms] = useState(true)
  const [openStaff, setOpenStaff] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  const MenuGroup = ({
    title,
    isOpen,
    toggle,
    children
  }: {
    title: string
    isOpen: boolean
    toggle: () => void
    children: React.ReactNode
  }) => (
    <div>
      <button
        onClick={toggle}
        className="flex items-center justify-between w-full text-left text-sm font-medium text-zinc-700 dark:text-zinc-100 hover:text-primary"
      >
        <span>{title}</span>
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {isOpen && <ul className="mt-2 ml-2 space-y-1 text-sm text-muted-foreground">{children}</ul>}
    </div>
  )

  const SidebarContent = () => (
    <aside className="w-64 min-h-screen border-r p-4 bg-white dark:bg-zinc-900 space-y-6 shadow-md">
      <div>
        <Link href="/dashboard" className="font-semibold text-base hover:text-primary transition-colors">
          Anasayfa
        </Link>
      </div>

      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-1">Rezervasyonlar</h2>
        <ul className="space-y-1">
          <li>
            <Link href="/dashboard/rezervasyonlar" className="text-sm hover:text-primary">
              Tüm Rezervasyonlar
            </Link>
          </li>
        </ul>
      </div>

      <MenuGroup
        title="Odalar"
        isOpen={openRooms}
        toggle={() => setOpenRooms(!openRooms)}
      >
        <li><Link href="/dashboard/odalar" className="hover:text-primary">Odalar</Link></li>
        <li><Link href="/dashboard/oda-ekle" className="hover:text-primary">Oda Ekle</Link></li>
        <li><Link href="/dashboard/oda-tipleri" className="hover:text-primary">Oda Tipleri</Link></li>
        <li><Link href="/dashboard/oda-tipi-ekle" className="hover:text-primary">Oda Tipi Ekle</Link></li>
      </MenuGroup>


      <Separator />

      <div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            localStorage.clear()
            document.cookie = "token=; Max-Age=0"
            window.location.href = "/login"
          }}
        >
          Çıkış Yap
        </Button>
      </div>
    </aside>
  )

  return (
    <div>
      {/* Mobil Üst Menü */}
      <div className="lg:hidden p-4 border-b flex justify-between items-center bg-white dark:bg-zinc-900">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <span className="text-lg font-semibold">Panel</span>
      </div>

      {/* Masaüstü Sidebar */}
      <div className="hidden lg:block">
        <SidebarContent />
      </div>
    </div>
  )
}
