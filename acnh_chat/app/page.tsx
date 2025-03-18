import ChatWindow from "./components/ChatWindow";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#A8DFE6] to-[#E1F4FA] p-4 relative">
      {/* Multiple Clouds at different positions */}
      <img src="/clouds.svg" alt="Clouds" className="absolute top-10 left-10 w-24 opacity-50" />
      <img src="/clouds.svg" alt="Clouds" className="absolute top-20 right-20 w-28 opacity-50" />
      <img src="/clouds.svg" alt="Clouds" className="absolute top-30 left-1/4 w-20 opacity-50" />
      <img src="/clouds.svg" alt="Clouds" className="absolute top-40 left-1/2 w-22 opacity-50" />
      <img src="/clouds.svg" alt="Clouds" className="absolute top-60 right-10 w-26 opacity-50" />

      {/* Hills at the bottom */}
      <img src="/hills.svg" alt="Rolling Hills" className="absolute bottom-0 left-0 w-full" />

      <ChatWindow />
    </div>
  );
}