import Navbar from "@/components/Navbar";
import Landing from "./(nondashboard)/landing/page";

export default function Home() {
  return (
    <div className="w-full h-full">
      <Navbar />
      <main className="flex flex-col w-full h-full">
        <Landing />
      </main>
    </div>
  );
}