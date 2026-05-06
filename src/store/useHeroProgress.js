import { create } from 'zustand'

const useHeroProgress = create((set) => ({
  progress: 0,
  framesLoaded: 0,
  framesTotal: 0,
  ready: false,
  setProgress: (progress) => set({ progress }),
  setFramesLoaded: (framesLoaded) => set({ framesLoaded }),
  setFramesTotal: (framesTotal) => set({ framesTotal }),
  setReady: (ready) => set({ ready }),
}))

export default useHeroProgress
