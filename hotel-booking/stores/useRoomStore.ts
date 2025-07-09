import { create } from "zustand"
import { Room } from "@/types"

type RoomState = {
  selectedRoom: Room | null
  setSelectedRoom: (room: Room | null) => void
}

export const useRoomStore = create<RoomState>((set) => ({
  selectedRoom: null,
  setSelectedRoom: (room) => set({ selectedRoom: room })
}))
