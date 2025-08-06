// Comprehensive harmonic state details for results display
export interface HarmonicStateDetails {
  id: string;
  name: string;
  theme: string;
  coreBeliefs: string[];
  behaviorPatterns: string[];
  communicationPatterns: string[];
  coachingNotes: string[];
  connection: string[];
  reality: string[];
  understanding: string[];
  change: string[];
  responsibility: string[];
  help: string[];
  work: string[];
  emotionalDriver: {
    title: string;
    description: string;
  };
}

export const harmonicStateDetails: Record<string, HarmonicStateDetails> = {
  apathy: {
    id: "apathy",
    name: "Apathy",
    theme: "Emotional shutdown, perceived powerlessness, spiritual numbness",
    coreBeliefs: [
      "Nothing matters.",
      "There's no point in trying.",
      "I'm broken and no one can help."
    ],
    behaviorPatterns: [
      "Withdrawn, motionless, low energy",
      "Avoids action, avoids eye contact",
      "May neglect basic self-care",
      "Tends to give up before starting"
    ],
    communicationPatterns: [
      "Monotone or flat speech, or no speech at all",
      "Delayed or non-responsiveness",
      "Struggles to express emotions or needs",
      "May not initiate conversation even when in distress"
    ],
    coachingNotes: [
      "Focus on micro-movements, body awareness, and simple sensory engagement",
      "Do not try to \"motivate\" directly—first build safety and attunement",
      "Use presence over pressure; allow silence and space",
      "Progress = any spark of interest or acknowledgment of life"
    ],
    connection: [
      "Severely disconnected from others and self",
      "Feels isolated or invisible",
      "Often perceives even warmth or help as threatening or useless",
      "Needs gentle re-entry into relational safety"
    ],
    reality: [
      "Reality is blurry, confused, or distorted",
      "May dissociate or reject shared experience",
      "Struggles to agree on or engage with facts"
    ],
    understanding: [
      "Limited comprehension of cause-effect or consequences",
      "May feel overwhelmed by basic emotional or cognitive processing",
      "Coaching must slow way down and simplify language"
    ],
    change: [
      "Feels change is impossible or dangerous",
      "Will resist or freeze even in the face of needed improvement",
      "Requires consistency + small predictable changes to build safety"
    ],
    responsibility: [
      "Feels powerless to influence anything",
      "Projects responsibility outward or collapses under the idea of having any",
      "Begin by helping client regain choice in tiny ways"
    ],
    help: [
      "May refuse help outright or accept it passively with no engagement",
      "Feels undeserving of help or mistrusts helpers",
      "Help must be offered without pressure and on their terms"
    ],
    work: [
      "Unable or unwilling to contribute",
      "Work feels meaningless or impossible",
      "Small, embodied tasks with visible completion can begin to reconnect them to purpose"
    ],
    emotionalDriver: {
      title: "Hopelessness / Collapse",
      description: "The system is shut down from perceived futility. There's no reason to act, because \"nothing works.\""
    }
  },
  grief: {
    id: "grief",
    name: "Grief",
    theme: "Sadness, loss, emotional overwhelm",
    coreBeliefs: [
      "Something important is gone forever.",
      "I'll never recover.",
      "Life is about losing what you love."
    ],
    behaviorPatterns: [
      "Tearful or emotionally expressive in short bursts",
      "Withdraws into memory, nostalgia, or past events",
      "May isolate or seek comfort constantly",
      "Fluctuates between sadness and numbness"
    ],
    communicationPatterns: [
      "Expresses loss or longing, sometimes repeatedly",
      "May become reflective, poetic, or sentimental",
      "Speaks of \"what used to be\" more than \"what is\" or \"what could be\""
    ],
    coachingNotes: [
      "Validate the emotion; never rush grief",
      "Create space for expression through story, art, movement, or ritual",
      "Invite gentle orientation to present moment without demanding it",
      "Use compassionate witnessing, not fixing"
    ],
    connection: [
      "Deep longing for connection, but may mistrust it",
      "Craves comfort yet fears more loss",
      "May bond quickly with those who show empathy",
      "Risk of emotional enmeshment if not guided gently"
    ],
    reality: [
      "Sees life through lens of loss and endings",
      "Tends to idealize the past, resist present reality",
      "May struggle to see new beginnings as possible"
    ],
    understanding: [
      "High emotional sensitivity, may misinterpret neutral actions as hurtful",
      "Insightful about human suffering",
      "Needs help reframing the narrative of loss toward meaning"
    ],
    change: [
      "Change is viewed as painful or threatening",
      "Will change only if safety, continuity, and ritual are respected",
      "Honor what was before introducing what's next"
    ],
    responsibility: [
      "May feel guilt or regret over what was lost",
      "Might take on too much responsibility for others' pain",
      "Needs help separating compassion from self-blame"
    ],
    help: [
      "Open to help when trust is established",
      "Responds best to kindness, patience, and symbolic gestures of support",
      "Avoid harsh realism—grief needs warmth more than advice"
    ],
    work: [
      "Can find healing through purposeful work or expression",
      "May need breaks or flexible structure",
      "Ideal to channel pain into creativity, service, or legacy"
    ],
    emotionalDriver: {
      title: "Loss / Longing",
      description: "The heart is oriented toward something that was meaningful and is now gone—fueling sorrow and seeking healing."
    }
  },
  fear: {
    id: "fear",
    name: "Fear",
    theme: "Anxiety, uncertainty, avoidance",
    coreBeliefs: [
      "The world is unsafe.",
      "I will be hurt or judged if I act.",
      "Better to hide than risk anything."
    ],
    behaviorPatterns: [
      "Hesitant, watchful, avoids risk or exposure",
      "May freeze, over-prepare, or overthink",
      "Avoids confrontation and uncertainty",
      "May follow routines rigidly to maintain control"
    ],
    communicationPatterns: [
      "Cautious, overly filtered, seeking reassurance",
      "May ask lots of questions but act on few answers",
      "Withdraws or deflects when challenged"
    ],
    coachingNotes: [
      "Create certainty through structure and repetition",
      "Emphasize present safety and small wins",
      "Encourage embodiment practices to ground the nervous system",
      "Avoid fast pacing—build trust through predictability"
    ],
    connection: [
      "Wants to belong but fears rejection or betrayal",
      "May cling or isolate based on perceived threat",
      "Trust must be earned and protected consistently"
    ],
    reality: [
      "Sees the world through a lens of potential danger",
      "Expects negative outcomes or judgment",
      "Needs to verify, double-check, and seek proof"
    ],
    understanding: [
      "Hyper-aware of risks but struggles to contextualize them",
      "Often intelligent but mentally scattered",
      "Needs help prioritizing and simplifying"
    ],
    change: [
      "Experiences change as threat",
      "Prefers familiar discomfort over unfamiliar potential",
      "Change must be safe, gradual, and clearly beneficial"
    ],
    responsibility: [
      "Fears responsibility will lead to failure or blame",
      "May avoid commitments or decisions",
      "Needs help redefining responsibility as empowerment"
    ],
    help: [
      "Seeks help when overwhelmed but may mistrust it",
      "Responds well to calm, competent guidance",
      "Provide support without pressure or urgency"
    ],
    work: [
      "Can be diligent if environment feels safe",
      "May procrastinate due to fear of failure",
      "Needs gentle deadlines, supportive feedback"
    ],
    emotionalDriver: {
      title: "Safety / Avoidance",
      description: "The core motive is avoiding harm or failure. Behavior is controlled by the pursuit of protection and escape from exposure."
    }
  },
  covertResistance: {
    id: "covertResistance",
    name: "Covert Resistance",
    theme: "Passive defiance, hidden hostility, masked resentment",
    coreBeliefs: [
      "I'll pretend to go along—but I won't truly commit.",
      "They can't control me if they don't see it coming.",
      "The only safe power is hidden power."
    ],
    behaviorPatterns: [
      "Smiling compliance while secretly undermining",
      "Sabotages progress through inaction or delay",
      "Appears cooperative but avoids real accountability",
      "Uses charm or helplessness to deflect responsibility"
    ],
    communicationPatterns: [
      "Sugar-coated language with hidden barbs",
      "Plays the victim or martyr while resenting the role",
      "Compliments with subtle sarcasm or doubt beneath the words"
    ],
    coachingNotes: [
      "Requires clarity, firmness, and compassionate boundaries",
      "Avoid power struggles; use curiosity to expose hidden motives",
      "Reflect patterns without judgment—invite ownership slowly",
      "Build internal safety before asking for transparency"
    ],
    connection: [
      "Craves approval but mistrusts closeness",
      "Forms surface-level rapport to maintain control",
      "Needs to feel safe enough to be authentic"
    ],
    reality: [
      "Distorts or manipulates reality to maintain image",
      "May say one thing and do another",
      "Needs support confronting truth without humiliation"
    ],
    understanding: [
      "Clever but emotionally guarded",
      "Uses insight to protect rather than grow",
      "Can become highly insightful once trust is built"
    ],
    change: [
      "Resists openly, but more so behind the scenes",
      "Must feel ownership over the change to accept it",
      "Use reflective questioning to bypass resistance"
    ],
    responsibility: [
      "Dodges responsibility while appearing helpful",
      "May subtly blame others or \"forget\" commitments",
      "Needs structure and accountability paired with choice"
    ],
    help: [
      "Distrusts offers of help; sees them as control tactics",
      "May ask for help but reject solutions",
      "Requires sincere, non-patronizing engagement"
    ],
    work: [
      "Can perform well when motivated—but may undermine group goals",
      "Needs to feel autonomy and recognition to engage fully",
      "Work agreements must be clear and upheld"
    ],
    emotionalDriver: {
      title: "Control / Hidden Power",
      description: "This person seeks power through indirect means—avoiding direct conflict while subtly asserting dominance or revenge."
    }
  },
  anger: {
    id: "anger",
    name: "Anger",
    theme: "Reactive force, blame, and boundary violation",
    coreBeliefs: [
      "People are wrong and need to be corrected.",
      "I must fight to be heard or respected.",
      "If I don't push back, I'll be overpowered."
    ],
    behaviorPatterns: [
      "Explosive or intense reactions",
      "Easily triggered, critical, or confrontational",
      "Defends ego, territory, or pride with aggression",
      "May dominate or intimidate to feel strong"
    ],
    communicationPatterns: [
      "Sharp tone, raised voice, or cutting remarks",
      "Interrupts or talks over others",
      "Focuses on blame and what's wrong with others"
    ],
    coachingNotes: [
      "Validate the hurt beneath the anger without feeding the drama",
      "Teach safe expression and emotional regulation",
      "Build internal boundaries and self-respect",
      "Use challenge carefully—match their energy with grounded presence"
    ],
    connection: [
      "Connection is conditional and defensive",
      "Pushes people away to test loyalty or dominance",
      "Can soften when deeply understood and not shamed"
    ],
    reality: [
      "Sees life in black-and-white, often distorted by blame",
      "Projects intent or wrongdoing onto others",
      "Needs help reality-checking perceptions"
    ],
    understanding: [
      "Quick to notice threats but slow to see nuance",
      "Can be insightful when safe, but resists vulnerability",
      "Needs reframes that preserve dignity"
    ],
    change: [
      "May demand change from others but resist personal change",
      "Motivated by challenge, fairness, or revenge",
      "Change must honor their autonomy and strength"
    ],
    responsibility: [
      "Blames others first",
      "Will take responsibility when deeply respected and empowered",
      "Needs to see responsibility as self-protection, not weakness"
    ],
    help: [
      "Reluctant to accept help—sees it as weakness or control",
      "Will respond to strength, honesty, and no-nonsense support",
      "Don't coddle; don't confront without rapport"
    ],
    work: [
      "Can be a powerhouse when purpose-driven",
      "May create conflict in teams or burn out quickly",
      "Needs goals with meaning and autonomy"
    ],
    emotionalDriver: {
      title: "Injustice / Threat to Power",
      description: "Anger is often protecting a deeper wound—usually tied to a perceived injustice, betrayal, or loss of control."
    }
  },
  antagonism: {
    id: "antagonism",
    name: "Antagonism",
    theme: "Reactive provocation, testing boundaries, oppositional identity",
    coreBeliefs: [
      "If I don't challenge others, they'll control me.",
      "People are generally wrong, weak, or fake.",
      "Life is a battle of wit and will."
    ],
    behaviorPatterns: [
      "Argumentative, sarcastic, and contrarian",
      "Pokes holes in ideas, questions authority reflexively",
      "Seeks attention by stirring conflict or criticism",
      "Thrives on being \"right\" or making others look foolish"
    ],
    communicationPatterns: [
      "Snarky or biting humor",
      "Constant debate or playing devil's advocate",
      "Pushes buttons, interrupts, or provokes emotional reactions"
    ],
    coachingNotes: [
      "Do not personalize resistance—stay grounded and neutral",
      "Engage their intellect and challenge constructively",
      "Use collaborative language: \"Let's test this together\"",
      "Reward honesty and vulnerability when it peeks through"
    ],
    connection: [
      "Connection is based on conflict, debate, or testing",
      "May reject warmth or softness as weakness",
      "Gains respect through mutual sharpness or banter"
    ],
    reality: [
      "Sees flaws and inconsistencies everywhere",
      "Trusts personal perception over shared reality",
      "May distort truth to win or dominate"
    ],
    understanding: [
      "Highly intelligent, often perceptive",
      "Uses insight for criticism more than compassion",
      "Can develop empathy if shown how it strengthens influence"
    ],
    change: [
      "Enjoys challenging ideas but resists internal change",
      "Will shift if they feel it was their idea or discovery",
      "Invite them to test and prove new patterns themselves"
    ],
    responsibility: [
      "Will dodge or deflect accountability with cleverness",
      "May blame systems, people, or circumstances",
      "Help them see responsibility as strategic power"
    ],
    help: [
      "Often rejects help as unnecessary or manipulative",
      "Accepts help if framed as collaboration or expertise",
      "Avoid offering help too early—let them seek it"
    ],
    work: [
      "Energized by competition, challenge, or proving others wrong",
      "May disrupt teams unless channeled into constructive roles",
      "Assign tasks that reward independence and wit"
    ],
    emotionalDriver: {
      title: "Control Through Challenge",
      description: "Antagonism protects the self by keeping others off-balance—asserting power through friction, disagreement, or exposure of weakness."
    }
  },
  boredom: {
    id: "boredom",
    name: "Boredom",
    theme: "Disengaged curiosity, mild dissatisfaction, restless observation",
    coreBeliefs: [
      "There's nothing exciting or meaningful happening.",
      "Life is predictable and uninspiring.",
      "I'm not suffering—but I'm not thriving either."
    ],
    behaviorPatterns: [
      "Wanders mentally or physically",
      "Starts things but lacks follow-through",
      "Distracted, fidgety, or casually critical",
      "Seeks novelty without commitment"
    ],
    communicationPatterns: [
      "Casual, aloof tone",
      "May joke about seriousness or meaninglessness",
      "Often noncommittal or indecisive in conversation"
    ],
    coachingNotes: [
      "Reignite personal meaning and curiosity",
      "Use humor and light challenge to re-engage",
      "Explore values and vision beyond surface pleasure",
      "Frame action as an experiment, not a commitment"
    ],
    connection: [
      "Keeps relationships shallow or amusing",
      "May drift in and out of social spaces",
      "Can re-engage with emotionally stimulating or meaningful presence"
    ],
    reality: [
      "Engages with reality at a surface level",
      "Sees through empty routines but avoids deeper confrontation",
      "Needs reorientation toward purpose"
    ],
    understanding: [
      "Curious but unmotivated to act on insights",
      "May intellectualize or detach from emotional depth",
      "Help them connect ideas to impact"
    ],
    change: [
      "Open to novelty but skeptical of effort",
      "Needs to feel agency and playfulness in change",
      "Low-pressure change with visible results is best"
    ],
    responsibility: [
      "Avoids deep responsibility out of disinterest, not fear",
      "May show up when inspired or appreciated",
      "Frame responsibility as opportunity to shape experience"
    ],
    help: [
      "Will accept help if it's novel, light, or intriguing",
      "Rejects overly serious or controlling offers",
      "Offer help as a resource, not a rescue"
    ],
    work: [
      "Prefers stimulation and variety",
      "Gets bored with repetition or lack of challenge",
      "Needs a sense of autonomy and creative input"
    ],
    emotionalDriver: {
      title: "Stimulation / Meaning Seeking",
      description: "Boredom isn't apathy—it's the desire for something more, without clarity or urgency. Beneath it is the search for authentic engagement and inspiration."
    }
  },
  willingness: {
    id: "willingness",
    name: "Willingness",
    theme: "Cooperative engagement, personal growth, readiness to contribute",
    coreBeliefs: [
      "I can improve and make a difference.",
      "Life works better when I participate.",
      "I have something valuable to offer."
    ],
    behaviorPatterns: [
      "Proactive and open to learning",
      "Follows through on commitments",
      "Seeks feedback and applies it constructively",
      "Engages in tasks with optimism and initiative"
    ],
    communicationPatterns: [
      "Encouraging, curious, and inclusive tone",
      "Asks constructive questions",
      "Open to differing views without defensiveness"
    ],
    coachingNotes: [
      "A great level for action planning and momentum",
      "Focus on refining skills, expanding vision, and sustaining energy",
      "Support them in stretching their comfort zone without overwhelm",
      "Invite accountability with encouragement, not pressure"
    ],
    connection: [
      "Builds healthy relationships through mutual respect",
      "Open to collaboration and shared success",
      "Welcomes trust and honest feedback"
    ],
    reality: [
      "Engages with reality pragmatically and constructively",
      "Recognizes limitations without being defeated by them",
      "Balances idealism with grounded optimism"
    ],
    understanding: [
      "Interested in personal and interpersonal insight",
      "Learns quickly from experience",
      "Seeks to understand both self and others for improvement"
    ],
    change: [
      "Embraces change when it aligns with values or purpose",
      "Sees growth as a natural part of life",
      "Best supported through structure and celebration of progress"
    ],
    responsibility: [
      "Willingly takes responsibility for self and impact",
      "Holds self accountable without harshness",
      "Can model responsible behavior for others"
    ],
    help: [
      "Open to receiving and giving help",
      "Sees help as a strength, not a weakness",
      "Will often offer support proactively"
    ],
    work: [
      "Approaches work with energy and intention",
      "Enjoys contributing to shared goals",
      "Finds meaning in growth and service"
    ],
    emotionalDriver: {
      title: "Growth / Contribution",
      description: "This person is driven by a desire to participate, improve, and support others—they are ready to move forward and elevate those around them."
    }
  },
  stability: {
    id: "stability",
    name: "Stability",
    theme: "Grounded confidence, steady contribution, emotional balance",
    coreBeliefs: [
      "I am capable and centered.",
      "Things work when I show up consistently.",
      "I can trust life and myself."
    ],
    behaviorPatterns: [
      "Calm, consistent, dependable",
      "Handles stress with emotional maturity",
      "Makes measured decisions without overreaction",
      "Models balanced routines and habits"
    ],
    communicationPatterns: [
      "Clear, thoughtful, and measured",
      "Listens well and speaks with intention",
      "Resolves conflict with calm authority"
    ],
    coachingNotes: [
      "Ideal for leadership growth and long-term goals",
      "Invite deeper self-inquiry and legacy-building",
      "Encourage integration of logic and intuition",
      "Focus on refining impact and influence"
    ],
    connection: [
      "Develops stable, long-term relationships",
      "Trustworthy and emotionally available",
      "Sets and respects healthy boundaries"
    ],
    reality: [
      "Sees reality as complex but navigable",
      "Oriented to facts and practicality",
      "Maintains perspective in the face of difficulty"
    ],
    understanding: [
      "Understands cause-effect and emotional dynamics",
      "Integrates insight into steady action",
      "Seeks understanding to improve outcomes"
    ],
    change: [
      "Embraces structured change with clear purpose",
      "Prefers planned evolution over sudden disruption",
      "Motivated by alignment and sustainability"
    ],
    responsibility: [
      "Consistently responsible for self and others",
      "Honours commitments and leads by example",
      "Teaches responsibility through action"
    ],
    help: [
      "Offers help freely, often in mentoring form",
      "Selectively receives help from trusted sources",
      "Appreciates mutual support without dependency"
    ],
    work: [
      "Grounded, efficient, and organized",
      "Maintains high standards and resilience",
      "Builds systems, structures, and stable results"
    ],
    emotionalDriver: {
      title: "Trust / Integration",
      description: "This state is driven by a desire for inner and outer harmony—balancing reason, emotion, and purpose to create sustainable stability."
    }
  },
  enthusiasm: {
    id: "enthusiasm",
    name: "Enthusiasm",
    theme: "Inspired energy, uplifted action, joyful expansion",
    coreBeliefs: [
      "Life is full of exciting possibilities.",
      "I am here to create, grow, and inspire.",
      "When I express myself fully, life opens up."
    ],
    behaviorPatterns: [
      "Energized, expressive, and optimistic",
      "Takes bold action and inspires others",
      "Embraces challenges with a can-do attitude",
      "May overcommit due to high momentum"
    ],
    communicationPatterns: [
      "Uplifting, passionate, and visionary",
      "Speaks with conviction and emotion",
      "Easily motivates or influences others"
    ],
    coachingNotes: [
      "Leverage energy to deepen impact and refine purpose",
      "Encourage integration to avoid burnout",
      "Support pacing and boundary-setting",
      "Celebrate and anchor wins to sustain flow"
    ],
    connection: [
      "Forms joyful, vibrant relationships",
      "Radiates connection and inspiration",
      "May idealize others or bond quickly"
    ],
    reality: [
      "Sees a world of opportunity and growth",
      "May overlook limitations or practical concerns",
      "Balance vision with grounded steps"
    ],
    understanding: [
      "Seeks higher meaning and patterns",
      "Connects the dots with speed and creativity",
      "Can deepen insight through slowing down and reflection"
    ],
    change: [
      "Embraces change with excitement and confidence",
      "May leap into new directions without full planning",
      "Best supported by aligning change with values"
    ],
    responsibility: [
      "Eager to lead and contribute",
      "Can take on too much or overpromise",
      "Support sustainable responsibility through delegation"
    ],
    help: [
      "Offers help generously and cheerfully",
      "Welcomes collaboration and co-creation",
      "May overlook their own need for support"
    ],
    work: [
      "Driven, visionary, and productive",
      "Innovates and uplifts teams",
      "May need support with structure and follow-through"
    ],
    emotionalDriver: {
      title: "Inspiration / Expansion",
      description: "This person is propelled by a deep desire to create, uplift, and make a difference—enthusiasm fuels progress and collective momentum."
    }
  },
  exhilaration: {
    id: "exhilaration",
    name: "Exhilaration",
    theme: "Overflowing vitality, ecstatic momentum, peak experience",
    coreBeliefs: [
      "Anything is possible right now.",
      "I am one with life's brilliance.",
      "I am living in flow and alignment."
    ],
    behaviorPatterns: [
      "Electrifying presence and physical vitality",
      "Expresses spontaneous joy and creativity",
      "Often described as radiant or magnetic",
      "May leap into bold action without fear"
    ],
    communicationPatterns: [
      "Highly expressive, fluid, and impassioned",
      "May shift into poetic or spiritual language",
      "Inspires without needing persuasion"
    ],
    coachingNotes: [
      "Allow celebration and flow; don't interrupt the state",
      "Channel excess energy into purpose-driven momentum",
      "Support grounding and embodiment for longevity"
    ],
    connection: [
      "Deep connection to self, others, and the present moment",
      "Effortless rapport and resonance with people",
      "Feels \"plugged in\" to everything"
    ],
    reality: [
      "Reality feels magical, responsive, and interconnected",
      "High intuitive awareness",
      "May lose track of detail—help them capture insights"
    ],
    understanding: [
      "Expansive understanding of self, others, and life",
      "Operates from synthesis and transcendence",
      "Capable of holding paradox without resistance"
    ],
    change: [
      "Welcomes change as expression of growth",
      "Change feels effortless and exciting",
      "Help document or anchor change into form"
    ],
    responsibility: [
      "Feels joyful responsibility for one's ripple in the world",
      "Leads with love and clarity",
      "May benefit from systems to sustain output"
    ],
    help: [
      "Help flows both directions without attachment",
      "Attracts support and offers it without ego",
      "Help is a dance, not a transaction"
    ],
    work: [
      "Work feels like play or divine calling",
      "Driven by joy, not duty",
      "Needs balance between output and renewal"
    ],
    emotionalDriver: {
      title: "Ecstasy / Flow",
      description: "This person is immersed in the thrill of being alive—exhilaration comes from dancing fully with the now."
    }
  },
  action: {
    id: "action",
    name: "Action",
    theme: "Purposeful momentum, decisive mastery, clear intention",
    coreBeliefs: [
      "I know what I'm here to do.",
      "Focused energy creates meaningful results.",
      "I am the source of aligned outcomes."
    ],
    behaviorPatterns: [
      "Laser-focused, efficient, and effective",
      "Takes strategic, aligned action",
      "Leads self and others with clarity",
      "Less outward joy, more deliberate execution"
    ],
    communicationPatterns: [
      "Direct, intentional, and impactful",
      "Uses language to move things forward",
      "Motivates through vision and grounded certainty"
    ],
    coachingNotes: [
      "Support optimization and systems-building",
      "Invite deep reflection between movements",
      "Ensure that action remains values-aligned"
    ],
    connection: [
      "Connects through mission and values",
      "Empathy may be quieter but present",
      "Prioritizes contribution over personal recognition"
    ],
    reality: [
      "Grounded and lucid engagement with reality",
      "High capacity to adjust to facts",
      "Operates within possibility and probability"
    ],
    understanding: [
      "Integrates insight and action fluidly",
      "Understands cause-effect and strategic impact",
      "Self-aware without self-obsession"
    ],
    change: [
      "Initiates change deliberately and consistently",
      "Change is a tool for evolution",
      "Anchors new states through structured momentum"
    ],
    responsibility: [
      "Takes ownership for entire field of influence",
      "Holds self accountable with grace and strength",
      "Teaches and models sovereignty"
    ],
    help: [
      "Offers mentorship and structural support",
      "Receives help when aligned with goals",
      "Selects support carefully"
    ],
    work: [
      "Work is clear, mission-driven, and potent",
      "Systems and execution match vision",
      "Sustained productivity without burnout"
    ],
    emotionalDriver: {
      title: "Mastery / Alignment",
      description: "Action arises from a centered place of power—the engine is not pressure, but deep clarity of purpose."
    }
  },
  creativePower: {
    id: "creativePower",
    name: "Creative Power",
    theme: "Limitless creation, conscious manifestation, visionary service",
    coreBeliefs: [
      "I create my reality with intention and love.",
      "The universe moves through me.",
      "My imagination is divine expression."
    ],
    behaviorPatterns: [
      "Inventive, visionary, multidimensional",
      "Creates effortlessly from inspiration",
      "Blends intuition, insight, and innovation"
    ],
    communicationPatterns: [
      "Visionary, abstract, symbolic",
      "Speaks in imagery, possibility, and felt-sense",
      "Invites others into deeper reality"
    ],
    coachingNotes: [
      "Encourage integration of vision and delivery",
      "Help ground ideas into tangible steps",
      "Reflect their genius without idolizing"
    ],
    connection: [
      "Connects through vibration and creative expression",
      "Feels deep communion with collective energy",
      "May transcend individual identity in relationships"
    ],
    reality: [
      "Sees all as energy and potential",
      "Engages in co-creation with life",
      "Help with anchoring timelines and outcomes"
    ],
    understanding: [
      "Profound intuitive and symbolic understanding",
      "May function more from insight than intellect",
      "Needs encouragement to translate insights"
    ],
    change: [
      "Sees change as canvas for expression",
      "Playfully dismantles and rebuilds paradigms",
      "Change = creation"
    ],
    responsibility: [
      "Feels responsible for shaping energetic and cultural reality",
      "Holds stewardship over gifts and influence",
      "Benefits from conscious containment and focus"
    ],
    help: [
      "Help flows as collaboration, not hierarchy",
      "Serves as a creative midwife for others",
      "Attracts support that matches frequency"
    ],
    work: [
      "Work is a portal for creation and transmission",
      "Often nonlinear or unconventional",
      "Can generate breakthroughs across domains"
    ],
    emotionalDriver: {
      title: "Expression / Vision",
      description: "Creative Power flows from deep connection to one's essence and purpose—it builds new worlds, not just better systems."
    }
  },
  pureAwareness: {
    id: "pureAwareness",
    name: "Pure Awareness",
    theme: "Stillness, spaciousness, non-attachment, beingness",
    coreBeliefs: [
      "I am.",
      "Everything is as it is.",
      "There is peace beyond form."
    ],
    behaviorPatterns: [
      "Still, silent, radiant presence",
      "Acts without attachment",
      "May do very little but influence greatly",
      "Rests in awareness rather than effort"
    ],
    communicationPatterns: [
      "Few words, deep transmission",
      "Communicates presence more than ideas",
      "Silence can be more powerful than speech"
    ],
    coachingNotes: [
      "Do not disturb with unnecessary tasks",
      "This level may not need traditional coaching—more witnessing and reverence",
      "Support expression if they wish to return with insight to share"
    ],
    connection: [
      "Union with all beings and no one in particular",
      "Radiates compassion without personal need",
      "Oneness, not intimacy"
    ],
    reality: [
      "Sees through illusion to essence",
      "Accepts reality without clinging",
      "Clear seeing beyond duality"
    ],
    understanding: [
      "Beyond conceptual understanding",
      "Abides in awareness of awareness",
      "Insight arises from stillness, not search"
    ],
    change: [
      "Nothing to change, nothing to fix",
      "Paradoxically initiates deep transformation in others",
      "Embodies acceptance"
    ],
    responsibility: [
      "Identity with \"doer\" may dissolve",
      "Allows life to flow through without interference",
      "Responsibility becomes surrender"
    ],
    help: [
      "Offers help through presence, not performance",
      "Can trigger healing or awakening simply by being",
      "Doesn't seek to help—help happens"
    ],
    work: [
      "Work is being, not doing",
      "Action arises only when necessary or divinely guided",
      "Can appear inactive but radiates impact"
    ],
    emotionalDriver: {
      title: "Stillness / Beingness",
      description: "At this level, doing dissolves into being. Presence itself transforms."
    }
  }
};

// Helper function to get state details by name (case-insensitive)
export const getStateDetailsByName = (stateName: string): HarmonicStateDetails | null => {
  const normalizedName = stateName.toLowerCase().replace(/\s+/g, '');
  
  // Map common variations to our keys
  const nameMap: Record<string, string> = {
    'apathy': 'apathy',
    'grief': 'grief',
    'fear': 'fear',
    'covertresistance': 'covertResistance',
    'anger': 'anger',
    'antagonism': 'antagonism',
    'boredom': 'boredom',
    'willingness': 'willingness',
    'stability': 'stability',
    'enthusiasm': 'enthusiasm',
    'exhilaration': 'exhilaration',
    'action': 'action',
    'creativepower': 'creativePower',
    'pureAwareness': 'pureAwareness'
  };
  
  const key = nameMap[normalizedName];
  return key ? harmonicStateDetails[key] : null;
};