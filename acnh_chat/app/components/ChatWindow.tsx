"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Mistral } from "@mistralai/mistralai";
import { villagers } from "@/app/data/villagers";

// API Key for the Mistral API
const apiKey = process.env.NEXT_PUBLIC_MISTRAL_API_KEY;
const client = new Mistral({ apiKey: apiKey });

const MESSAGE_HISTORY_LIMIT = 8; // Number of previous messages to include in the chat history

export default function ChatWindow() {
    // User's name and island name, from the start screen
    const [userName, setUserName] = useState("");
    const [islandName, setIslandName] = useState("");
    // Setup state (whether the user has entered their name and island name)
    const [isSetupComplete, setIsSetupComplete] = useState(false);
    // Selected NPC (the villager the user is currently chatting with)
    const [selectedNpc, setSelectedNpc] = useState(Object.keys(villagers)[0] || "");
    // Chat messages for each NPC
    const [messages, setMessages] = useState<Record<string, { text: string; sender: "user" | "npc"; npcName?: string }[]>>(
        Object.keys(villagers).reduce((acc, villager) => {
            acc[villager] = []; // Initialize empty messages for each villager
            return acc;
        }, {} as Record<string, { text: string; sender: "user" | "npc"; npcName?: string }[]>)
    );

    // User's input message
    const [input, setInput] = useState("");

    // Reference to the last message element for auto-scrolling
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Auto-scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Start the chat when the user enters their name and island name, ensuring they are not empty
    const startChat = () => {
        if (userName.trim() && islandName.trim()) {
            setIsSetupComplete(true);
        }
    };

    // Send a message to the selected NPC and get a response from the Mistral API
    const sendMessage = async () => {
        if (!input.trim()) return;

        // Add the user's message to the chat
        const newMessages = [...messages[selectedNpc], { text: input, sender: "user" }];
        setMessages((prevMessages) => ({
            ...prevMessages,
            [selectedNpc]: newMessages as { text: string; sender: "user" | "npc"; npcName?: string }[],
        }));
        setInput("");

        try {
            const { name, catchphrase, personalityTraits, personalityDescription } = villagers[selectedNpc];

            // Get the last few messages to provide context but keep things short
            const chatHistory: ({ role: "user" | "assistant"; content: string })[] = messages[selectedNpc]
            .slice(-MESSAGE_HISTORY_LIMIT)
            .map((msg) => ({
                role: msg.sender === "user" ? "user" : "assistant",
                content: msg.text,
            }));
            
            // Generate a response from the Mistral API
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

            // Typewriter effect for the NPC's response to mimic the in-game chat window
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
                }, i * 30); // Delay each character by 30ms
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
        setMessages(Object.keys(villagers).reduce((acc, villager) => {
            acc[villager] = [];
            return acc;
        }, {} as Record<string, { text: string; sender: "user" | "npc"; npcName?: string }[]>));
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-4 w-full max-w-lg flex flex-col h-[550px] border-4 border-[#96C291] relative">
            {/* Start Screen */}
            {!isSetupComplete ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                    {/* Welcome Title */}
                    <h1
                        className="text-3xl font-normal leading-[1.167] text-[#D8A32A]"
                        style={{
                            fontFamily: "'Baloo 2', 'FinkHeavy', -apple-system, BlinkMacSystemFont, 'Segoe UI'",
                        }}
                    >
                        Welcome to ACNH Chat! 🌿
                    </h1>
    
                    {/* User Name Input */}
                    <input
                        type="text"
                        placeholder="Enter your name"
                        className="border p-2 rounded-md w-3/4 text-gray-900 placeholder-gray-700 text-center"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                    />
    
                    {/* Island Name Input */}
                    <input
                        type="text"
                        placeholder="Enter your island name"
                        className="border p-2 rounded-md w-3/4 text-gray-900 placeholder-gray-700 text-center"
                        value={islandName}
                        onChange={(e) => setIslandName(e.target.value)}
                    />
    
                    {/* Start Chat Button */}
                    <button className="bg-[#96C291] text-white px-4 py-2 rounded-md hover:bg-[#7CA377]" onClick={startChat}>
                        Start Chat
                    </button>
                </div>
            ) : (
                <>
                    {/* Header Section: NPC Selection & Clear Button */}
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
    
                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto space-y-4 p-2 border rounded-md">
                        {messages[selectedNpc].map((msg, index) => {
                            const backgroundColor = msg.npcName ? villagers[msg.npcName]?.bubbleColor : "gray";
    
                            return (
                                <div key={index} className={`flex items-center ${msg.sender === "user" ? "justify-end" : "justify-start"} relative`}>
                                    
                                    {/* Villager Name Bubble (Above NPC Messages) */}
                                    {msg.sender === "npc" && msg.npcName && (
                                        <div
                                            className={`absolute -top-5 left-2 px-2 py-1 text-xs rounded-full text-white`}
                                            style={{
                                                backgroundColor: backgroundColor,
                                                padding: "4px 8px",
                                                borderRadius: "12px",
                                                zIndex: 10, // Ensures it appears on top
                                                transform: "rotate(-5deg)", // Slight rotation to mimic in-game chat
                                            }}
                                        >
                                            {villagers[msg.npcName]?.name}
                                        </div>
                                    )}
    
                                    {/* Chat Bubble (Message Content) */}
                                    <div
                                        className="p-3 rounded-3xl border-4"
                                        style={{
                                            backgroundColor: "rgb(255, 250, 229)", // Soft warm background for all messages
                                            color: "#74664B", // Default text color
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
                        {/* Auto-scroll anchor to keep messages at the bottom */}
                        <div ref={messagesEndRef} />
                    </div>
    
                    {/* Input Field & Send Button */}
                    <div className="flex gap-2 mt-2">
                        {/* Message Input */}
                        <input
                            className="border rounded-md p-2 flex-1 placeholder-gray-600 text-gray-900"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            placeholder="Type your message..."
                        />
    
                        {/* Send Button */}
                        <button className="bg-[#96C291] text-white px-4 py-2 rounded-md" onClick={sendMessage}>
                            Send
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}