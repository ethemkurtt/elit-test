import { useAuthStore } from "@/lib/auth-store"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function useProtectRoute(expectedRole?: "admin" | "customer") {
  const { user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      alert("Giriş yapmadan bu sayfaya erişemezsiniz.")
      router.push("/")
      return
    }

    if (expectedRole && user.role !== expectedRole) {
      alert(`Bu sayfaya yalnızca ${expectedRole} rolü erişebilir.`)
      router.push("/")
    }
  }, [user, expectedRole, router])
}
