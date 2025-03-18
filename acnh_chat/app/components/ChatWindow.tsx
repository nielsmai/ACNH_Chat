"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Mistral } from "@mistralai/mistralai";
import { villagers } from "@/app/data/villagers";

const apiKey = process.env.NEXT_PUBLIC_MISTRAL_API_KEY;
const client = new Mistral({ apiKey: apiKey });

export default function ChatWindow() {
    const [userName, setUserName] = useState("");
    const [islandName, setIslandName] = useState("");
    const [isSetupComplete, setIsSetupComplete] = useState(false);
    const [selectedNpc, setSelectedNpc] = useState("aurora");
    const [messages, setMessages] = useState<Record<string, { text: string; sender: "user" | "npc"; npcName?: string }[]>>({
        aurora: [],
        goose: [],
    });
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Auto-scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const startChat = () => {
        if (userName.trim() && islandName.trim()) {
            setIsSetupComplete(true);
        }
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages[selectedNpc], { text: input, sender: "user" }];
        setMessages((prevMessages) => ({
            ...prevMessages,
            [selectedNpc]: newMessages as { text: string; sender: "user" | "npc"; npcName?: string }[],
        }));
        setInput("");

        try {
            const { name, catchphrase, personalityTraits, personalityDescription } = villagers[selectedNpc];

            // Get the last few messages to provide context but keep things short
            const chatHistory: ({ role: "user" | "assistant"; content: string })[] = messages[selectedNpc].slice(-3).map((msg) => ({
                role: msg.sender === "user" ? "user" : "assistant",
                content: msg.text,
            }));

            const chatResponse = await client.chat.complete({
                model: "mistral-large-latest",
                messages: [
                    {
                        role: "system", content: `You are ${name}, an Animal Crossing villager with the catchphrase "${catchphrase}".
                        You have the following personality traits: ${personalityTraits.join(", ")}.
                        Your personality description is: ${personalityDescription}.
                        The user’s name is ${userName}, and they are from ${islandName} island.
                        Address them warmly, use your catchphrase occasionally, and reflect your personality in your responses.
                        Keep responses **short and friendly**.` },
                    ...chatHistory, // Include previous messages
                    { role: "user", content: input }, // User's latest message
                ],
            });

            const npcMessage = chatResponse.choices?.[0]?.message?.content || "Hmm... I don't know what to say! 🍃";

            let animatedText = "";
            setMessages((prevMessages) => ({
                ...prevMessages,
                [selectedNpc]: [
                    ...prevMessages[selectedNpc],
                    { text: "", sender: "npc", npcName: selectedNpc }, // Placeholder for animation
                ],
            }));

            for (let i = 0; i < npcMessage.length; i++) {
                setTimeout(() => {
                    animatedText += npcMessage[i];
                    setMessages((prevMessages) => {
                        const updatedMessages = [...prevMessages[selectedNpc]];
                        updatedMessages[updatedMessages.length - 1] = { text: animatedText, sender: "npc", npcName: selectedNpc };

                        return {
                            ...prevMessages,
                            [selectedNpc]: updatedMessages,
                        };
                    });
                }, i * 30);
            }
        } catch (error) {
            console.error("Error fetching NPC response:", error);
            setMessages((prevMessages) => ({
                ...prevMessages,
                [selectedNpc]: [
                    ...prevMessages[selectedNpc],
                    { text: "Oops! I had trouble thinking of something to say. Try again? 🍃", sender: "npc", npcName: selectedNpc },
                ],
            }));
        }
    };

    // Clears all chat messages for all NPCs
    const clearAllChats = () => {
        setMessages({
            aurora: [],
            goose: [],
        });
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-4 w-full max-w-lg flex flex-col h-[550px] border-4 border-[#96C291] relative">
            {/* Start Screen */}
            {!isSetupComplete ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <h1
                        className="text-3xl font-normal leading-[1.167] text-[#D8A32A]"
                        style={{
                            fontFamily: "'Baloo 2', 'FinkHeavy', -apple-system, BlinkMacSystemFont, 'Segoe UI'",
                        }}
                    >
                        Welcome to ACNH Chat! 🌿
                    </h1>

                    <input
                        type="text"
                        placeholder="Enter your name"
                        className="border p-2 rounded-md w-3/4 text-gray-900 placeholder-gray-700 text-center"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Enter your island name"
                        className="border p-2 rounded-md w-3/4 text-gray-900 placeholder-gray-700 text-center"
                        value={islandName}
                        onChange={(e) => setIslandName(e.target.value)}
                    />
                    <button className="bg-[#96C291] text-white px-4 py-2 rounded-md hover:bg-[#7CA377]" onClick={startChat}>
                        Start Chat
                    </button>
                </div>
            ) : (
                <>
                    {/* Header with NPC Selection & Clear Button */}
                    <div className="flex justify-between items-center mb-4">
                        {/* NPC Selection */}
                        <div className="flex gap-4">
                            {Object.entries(villagers).map(([npc, { img, name }]) => (
                                <button
                                    key={npc}
                                    onClick={() => setSelectedNpc(npc)}
                                    className={`flex flex-col items-center ${selectedNpc === npc ? "border-2 border-blue-500 rounded-lg p-1" : ""}`}
                                >
                                    <Image src={img} alt={name} width={50} height={50} className="rounded-full" />
                                    <span className="text-sm text-[#3E664D] font-semibold">{name}</span>
                                </button>
                            ))}
                        </div>

                        {/* Clear Chat Button */}
                        <button
                            onClick={clearAllChats}
                            className="bg-red-300 text-white px-3 py-1 rounded-md text-sm hover:bg-red-400"
                        >
                            Clear All
                        </button>
                    </div>

                    {/* Messages */}
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto space-y-4 p-2 border rounded-md">
                        {messages[selectedNpc].map((msg, index) => {

                            // Function to convert Tailwind color class to CSS color
                            const tailwindToCssColor = (tailwindClass: string) => {
                                switch (tailwindClass) {
                                    case "bg-purple-300":
                                        return "#d8b4fe"; // Corresponding hex color
                                    // Add more cases for other Tailwind color classes as needed
                                    default:
                                        return "gray"; // Default color if not found
                                }
                            };

                            const backgroundColor = msg.npcName ? tailwindToCssColor(villagers[msg.npcName]?.bubbleColor) : "gray";

                            return (
                                <div key={index} className={`flex items-center ${msg.sender === "user" ? "justify-end" : "justify-start"} relative`}>

                                    {/* Villager name bubble */}
                                    {msg.sender === "npc" && msg.npcName && (
                                        <div
                                            className={`absolute -top-5 left-2 px-2 py-1 text-xs rounded-full text-white`}
                                            style={{
                                                backgroundColor: backgroundColor,
                                                padding: "4px 8px", // Add padding to make sure it shows up properly
                                                borderRadius: "12px", // Rounded edges for the name bubble
                                                zIndex: 10, // Ensure it appears on top
                                                transform: "rotate(-5deg)", //Tile the name bubble
                                            }}
                                        >
                                            {villagers[msg.npcName]?.name}
                                        </div>
                                    )}

                                    {/* Chat bubble */}
                                    <div
                                        className="p-3 rounded-3xl border-4"
                                        style={{
                                            backgroundColor: "rgb(255, 250, 229)",
                                            color: "#74664B",
                                            borderColor: msg.sender === "user" ? "#F5D491" : villagers[msg.npcName!]?.bubbleColor || "#C8E090",
                                            fontFamily: "'Raleway', sans-serif",
                                            fontWeight: "800",
                                            fontSize: "1rem",
                                            letterSpacing: "0.2px",
                                            lineHeight: "1.8rem",
                                        }}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="flex gap-2 mt-2">
                        <input
                            className="border rounded-md p-2 flex-1 placeholder-gray-600 text-gray-900"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            placeholder="Type your message..."
                        />
                        <button className="bg-[#96C291] text-white px-4 py-2 rounded-md" onClick={sendMessage}>
                            Send
                        </button>
                    </div>
                </>
            )}

        </div>
    );
}