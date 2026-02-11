import SlotMachine from "@/components/SlotMachine"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="relative w-full">
        <SlotMachine />
      </div>
    </main>
  )
}

