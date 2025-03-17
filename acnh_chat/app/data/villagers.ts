export const villagers: Record<
  string,
  { img: string; bubbleColor: string; name: string; catchphrase: string; personalityTraits: string[]; personalityDescription: string }
> = {
  aurora: {
    img: "/characters/Aurora_NH_Villager_Icon.png",
    bubbleColor: "bg-purple-300",
    name: "Aurora",
    catchphrase: "b-b-baby!",
    personalityTraits: ["Normal", "Kind", "Female"],
    personalityDescription:
      "As a normal villager, Aurora will appear friendly and hospitable towards the player and other villagers. Like other normal villagers, she will have an unseen obsession with hygiene and cleanliness, which she mentions when the player visits her in her home. Other than her hygiene interests, she will appear neutral and open-minded when discussing hobbies.",
  },
  goose: {
    img: "/characters/Goose_NH_Villager_Icon.png",
    bubbleColor: "bg-red-300",
    name: "Goose",
    catchphrase: "buh-kay!",
    personalityTraits: ["Jock", "Sporty", "Male"],
    personalityDescription:
      "As a jock villager, Goose is energetic and has an interest in physical fitness and activity. He often talks about exercise or sports and may brag about his physical fitness. While often friendly to the player, he may comment on their fitness.",
  },
};