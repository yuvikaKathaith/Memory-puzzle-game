import MemoryGame from "@/components/MemoryGame";


export default function Home() {
  return (
    <main className="bg-linear-to-r  from-purple-200 to-blue-100 flex min-h-screen flex-col items-center justify-center p-4">
      <MemoryGame />
    </main>
  );
}
