export const dialogueDBJSON = `{
  "dia_guard2": [
    {
      "portrait": "murloc_orange",
      "goto": 2,
      "speaker": "Murgul",
      "text": "......",
      "id": 1,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_bombs_new": [
    {
      "portrait": "murloc_orange",
      "goto": 2,
      "speaker": "Zurgul",
      "text": "Hey you! Over here!",
      "id": 1,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 3,
      "speaker": "$player",
      "text": "Huh?",
      "id": 2,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_orange",
      "goto": 4,
      "speaker": "Zurgul",
      "text": "I'm working on a top secret project. Help me out and I'll let you see!",
      "id": 3,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_orange",
      "goto": 5,
      "speaker": "Zurgul",
      "text": "Bring me 5 Piles of Manure from the boars to the east and I'll show you my new invention.",
      "id": 4,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_q_gizbo_goods": [
    {
      "portrait": "murloc_blue",
      "goto": 2,
      "speaker": "$player",
      "text": "Chief Gizbo said you might need some help.",
      "id": 1,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_green",
      "goto": 3,
      "speaker": "Dinga",
      "text": "Chief Gizbo sent you? Oh by my lucky fin! Our food stores have run empty and we need to restock.",
      "id": 2,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 4,
      "speaker": "$player",
      "text": "What can I do to help?",
      "id": 3,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_green",
      "goto": 5,
      "speaker": "Dinga",
      "text": "The boars to the west of the camp are a fine source of meat. Bring me 18 Chunks of Boar Meat. That should be enough to feed the camp.",
      "id": 4,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_green",
      "goto": 6,
      "speaker": "Dinga",
      "text": "You look like a strong hunter. The boars in Red Cloud Mesa to the east are rabid and more dangerous. Nothing you can't handle, I'm sure!",
      "id": 5,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_guardhalt": [
    {
      "portrait": "murloc_green",
      "goto": 2,
      "speaker": "Guard",
      "text": "Halt! Chief Gizbo wishes to speak to you.",
      "id": 1,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_iq_gizbo_goods": [
    {
      "portrait": "murloc_green",
      "goto": 2,
      "speaker": "Dinga",
      "text": "How goes the hunting? Did you bring back any meat? You can find boars to the east and west of the camp.",
      "id": 1,
      "align": "left",
      "type": "text"
    }
  ],
  "dia_gurgul": [
    {
      "goto": 2,
      "event": "gurgul",
      "type": "hijack",
      "id": 1
    }
  ],
  "dia_arena7": [
    {
      "portrait": "murloc_white",
      "goto": 2,
      "speaker": "Harry Halfbreed",
      "text": "Your next challenger is known for his cunning and unmatched agility. Best be on your guard from this crafty yellow-fin!",
      "id": 1,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 3,
      "speaker": "Harry Halfbreed",
      "text": "Go on through the arena entrance when you're ready to fight.",
      "id": 2,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_spirithealer": [
    {
      "portrait": "spirit_healer",
      "goto": 2,
      "speaker": "Spirit Healer",
      "text": "It is not yet your time, I shall aid your journey back to the realm of the living.",
      "id": 1,
      "align": "right",
      "type": "text"
    },
    {
      "goto": 3,
      "event": "spirit_healer",
      "type": "event",
      "id": 2
    }
  ],
  "dia_quillboar_camp_new": [
    {
      "portrait": "murloc_white",
      "goto": 2,
      "speaker": "Chief Gizbo",
      "text": "Commander Slen praises your ability in combat, $class. I have one final task for you to complete.",
      "id": 1,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 3,
      "speaker": "Chief Gizbo",
      "text": "It's only a matter of time before the quilboar gather up their forces for another assault. Now is the time to attack.",
      "id": 2,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 4,
      "speaker": "Chief Gizbo",
      "text": "They are being led by the Earthcaller they call Thorntusk. He is a foul spirit that finds nothing but unrest in peaceful times.",
      "id": 3,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 5,
      "speaker": "Chief Gizbo",
      "text": "Put an end to this vile sorcerer's reign, $player.",
      "id": 4,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 6,
      "speaker": "Chief Gizbo",
      "text": "Commander Slen can take you to the quilboar hideout. Talk to him when you are ready to depart.",
      "id": 5,
      "align": "right",
      "type": "text"
    },
    {
      "goto": 7,
      "event": "complete_quest_002",
      "type": "event",
      "id": 6
    }
  ],
  "dia_cq_gizbo_goods": [
    {
      "portrait": "murloc_green",
      "goto": 2,
      "speaker": "Dinga",
      "text": "What fine cuts! Roast them? Boil them? Oh the possibilities!",
      "id": 1,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_green",
      "goto": 3,
      "speaker": "Dinga",
      "text": "Thank you, $player. Oh and feel free to browse my goods.",
      "id": 2,
      "align": "right",
      "type": "text"
    },
    {
      "goto": 4,
      "event": "light_torch_general",
      "type": "event",
      "id": 3
    }
  ],
  "dia_q_gizbo_armor_inc": [
    {
      "portrait": "murloc_green",
      "goto": 2,
      "speaker": "Jekel",
      "text": "What's taking so long? Head to Red Cloud Mesa and bring back my branches from those wretched carrions!",
      "id": 1,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_arena_inc": [
    {
      "portrait": "murloc_white",
      "goto": 2,
      "speaker": "Harry Halfbreed",
      "text": "What are you still doing out here? Go on through the entrance and fight!",
      "id": 1,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_gurgul1": [
    {
      "portrait": "murloc_orange",
      "goto": 2,
      "speaker": "Gurgul",
      "text": "The carrion bird glides in the air so majestically! I dream of murlocs with wings. They say some day we'll all fly. What do you think?",
      "id": 1,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "align": "left",
      "id": 2,
      "speaker": "$player",
      "type": "choice",
      "choices": [
        [
          "Hard to say...",
          3
        ],
        [
          "That's impossible.",
          4
        ]
      ]
    },
    {
      "portrait": "murloc_orange",
      "goto": 0,
      "speaker": "Gurgul",
      "text": "There's always hope, right?",
      "id": 3,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_orange",
      "goto": 0,
      "speaker": "Gurgul",
      "text": "I guess you're right...",
      "id": 4,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_q003_inc": [
    {
      "portrait": "murloc_white",
      "goto": 2,
      "speaker": "Chief Gizbo",
      "text": "Talk to Gomsil the engineer. He might be able to locate your assassin. You can find him in his observatory to the east.",
      "id": 1,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_arena2": [
    {
      "portrait": "murloc_white",
      "goto": 2,
      "speaker": "Harry Halfbreed",
      "text": "The crowd loves you, $class! Keep it up.",
      "id": 1,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 3,
      "speaker": "Harry Halfbreed",
      "text": "Your next challenge has razor sharp claws and an insatiable appetite for murloc flesh. Get ready to trade blows with a Carrion Vulture!",
      "id": 2,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 4,
      "speaker": "Harry Halfbreed",
      "text": "Go on through the arena entrance when you're ready to fight.",
      "id": 3,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_beat_arena": [
    {
      "portrait": "murloc_white",
      "goto": 2,
      "speaker": "Harry Halfbreed",
      "text": "Congratulations, Arena Champion! Your might truly knows no bounds!",
      "id": 1,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_q002_new": [
    {
      "portrait": "murloc_white",
      "goto": 2,
      "speaker": "Chief Gizbo",
      "text": "You must be $player of Camp Brakil. It is an honor to meet a warrior of your stature.",
      "id": 1,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 3,
      "speaker": "$player",
      "text": "Camp Brakil is no more. The camp is destroyed, and the chief assassinated.",
      "id": 2,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 4,
      "speaker": "Chief Gizbo",
      "text": "So I have heard... Lekon told me you wish to seek our aid in your quest for vengeance.",
      "id": 3,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 5,
      "speaker": "$player",
      "text": "I must avenge Brakil's death and rescue his daughter. Where is the assassin hiding?",
      "id": 4,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 6,
      "speaker": "Chief Gizbo",
      "text": "I have sympathy for your cause. Brakil was an honorable murloc with a truly unique vision for the future of our species.",
      "id": 5,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 7,
      "speaker": "Chief Gizbo",
      "text": "Unfortunately, I cannot spare any resources at this time. Our camp has also been destroyed. Not by the hand of your assassin, but by a foul being that even I cannot understand.",
      "id": 6,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 8,
      "speaker": "$player",
      "text": "I see...",
      "id": 7,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 9,
      "speaker": "Chief Gizbo",
      "text": "Our finest scouts are out gathering materials to build with. You will have to wait until they return.",
      "id": 8,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 10,
      "speaker": "$player",
      "text": "Let me help you rebuild the camp. In return, I would like any information you have on Brakil's assassin.",
      "id": 9,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 11,
      "speaker": "Chief Gizbo",
      "text": "That is a fair trade. The village cook, Dinga, needs help. She can be found to the west.",
      "id": 10,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 12,
      "speaker": "Chief Gizbo",
      "text": "Jekel the blacksmith is also in need of aid. He can be found to the east of here.",
      "id": 11,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 13,
      "speaker": "Chief Gizbo",
      "text": "Come back here when you are finished and we can see what we can find out about the assassin of yours.",
      "id": 12,
      "align": "right",
      "type": "text"
    },
    {
      "goto": 14,
      "event": "unblock_walls_chief",
      "type": "event",
      "id": 13
    }
  ],
  "dia_lab_door": [
    {
      "goto": 2,
      "event": "lab_door",
      "type": "hijack",
      "id": 1
    }
  ],
  "dia_q_gizbo_alch_com": [
    {
      "portrait": "murloc_blue",
      "goto": 2,
      "speaker": "$player",
      "text": "I have your blood, alchemist.",
      "id": 1,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_green",
      "goto": 3,
      "speaker": "Arkin",
      "text": "Excellent. Now I'll just add it to the mix and... Voila! Beautiful in its simplicity.",
      "id": 2,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_green",
      "goto": 4,
      "speaker": "Arkin",
      "text": "Here, take this sample. And please, feel free to browse my inventory.",
      "id": 3,
      "align": "right",
      "type": "text"
    },
    {
      "goto": 5,
      "event": "light_torch_alch",
      "type": "event",
      "id": 4
    }
  ],
  "dia_quillboar_shaman": [
    {
      "portrait": "murloc_orange",
      "goto": 2,
      "speaker": "Gurgul",
      "text": "Help!",
      "id": 1,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "quillboar_shaman",
      "goto": 3,
      "speaker": "Earthcaller Thorntusk",
      "text": "You are not worthy of my presence. Guards, seize him!",
      "id": 2,
      "align": "right",
      "type": "text"
    },
    {
      "goto": 4,
      "event": "battle_boar2",
      "type": "hijack",
      "id": 3
    },
    {
      "portrait": "quillboar_shaman",
      "goto": 5,
      "speaker": "Earthcaller Thorntusk",
      "text": "Gah! Such insolence! I'll deal with you myself!",
      "id": 4,
      "align": "right",
      "type": "text"
    },
    {
      "goto": 6,
      "event": "music_murlocbattle",
      "type": "event",
      "id": 5
    },
    {
      "goto": 7,
      "event": "boss_defeated",
      "type": "event",
      "id": 6
    },
    {
      "goto": 8,
      "event": "battle_thorntusk",
      "type": "hijack",
      "id": 7
    },
    {
      "goto": 9,
      "event": "stop_music",
      "type": "event",
      "id": 8
    },
    {
      "goto": 10,
      "event": "complete_quest_quillboar_camp",
      "type": "event",
      "id": 9
    },
    {
      "goto": 11,
      "event": "get_quest_best_defense2",
      "type": "event",
      "id": 10
    }
  ],
  "dia_arena_final": [
    {
      "portrait": "murloc_white",
      "goto": 2,
      "speaker": "Harry Halfbreed",
      "text": "--show! By far the best challenger we've had yet!",
      "id": 1,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 3,
      "speaker": "$player",
      "text": "Erm.. Are you alright?",
      "id": 2,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 4,
      "speaker": "Harry Halfbreed",
      "text": "Sure! Why wouldn't I be?",
      "id": 3,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 5,
      "speaker": "$player",
      "text": "Nevermind...",
      "id": 4,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 6,
      "speaker": "Harry Halfbreed",
      "text": "Congratulations, Arena Champion! Your might truly knows no bounds!",
      "id": 5,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_nightwatch_new": [
    {
      "portrait": "murloc_green",
      "goto": 2,
      "speaker": "Slen",
      "text": "I hear you've been making quite a name for yourself, outsider.",
      "id": 1,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_green",
      "goto": 3,
      "speaker": "Slen",
      "text": "As commander, it is my duty to make sure our camp is safe.",
      "id": 2,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_green",
      "goto": 4,
      "speaker": "Slen",
      "text": "Quilboars have set up camp not too far from here. Our scouts have spotted a whole army of them mere minutes away. They are planning an attack and we need every able murloc.",
      "id": 3,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_green",
      "goto": 5,
      "speaker": "Slen",
      "text": "Gather any supplies you might need and talk to me when you're ready to fight.",
      "id": 4,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_leave_rcm": [
    {
      "portrait": "murloc_blue",
      "goto": 2,
      "speaker": "$player",
      "text": "I shouldn't wander off too far from the camp.",
      "id": 1,
      "align": "left",
      "type": "text"
    }
  ],
  "dia_sign1": [
    {
      "portrait": "sign",
      "goto": 2,
      "speaker": " ",
      "text": "Camp Gizbo -- East",
      "id": 1,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 3,
      "speaker": "$player",
      "text": "These plains look dangerous. I should head east to Camp Gizbo before it gets dark.",
      "id": 2,
      "align": "left",
      "type": "text"
    }
  ],
  "dia_gurgul_saved": [
    {
      "portrait": "murloc_orange",
      "goto": 2,
      "speaker": "Gurgul",
      "text": "All hail $player! Hero of heroes! Mightiest of all $classs!",
      "id": 1,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_new_arena": [
    {
      "goto": 2,
      "event": "fade_out",
      "type": "event",
      "id": 1
    },
    {
      "portrait": "murloc_white",
      "goto": 3,
      "speaker": "Harry Halfbreed",
      "text": "Welcome to the Circle of Blood Arena! Your skills will be put to the test. Are you ready?",
      "id": 2,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 4,
      "speaker": "$player",
      "text": "Wait a minute... How did I get here?",
      "id": 3,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 5,
      "speaker": "Harry Halfbreed",
      "text": "I wouldn't worry about a silly backstory if I were you. You're here to fight, right?",
      "id": 4,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 6,
      "speaker": "$player",
      "text": "I guess so...",
      "id": 5,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 7,
      "speaker": "Harry Halfbreed",
      "text": "That's the spirit! You'll find all kinds of creatures to fight in the mountains to the east.",
      "id": 6,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 8,
      "speaker": "Harry Halfbreed",
      "text": "Or you can talk to me if you want a real challenge.",
      "id": 7,
      "align": "right",
      "type": "text"
    },
    {
      "goto": 9,
      "event": "end_newgame_dia",
      "type": "event",
      "id": 8
    }
  ],
  "dia_save_gurgul": [
    {
      "portrait": "murloc_orange",
      "goto": 2,
      "speaker": "Gurgul",
      "text": "I'm saved! All thanks to you... All hail Murk! Hero of heroes!",
      "id": 1,
      "align": "right",
      "type": "text"
    },
    {
      "goto": 3,
      "event": "backtocamp",
      "type": "event",
      "id": 2
    },
    {
      "goto": 4,
      "event": "complete_quest_save_gurgul",
      "type": "event",
      "id": 3
    },
    {
      "goto": 5,
      "event": "end_dia",
      "type": "event",
      "id": 4
    }
  ],
  "dia_guardstop": [
    {
      "goto": 2,
      "event": "murloc_shout",
      "type": "event",
      "id": 1
    },
    {
      "portrait": "murloc_orange",
      "goto": 3,
      "speaker": "Murgul",
      "text": "Not another step, yellow-fin!",
      "id": 2,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_arena_com": [
    {
      "portrait": "murloc_white",
      "goto": 2,
      "speaker": "Harry Halfbreed",
      "text": "Well done, $class. Talk to me when you're ready for the next challenge.",
      "id": 1,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_lab_door_closed": [
    {
      "portrait": "turret",
      "goto": 2,
      "speaker": "Auto-Defense Turret",
      "text": "Intruder detected. Activating auto-defense in 3... 2...",
      "id": 1,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "align": "left",
      "choices": [
        [
          "Stay put.",
          3
        ],
        [
          "Leave it alone.",
          0
        ]
      ],
      "speaker": "$player",
      "type": "choice",
      "id": 2
    },
    {
      "portrait": "turret",
      "goto": 4,
      "speaker": "Auto-Defense Turret",
      "text": "1... Defense measures activated.",
      "id": 3,
      "align": "right",
      "type": "text"
    },
    {
      "goto": 5,
      "event": "turrent_on",
      "type": "event",
      "id": 4
    }
  ],
  "dia_vendor_bomb": [
    {
      "goto": 2,
      "event": "vendor_bomb",
      "type": "event",
      "id": 1
    }
  ],
  "dia_arena1": [
    {
      "portrait": "murloc_white",
      "goto": 2,
      "speaker": "Harry Halfbreed",
      "text": "Looking for a challenge eh? I've got just the fight for you! I'll set you up with the mighty boar of--",
      "id": 1,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 3,
      "speaker": "$player",
      "text": "Great... More boars...",
      "id": 2,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 4,
      "speaker": "Harry Halfbreed",
      "text": "Not just any boar! The king of all boars! The alpha boar of alpha boars! Do not underestimate this mighty beast.",
      "id": 3,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 5,
      "speaker": "Harry Halfbreed",
      "text": "Go on through the arena entrance when you're ready to fight.",
      "id": 4,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_1_2": [
    {
      "portrait": "murloc_green",
      "goto": 2,
      "speaker": "Slen",
      "text": "Sorry, outsider. We have no room for refugees.",
      "id": 1,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_orange",
      "goto": 3,
      "speaker": "Murgul",
      "text": "Yeah! No room for yellow-fins here. So scram!",
      "id": 2,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 4,
      "speaker": "$player",
      "text": "I have no interest in joining your camp.",
      "id": 3,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_orange",
      "goto": 5,
      "speaker": "Murgul",
      "text": "Best you be on your way then, yellow-fin!",
      "id": 4,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 6,
      "speaker": "$player",
      "text": "Watch your tongue, or you may end up losing it.",
      "id": 5,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_orange",
      "goto": 8,
      "speaker": "Murgul",
      "text": "Why you little!",
      "id": 6,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_green",
      "goto": 9,
      "speaker": "Slen",
      "text": "Settle down, the both of you!",
      "id": 8,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_green",
      "goto": 10,
      "speaker": "Slen",
      "text": "I apologize for my inarticulate partner but we are busy enough rebuilding our camp and can spare no time for idle chatter with outsiders.",
      "id": 9,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_green",
      "goto": 11,
      "speaker": "Slen",
      "text": "Unless there is something I can help you with, you should be on your way.",
      "id": 10,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 12,
      "speaker": "$player",
      "text": "I come from Camp Brakil with urgent news for your chief.",
      "id": 11,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_green",
      "goto": 13,
      "speaker": "Slen",
      "text": "Ah, you must be the messenger. Of course. Chief Gizbo is expecting you.",
      "id": 12,
      "align": "right",
      "type": "text"
    },
    {
      "goto": 14,
      "event": "murloc_shout",
      "type": "event",
      "id": 13
    },
    {
      "portrait": "murloc_green",
      "goto": 15,
      "speaker": "Slen",
      "text": "Sergeant! Escort our esteemed guest to the chief's tent.",
      "id": 14,
      "align": "right",
      "type": "text"
    },
    {
      "goto": 16,
      "event": "murloc_whimper",
      "type": "event",
      "id": 15
    },
    {
      "portrait": "murloc_orange",
      "goto": 17,
      "speaker": "Murgul",
      "text": "Yes sir...",
      "id": 16,
      "align": "right",
      "type": "text"
    },
    {
      "goto": 18,
      "event": "goto_gizbohut",
      "type": "event",
      "id": 17
    }
  ],
  "dia_q_gizbo_alch_inc": [
    {
      "portrait": "murloc_green",
      "goto": 2,
      "speaker": "Arkin",
      "text": "$Class, where are my 10 Vials of Blood?",
      "id": 1,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_arena_df": [
    {
      "portrait": "murloc_white",
      "goto": 2,
      "speaker": "Harry Halfbreed",
      "text": "ALL GLORY TO THE DOOM FROG.",
      "id": 1,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_start": [
    {
      "portrait": "none",
      "goto": 14,
      "speaker": " ",
      "text": "Mortal... $Class... Your time has come to prove your worth. Restore the balance to what was once, but now is lost.",
      "id": 1,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_gray",
      "goto": 3,
      "speaker": "Lekon",
      "text": "Wake up, $player.",
      "id": 2,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 4,
      "speaker": " $player",
      "text": "Restore the balance... Prove my worth...",
      "id": 3,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_gray",
      "goto": 13,
      "speaker": "Lekon",
      "text": "He's still in shock.",
      "id": 4,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_gray",
      "goto": 12,
      "speaker": "Lekon",
      "text": "*Lekon casts Lightning Bolt*",
      "id": 5,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 7,
      "speaker": " $player",
      "text": "Aaargghh!",
      "id": 6,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_gray",
      "goto": 8,
      "speaker": "Lekon",
      "text": "Look at me $player. Do you know why you're here? Do you remember what happened at Camp Brakil?",
      "id": 7,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 9,
      "speaker": " $player",
      "text": "Chief Brakil... I swore to avenge his death and rescue his kidnapped daughter. It was his dying wish.",
      "id": 8,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_gray",
      "goto": 10,
      "speaker": "Lekon",
      "text": "Then my work here is done. Make your way to Camp Gizbo. There you will find the aid you seek. And $player...",
      "id": 9,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 11,
      "speaker": " $player",
      "text": "Yes, Lekon?",
      "id": 10,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_gray",
      "goto": 15,
      "speaker": "Lekon",
      "text": "Good luck.",
      "id": 11,
      "align": "right",
      "type": "text"
    },
    {
      "goto": 6,
      "event": "sound_murkhurt",
      "type": "event",
      "id": 12
    },
    {
      "goto": 5,
      "event": "sound_electrictouch",
      "type": "event",
      "id": 13
    },
    {
      "goto": 2,
      "event": "fade_out",
      "type": "event",
      "id": 14
    },
    {
      "goto": 16,
      "event": "anim_lekon",
      "type": "event",
      "id": 15
    }
  ],
  "dia_quillboar_camp_com": [
    {
      "portrait": "murloc_white",
      "goto": 2,
      "speaker": "Chief Gizbo",
      "text": "I sense a calm serenity flowing through the trees. Have you completed your task?",
      "id": 1,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 3,
      "speaker": "$player",
      "text": "Earthcaller Thorntusk is no more.",
      "id": 2,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 4,
      "speaker": "Chief Gizbo",
      "text": "We shall finally have the peace we deserve. You have our thanks, $player.",
      "id": 3,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 5,
      "speaker": "$player",
      "text": "With all due respect, I'm not here for gratitude.",
      "id": 4,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 6,
      "speaker": "Chief Gizbo",
      "text": "Of course. I've just heard word from my scouts that your assassin has been spotted not too far from here.",
      "id": 5,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 7,
      "speaker": "$player",
      "text": "Where can I find him?",
      "id": 6,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 8,
      "speaker": "Chief Gizbo",
      "text": "The assassin moves fast. My scouts cannot pinpoint his exact location, but I know who can.",
      "id": 7,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 9,
      "speaker": "Chief Gizbo",
      "text": "There's an engineer by the name of Gomsil who lives nearby. He is a hermit of sorts and likes to keep to himself. I've employed his technical expertise before, he should be of great use.",
      "id": 8,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 10,
      "speaker": "Chief Gizbo",
      "text": "Here, give him this rare schematic that our scavengers found and the engineer will surely offer you his services.",
      "id": 9,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 11,
      "speaker": "Chief Gizbo",
      "text": "Beware of this mad tinkerer, $player. His intelligence can only be matched by his insanity!",
      "id": 10,
      "align": "right",
      "type": "text"
    },
    {
      "goto": 12,
      "event": "get_quest_003",
      "type": "event",
      "id": 11
    }
  ],
  "dia_none": [
    {
      "portrait": "none",
      "goto": 2,
      "speaker": " ",
      "text": "*** This is a placeholder ***",
      "id": 1,
      "align": "left",
      "type": "text"
    }
  ],
  "dia_lab_door_open": [
    {
      "portrait": "turret",
      "goto": 2,
      "speaker": "Auto-Defense Turret",
      "text": "Intruder detected. Activating auto-defense in 3... 2...",
      "id": 1,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 3,
      "speaker": "$player",
      "text": "Wait! I have a special package for Mr. Gomsil.",
      "id": 2,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "turret",
      "goto": 4,
      "speaker": "Auto-Defense Turret",
      "text": "1...",
      "id": 3,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 5,
      "speaker": "$player",
      "text": "......",
      "id": 4,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "turret",
      "goto": 6,
      "speaker": "Auto-Defense Turret",
      "text": "Auto-defense aborted.",
      "id": 5,
      "align": "right",
      "type": "text"
    },
    {
      "goto": 7,
      "event": "unlock_sound",
      "type": "event",
      "id": 6
    },
    {
      "portrait": "none",
      "goto": 8,
      "speaker": " ",
      "text": "*The door unlocks*",
      "id": 7,
      "align": "left",
      "type": "text"
    },
    {
      "goto": 9,
      "event": "end_game",
      "type": "hijack",
      "id": 8
    }
  ],
  "dia_nightwatch": [
    {
      "portrait": "murloc_green",
      "goto": 2,
      "speaker": "Slen",
      "text": "Are you ready to fight, outsider?",
      "id": 1,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "align": "left",
      "id": 2,
      "speaker": "$player",
      "type": "choice",
      "choices": [
        [
          "Yes, I'm ready.",
          4
        ],
        [
          "Give me a couple of minutes.",
          3
        ]
      ]
    },
    {
      "goto": 0,
      "event": "end_dia",
      "type": "event",
      "id": 3
    },
    {
      "portrait": "murloc_green",
      "goto": 5,
      "speaker": "Slen",
      "text": "Brace yourself, outsider. Here they come!",
      "id": 4,
      "align": "right",
      "type": "text"
    },
    {
      "goto": 6,
      "event": "music_murlocbattle",
      "type": "event",
      "id": 5
    },
    {
      "goto": 7,
      "event": "battle_boar",
      "type": "hijack",
      "id": 6
    },
    {
      "portrait": "murloc_orange",
      "goto": 8,
      "speaker": "Murgul",
      "text": "I see more of them, just across the hills!",
      "id": 7,
      "align": "right",
      "type": "text"
    },
    {
      "goto": 9,
      "event": "battle_boar",
      "type": "hijack",
      "id": 8
    },
    {
      "portrait": "murloc_green",
      "goto": 10,
      "speaker": "Slen",
      "text": "Do not let your guard down, outsider. Behind you!",
      "id": 9,
      "align": "right",
      "type": "text"
    },
    {
      "goto": 11,
      "event": "battle_boar",
      "type": "hijack",
      "id": 10
    },
    {
      "portrait": "murloc_green",
      "goto": 12,
      "speaker": "Slen",
      "text": "Rise above the fatigue, outsider! March forward!",
      "id": 11,
      "align": "right",
      "type": "text"
    },
    {
      "goto": 13,
      "event": "battle_boar",
      "type": "hijack",
      "id": 12
    },
    {
      "portrait": "murloc_orange",
      "goto": 14,
      "speaker": "Murgul",
      "text": "Commander Slen, the quilboars are retreating!",
      "id": 13,
      "align": "right",
      "type": "text"
    },
    {
      "goto": 15,
      "event": "music_tribalvillage",
      "type": "event",
      "id": 14
    },
    {
      "portrait": "murloc_green",
      "goto": 16,
      "speaker": "Slen",
      "text": "Haha! Great work, outsider. You are comfortable in the heat of battle, and that is truly admirable.",
      "id": 15,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_green",
      "goto": 17,
      "speaker": "Slen",
      "text": "Here, take this crest as a token of our gratitude. May it reignite your courage in the face of adversary.",
      "id": 16,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_gurgul2": [
    {
      "portrait": "murloc_orange",
      "goto": 2,
      "speaker": "Gurgul",
      "text": "Do you know why Chief Gizbo has white skin? His father was green-skinned and his mother was orange. You'd think mixing orange and green would make brown, but it does not!",
      "id": 1,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_q_gizbo_alch_new": [
    {
      "portrait": "murloc_green",
      "goto": 2,
      "speaker": "Arkin",
      "text": "Psst... $Class... over here.",
      "id": 1,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 3,
      "speaker": "$player",
      "text": "Hm?",
      "id": 2,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_green",
      "goto": 4,
      "speaker": "Arkin",
      "text": "I hear you've been helping out some of the camp vendors. Lend me your strength and I'll make it worth your while.",
      "id": 3,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 5,
      "speaker": "$player",
      "text": "What do you need?",
      "id": 4,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_green",
      "goto": 6,
      "speaker": "Arkin",
      "text": "I'm working on some experimental potions and I need 10 Vials of Blood for the finishing touch.",
      "id": 5,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 7,
      "speaker": "$player",
      "text": "Where can I find the blood you seek?",
      "id": 6,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_green",
      "goto": 8,
      "speaker": "Arkin",
      "text": "Isn't it obvious? Just kill any creature that bleeds and bring me 10 Vials of Blood!",
      "id": 7,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_spirithealer2": [
    {
      "portrait": "spirit_healer",
      "goto": 2,
      "speaker": "Spirit Healer",
      "text": "$Class, it is not yet your time. Come closer.",
      "id": 1,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_arena_entrance": [
    {
      "goto": 2,
      "event": "enter_arena",
      "type": "hijack",
      "id": 1
    }
  ],
  "dia_arena8": [
    {
      "portrait": "murloc_white",
      "goto": 2,
      "speaker": "Harry Halfbreed",
      "text": "Well, that's a wrap! Good job, $player. You really put on quite a sh--",
      "id": 1,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "frog",
      "goto": 3,
      "speaker": "Doom Frog",
      "text": "*Doom Frog stares vacantly*",
      "id": 2,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 4,
      "speaker": "Harry Halfbreed",
      "text": "Wait, what is this? I don't even--ALL GLORY TO THE DOOM FROG.",
      "id": 3,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "frog",
      "goto": 5,
      "speaker": "Doom Frog",
      "text": "*Doom Frog wishes to challenge you in the Arena*",
      "id": 4,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_q002_inc": [
    {
      "portrait": "murloc_white",
      "goto": 2,
      "speaker": "Chief Gizbo",
      "text": "Look around the camp for those who might need your help.",
      "id": 1,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_guard1": [
    {
      "portrait": "murloc_green",
      "goto": 2,
      "speaker": "Slen",
      "text": "Can I help you, outsider?",
      "id": 1,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_bombs_com": [
    {
      "portrait": "murloc_blue",
      "goto": 2,
      "speaker": "$player",
      "text": "I got your sh--erm... manure. Now what is it you wanted me to see?",
      "id": 1,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_orange",
      "goto": 3,
      "speaker": "Zurgul",
      "text": "Wow, these piles are still moist! Excellent work! You have a bright future in the manure business kid.",
      "id": 2,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_orange",
      "goto": 4,
      "speaker": "Zurgul",
      "text": "Now I'll just add a few things here and there... and....",
      "id": 3,
      "align": "right",
      "type": "text"
    },
    {
      "goto": 5,
      "event": "boom",
      "type": "event",
      "id": 4
    },
    {
      "portrait": "murloc_orange",
      "goto": 6,
      "speaker": "Zurgul",
      "text": "BAM! Hahaha!",
      "id": 5,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_orange",
      "goto": 7,
      "speaker": "Zurgul",
      "text": "Have a look at my wares!",
      "id": 6,
      "align": "right",
      "type": "text"
    },
    {
      "goto": 8,
      "event": "light_torch_bomb",
      "type": "event",
      "id": 7
    }
  ],
  "dia_q002_com": [
    {
      "portrait": "murloc_white",
      "goto": 2,
      "speaker": "Chief Gizbo",
      "text": "Ah, Murk. Just the murloc I've been looking for. I've just heard word from my scouts that your assassin has been spotted not too far from here.",
      "id": 1,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 3,
      "speaker": "$player",
      "text": "Where can I find him?",
      "id": 2,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 4,
      "speaker": "Chief Gizbo",
      "text": "The assassin moves fast. My scouts cannot pinpoint his exact location, but I know who can.",
      "id": 3,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 5,
      "speaker": "Chief Gizbo",
      "text": "There's a goblin engineer by the name of Gomsil who lives nearby. He is a hermit of sorts and likes to keep to himself. I've used his technical expertise before, he should be of great help.",
      "id": 4,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 6,
      "speaker": "Chief Gizbo",
      "text": "Here, give him this Finely Oiled Gear that our scavengers found and the goblin will surely offer you his services.",
      "id": 5,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 7,
      "speaker": "Chief Gizbo",
      "text": "Beware of this mad tinkerer, $player. His intelligence can only be matched by his insanity!",
      "id": 6,
      "align": "right",
      "type": "text"
    },
    {
      "goto": 8,
      "event": "get_quest_003",
      "type": "event",
      "id": 7
    },
    {
      "portrait": "none",
      "goto": 9,
      "speaker": " ",
      "text": "*** END OF DEMO ***",
      "id": 8,
      "align": "left",
      "type": "text"
    }
  ],
  "dia_goback_qb": [
    {
      "portrait": "murloc_green",
      "goto": 2,
      "speaker": "Slen",
      "text": "Are you ready to go back to Camp Gizbo?",
      "id": 1,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "align": "left",
      "id": 2,
      "speaker": "$player",
      "type": "choice",
      "choices": [
        [
          "Let's go.",
          3
        ],
        [
          "Not yet.",
          0
        ]
      ]
    },
    {
      "goto": 4,
      "event": "backtocamp",
      "type": "hijack",
      "id": 3
    }
  ],
  "dia_arena5": [
    {
      "portrait": "murloc_blue",
      "goto": 2,
      "speaker": "$player",
      "text": "I've fought these creatures before. Don't you have something new?",
      "id": 1,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 3,
      "speaker": "Harry Halfbreed",
      "text": "Haha! Well, our arena is so tiny that we could only fit so many opponents in here.",
      "id": 2,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 4,
      "speaker": "$player",
      "text": "I see...",
      "id": 3,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 5,
      "speaker": "Harry Halfbreed",
      "text": "Fear not, brave gladiator! For I have the perfect challenge for you!",
      "id": 4,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 6,
      "speaker": "Harry Halfbreed",
      "text": "You thought you were the only yellow-fin here didn't you? Prepare to challenge your own kin in a barbaric fight to the death!",
      "id": 5,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 7,
      "speaker": "Harry Halfbreed",
      "text": "Go on through the arena entrance when you're ready to fight.",
      "id": 6,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_quicktrainer": [
    {
      "goto": 2,
      "event": "quick_trainer",
      "type": "event",
      "id": 1
    }
  ],
  "dia_go_qb": [
    {
      "portrait": "murloc_green",
      "goto": 2,
      "speaker": "Slen",
      "text": "Are you ready to head to the quilboar hideout, outsider?",
      "id": 1,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "align": "left",
      "id": 2,
      "speaker": "$player",
      "type": "choice",
      "choices": [
        [
          "Let's go.",
          3
        ],
        [
          "Not yet.",
          0
        ]
      ]
    },
    {
      "goto": 4,
      "event": "goto_qb",
      "type": "hijack",
      "id": 3
    }
  ],
  "dia_goback": [
    {
      "portrait": "murloc_blue",
      "goto": 2,
      "speaker": "$player",
      "text": "There's no turning back now. I should head east to Camp Gizbo.",
      "id": 1,
      "align": "left",
      "type": "text"
    }
  ],
  "dia_q_gizbo_armor_com": [
    {
      "portrait": "murloc_blue",
      "goto": 2,
      "speaker": "$player",
      "text": "Here are your Tree Branches, Jekel.",
      "id": 1,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_green",
      "goto": 3,
      "speaker": "Jekel",
      "text": "Ah, you have my thanks yellow-fin. How about a hand with these tools.",
      "id": 2,
      "align": "right",
      "type": "text"
    },
    {
      "goto": 4,
      "event": "fade_to_armor",
      "type": "hijack",
      "id": 3
    },
    {
      "goto": 5,
      "event": "build_tent",
      "type": "event",
      "id": 4
    },
    {
      "goto": 6,
      "event": "light_torch_armor",
      "type": "event",
      "id": 5
    },
    {
      "portrait": "murloc_green",
      "goto": 7,
      "speaker": "Jekel",
      "text": "What a fine tent we've built! Have a look at my latest stock. I'll give you a special discount for your help.",
      "id": 6,
      "align": "right",
      "type": "text"
    },
    {
      "goto": 8,
      "event": "end_dia",
      "type": "event",
      "id": 7
    }
  ],
  "dia_gizbo_alch_closed": [
    {
      "portrait": "murloc_green",
      "goto": 2,
      "speaker": "Arkin",
      "text": "A bouquet of peacebloom, a single silverleaf. Hmmm... No, no, something's missing.",
      "id": 1,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 3,
      "speaker": "$player",
      "text": "Are you okay?",
      "id": 2,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_green",
      "goto": 4,
      "speaker": "Arkin",
      "text": "Yes, yes... Can't you see I'm busy, $class?",
      "id": 3,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_arena4": [
    {
      "portrait": "murloc_white",
      "goto": 2,
      "speaker": " Harry Halfbreed",
      "text": "Your next challenge might look a little familiar! Resurrected by ancestral spirits, he's back, and he's got a score to settle.",
      "id": 1,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 3,
      "speaker": " Harry Halfbreed",
      "text": "Go on through the arena entrance when you're ready to fight.",
      "id": 2,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_q_gizbo_armor_new": [
    {
      "portrait": "murloc_green",
      "goto": 2,
      "speaker": "Jekel",
      "text": "I'm busy, outsider.",
      "id": 1,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_blue",
      "goto": 3,
      "speaker": "$player",
      "text": "Chief Gizbo said you might need a hand.",
      "id": 2,
      "align": "left",
      "type": "text"
    },
    {
      "portrait": "murloc_green",
      "goto": 4,
      "speaker": "Jekel",
      "text": "Chief Gizbo sent you? My apologies. I could use a hand, yes.",
      "id": 3,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_green",
      "goto": 5,
      "speaker": "Jekel",
      "text": "Those wretched carrion birds keep stealing my branches. How am I supposed to build a tent without any branches?",
      "id": 4,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_green",
      "goto": 6,
      "speaker": "Jekel",
      "text": "Bring me 6 Tree Branches from the carrion birds to the east and I'll give you a special deal on my wares.",
      "id": 5,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_arena6": [
    {
      "portrait": "murloc_white",
      "goto": 2,
      "speaker": "Harry Halfbreed",
      "text": "You seem to be holding up well, $class. I'm impressed.",
      "id": 1,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 3,
      "speaker": "Harry Halfbreed",
      "text": "Your next challenge is known for his strong grip on the elements. Get ready for a magically gory fight to the death!",
      "id": 2,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 4,
      "speaker": "Harry Halfbreed",
      "text": "Go on through the arena entrance when you're ready to fight.",
      "id": 3,
      "align": "right",
      "type": "text"
    }
  ],
  "dia__arena1_com": [
    {
      "portrait": "murloc_white",
      "goto": 2,
      "speaker": "Harry Halfbreed",
      "text": "Well done.",
      "id": 1,
      "align": "left",
      "type": "text"
    }
  ],
  "dia_quillboar_camp_inc": [
    {
      "portrait": "murloc_white",
      "goto": 2,
      "speaker": "Chief Gizbo",
      "text": "Defeat the vile Earthcaller Thorntusk and then we'll see about the assassin of yours.",
      "id": 1,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_arena3": [
    {
      "portrait": "murloc_white",
      "goto": 2,
      "speaker": "Harry Halfbreed",
      "text": "Forged from the fiery depths of the underworld, your next challenge is sure to put on a hellishly entertaining show!",
      "id": 1,
      "align": "right",
      "type": "text"
    },
    {
      "portrait": "murloc_white",
      "goto": 3,
      "speaker": "Harry Halfbreed",
      "text": "Go on through the arena entrance when you're ready to fight.",
      "id": 2,
      "align": "right",
      "type": "text"
    }
  ],
  "dia_bombs_inc": [
    {
      "portrait": "murloc_orange",
      "goto": 2,
      "speaker": "Zurgul",
      "text": "It's only manure, don't be a sissy! Get me 5 piles from the boars to the east and I'll show you my invention!",
      "id": 1,
      "align": "right",
      "type": "text"
    }
  ]
}`;
