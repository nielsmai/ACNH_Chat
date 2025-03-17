"use client";
import { useState } from "react";
import Image from "next/image";

const npcStyles: Record<string, { img: string; bubbleColor: string; name: string }> = {
  aurora: {
    img: "/characters/Aurora_NH_Villager_Icon.png",
    bubbleColor: "bg-purple-300",
    name: "Aurora",
  },
  goose: {
    img: "/characters/Goose_NH_Villager_Icon.png",
    bubbleColor: "bg-red-300",
    name: "Goose",
  },
};

export default function ChatWindow() {
  const [selectedNpc, setSelectedNpc] = useState("aurora");
  const [messages, setMessages] = useState<Record<string, { text: string; sender: "user" | "npc"; npcName?: string }[]>>({
    aurora: [],
    goose: [],
  });
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    // Store the message for the selected NPC
    const newMessages = [...messages[selectedNpc], { text: input, sender: "user" as "user" }];
    setMessages((prevMessages) => ({
      ...prevMessages,
      [selectedNpc]: newMessages,
    }));
    setInput("");

    // Simulate NPC response
    setTimeout(() => {
      setMessages((prevMessages) => ({
        ...prevMessages,
        [selectedNpc]: [
          ...prevMessages[selectedNpc],
          { text: `Hello! I'm ${npcStyles[selectedNpc].name}! 🍃`, sender: "npc" as "npc", npcName: selectedNpc },
        ],
      }));
    }, 1000);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 w-full max-w-lg flex flex-col h-[550px]">
      {/* NPC Selection */}
      <div className="flex justify-center gap-4 mb-4">
        {Object.entries(npcStyles).map(([npc, { img, name }]) => (
          <button
            key={npc}
            onClick={() => {
              setSelectedNpc(npc);
            }}
            className={`flex flex-col items-center ${selectedNpc === npc ? "border-2 border-blue-500 rounded-lg p-1" : ""}`}
          >
            <Image src={img} alt={name} width={50} height={50} className="rounded-full" />
            <span className="text-sm">{name}</span>
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-2 border rounded-md">
        {messages[selectedNpc].map((msg, index) => (
          <div key={index} className={`flex items-center ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            {msg.sender === "npc" && msg.npcName && (
              <Image
                src={npcStyles[msg.npcName]?.img || ""}
                alt={msg.npcName}
                width={40}
                height={40}
                className="rounded-full mr-2"
              />
            )}
            <div
              className={`p-3 rounded-lg max-w-[75%] ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white"
                  : npcStyles[msg.npcName!]?.bubbleColor || "bg-gray-200"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-2">
        <input
          className="border rounded-md p-2 flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}