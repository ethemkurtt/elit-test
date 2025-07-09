import { create } from "zustand"

type EditRoomState = {
  roomForm: {
    roomNumber: string
    floor: number
    categoryId: string
    isActive: boolean
  }
  setRoomForm: (form: Partial<EditRoomState["roomForm"]>) => void
}

export const useEditRoomStore = create<EditRoomState>((set) => ({
  roomForm: {
    roomNumber: "",
    floor: 1,
    categoryId: "",
    isActive: true,
  },
  setRoomForm: (form) =>
    set((state) => ({
      roomForm: { ...state.roomForm, ...form },
    })),
}))
