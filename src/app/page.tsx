import SlotMachine from "@/components/SlotMachine"

export default function Home() {
  return (
    <main className="flex min-h-screen min-h-dvh flex-col items-center justify-center p-4 sm:p-8 landscape:min-h-0 landscape:h-dvh landscape:justify-center landscape:p-2">
      <div className="relative w-full h-full landscape:flex landscape:flex-col landscape:min-h-0 landscape:max-h-dvh">
        <SlotMachine />
      </div>
    </main>
  )
}
