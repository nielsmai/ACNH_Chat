"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Mistral } from "@mistralai/mistralai";

const npcStyles: Record<
    string,
    { img: string; bubbleColor: string; name: string; catchphrase: string; personalityTraits: string[], personalityDescription: string }
> = {
    aurora: {
        img: "/characters/Aurora_NH_Villager_Icon.png",
        bubbleColor: "bg-purple-300",
        name: "Aurora",
        catchphrase: "b-b-baby!",
        personalityTraits: ["Normal", "Kind", "Female"],
        personalityDescription: "As a normal villager, Aurora will appear friendly and hospitable towards the player and other villagers. Like other normal villagers, she will have an unseen obsession with hygiene and cleanliness, which she mentions when the player visits her in her home. Other than her hygiene interests, she will appear neutral and open-minded when discussing hobbies. ",
    },
    goose: {
        img: "/characters/Goose_NH_Villager_Icon.png",
        bubbleColor: "bg-red-300",
        name: "Goose",
        catchphrase: "buh-kay!",
        personalityTraits: ["Jock", "Sporty", "Male"],
        personalityDescription: "As a jock villager, Goose is energetic and has an interest in physical fitness and activity. He often talks about exercise or sports and may brag about his physical fitness. While often friendly to the player, he may comment on their fitness. ",
    },
};

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
            const { name, catchphrase, personalityTraits, personalityDescription } = npcStyles[selectedNpc];

            // Get the last few messages to provide context but keep things short
            const chatHistory: ({ role: "user" | "assistant"; content: string })[] = messages[selectedNpc].slice(-3).map((msg) => ({
                role: msg.sender === "user" ? "user" : "assistant",
                content: msg.text,
            }));

            const chatResponse = await client.chat.complete({
                model: "mistral-large-latest",
                messages: [
                  { role: "system", content: `You are ${name}, an Animal Crossing villager with the catchphrase "${catchphrase}".
                      You have the following personality traits: ${personalityTraits.join(", ")}.
                      Your personality description is: ${personalityDescription}.
                      The user’s name is ${userName}, and they are from ${islandName} island.
                      Address them warmly, use your catchphrase occasionally, and reflect your personality in your responses.
                      Keep responses **short and friendly**.` },
                  ...chatHistory, // Include previous messages
                  { role: "user", content: input }, // User's latest message
                ],
              });

            const npcMessage = typeof chatResponse.choices?.[0]?.message?.content === "string"
                ? chatResponse.choices[0].message.content
                : "Hmm... I don't know what to say! 🍃";

            setMessages((prevMessages) => ({
                ...prevMessages,
                [selectedNpc]: [
                    ...prevMessages[selectedNpc],
                    { text: npcMessage, sender: "npc", npcName: selectedNpc },
                ],
            }));
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
        <div className="bg-white shadow-lg rounded-lg p-4 w-full max-w-lg flex flex-col h-[550px]">
            {/* Start Screen */}
            {!isSetupComplete ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <h1 className="text-xl font-bold">Welcome to ACNH Chat! 🌿</h1>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        className="border p-2 rounded-md w-3/4"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Enter your island name"
                        className="border p-2 rounded-md w-3/4"
                        value={islandName}
                        onChange={(e) => setIslandName(e.target.value)}
                    />
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={startChat}>
                        Start Chat
                    </button>
                </div>
            ) : (
                <>
                    {/* Header with NPC Selection & Clear Button */}
                    <div className="flex justify-between items-center mb-4">
                        {/* NPC Selection */}
                        <div className="flex gap-4">
                            {Object.entries(npcStyles).map(([npc, { img, name }]) => (
                                <button
                                    key={npc}
                                    onClick={() => setSelectedNpc(npc)}
                                    className={`flex flex-col items-center ${selectedNpc === npc ? "border-2 border-blue-500 rounded-lg p-1" : ""}`}
                                >
                                    <Image src={img} alt={name} width={50} height={50} className="rounded-full" />
                                    <span className="text-sm">{name}</span>
                                </button>
                            ))}
                        </div>

                        {/* Clear Chat Button */}
                        <button
                            onClick={clearAllChats}
                            className="bg-red-500 text-white px-3 py-1 rounded-md text-sm"
                        >
                            Clear All
                        </button>
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
                                    className={`p-3 rounded-lg max-w-[75%] ${msg.sender === "user"
                                            ? "bg-blue-500 text-white"
                                            : npcStyles[msg.npcName!]?.bubbleColor || "bg-gray-200"
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {/* Auto-scroll anchor */}
                        <div ref={messagesEndRef} />
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
                </>
            )}
        </div>
    );
}