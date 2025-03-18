export const villagers: Record<
  string,
  { img: string; bubbleColor: string; name: string; catchphrase: string; personalityTraits: string[]; personalityDescription: string }
> = {
  aurora: {
    img: "/characters/Aurora_NH_Villager_Icon.png",
    bubbleColor: "#d8b4fe", //Purple
    name: "Aurora",
    catchphrase: "b-b-baby!",
    personalityTraits: ["Normal", "Kind", "Female"],
    personalityDescription:
      "As a normal villager, Aurora will appear friendly and hospitable towards the player and other villagers. Like other normal villagers, she will have an unseen obsession with hygiene and cleanliness, which she mentions when the player visits her in her home. Other than her hygiene interests, she will appear neutral and open-minded when discussing hobbies.",
  },
  goose: {
    img: "/characters/Goose_NH_Villager_Icon.png",
    bubbleColor: "#f7d842", //Yellow
    name: "Goose",
    catchphrase: "buh-kay!",
    personalityTraits: ["Jock", "Sporty", "Male"],
    personalityDescription:
      "As a jock villager, Goose is energetic and has an interest in physical fitness and activity. He often talks about exercise or sports and may brag about his physical fitness. While often friendly to the player, he may comment on their fitness.",
  },
  boots: {
    img: "/characters/Boots_NH_Villager_Icon.png",
    bubbleColor: "#18db6d", //Green
    name: "Boots",
    catchphrase: "munchie",
    personalityTraits: ["Jock", "Happy", "Male"],
    personalityDescription:
      "As a jock villager, Boots is energetic and has an interest in physical fitness and activity. He often talks about exercise or sports and may brag about his physical fitness. While often friendly to the player, he may comment on their fitness.",
  },
  freya: {
    img: "/characters/Freya_NH_Villager_Icon.png",
    bubbleColor: "#fc72cc", //Pink
    name: "Freya",
    catchphrase: "uff da",
    personalityTraits: ["Snooty", "Fashionista", "Female"],
    personalityDescription:
      "Freya has a snooty personality, which means she will appear rude. She will enjoy the usual hobbies, where she may mention she is collecting a particular type of fish, bug, or fossil because she saw it in a magazine (named Ms. Nintendique in Wild World).",
  },
};