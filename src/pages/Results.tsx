import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Brain, ChevronRight, Download, Share2, ArrowLeft, BarChart3, User, Mail, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AssessmentResult {
  id: string;
  dominantState: string;
  results: Record<string, number>;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  completed: boolean;
}

interface HarmonicState {
  id: string;
  name: string;
  description: string;
  color: string;
  coaching_tips: string | null;
  level: number;
  detailed_content: {
    core_beliefs: string[];
    behavior_patterns: string[];
    communication_patterns: string[];
    coaching_notes: string[];
    connection: string[];
    reality: string[];
    understanding: string[];
    change: string[];
    responsibility: string[];
    help: string[];
    work: string[];
    emotional_driver: {
      title: string;
      description: string;
    };
  };
}

interface Question {
  id: string;
  question_text: string;
  harmonic_state: string;
  order: number;
  state_name?: string;
  state_color?: string;
}

interface Response {
  question_id: string;
  score: number;
}

// Comprehensive harmonic state data
const harmonicStateData: Record<string, HarmonicState['detailed_content']> = {
  'Apathy': {
    core_beliefs: [
      "Nothing matters.",
      "There's no point in trying.",
      "I'm broken and no one can help."
    ],
    behavior_patterns: [
      "Withdrawn, motionless, low energy",
      "Avoids action, avoids eye contact",
      "May neglect basic self-care",
      "Tends to give up before starting"
    ],
    communication_patterns: [
      "Monotone or flat speech, or no speech at all",
      "Delayed or non-responsiveness",
      "Struggles to express emotions or needs",
      "May not initiate conversation even when in distress"
    ],
    coaching_notes: [
      "Focus on micro-movements, body awareness, and simple sensory engagement",
      "Do not try to 'motivate' directly—first build safety and attunement",
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
    emotional_driver: {
      title: "Hopelessness / Collapse",
      description: "The system is shut down from perceived futility. There's no reason to act, because 'nothing works.'"
    }
  },
  'Grief': {
    core_beliefs: [
      "Something important is gone forever.",
      "I'll never recover.",
      "Life is about losing what you love."
    ],
    behavior_patterns: [
      "Tearful or emotionally expressive in short bursts",
      "Withdraws into memory, nostalgia, or past events",
      "May isolate or seek comfort constantly",
      "Fluctuates between sadness and numbness"
    ],
    communication_patterns: [
      "Expresses loss or longing, sometimes repeatedly",
      "May become reflective, poetic, or sentimental",
      "Speaks of 'what used to be' more than 'what is' or 'what could be'"
    ],
    coaching_notes: [
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
    emotional_driver: {
      title: "Loss / Longing",
      description: "The heart is oriented toward something that was meaningful and is now gone—fueling sorrow and seeking healing."
    }
  },
  'Fear': {
    core_beliefs: [
      "The world is unsafe.",
      "I will be hurt or judged if I act.",
      "Better to hide than risk anything."
    ],
    behavior_patterns: [
      "Hesitant, watchful, avoids risk or exposure",
      "May freeze, over-prepare, or overthink",
      "Avoids confrontation and uncertainty",
      "May follow routines rigidly to maintain control"
    ],
    communication_patterns: [
      "Cautious, overly filtered, seeking reassurance",
      "May ask lots of questions but act on few answers",
      "Withdraws or deflects when challenged"
    ],
    coaching_notes: [
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
    emotional_driver: {
      title: "Safety / Avoidance",
      description: "The core motive is avoiding harm or failure. Behavior is controlled by the pursuit of protection and escape from exposure."
    }
  },
  'Covert Resistance': {
    core_beliefs: [
      "I'll pretend to go along—but I won't truly commit.",
      "They can't control me if they don't see it coming.",
      "The only safe power is hidden power."
    ],
    behavior_patterns: [
      "Smiling compliance while secretly undermining",
      "Sabotages progress through inaction or delay",
      "Appears cooperative but avoids real accountability",
      "Uses charm or helplessness to deflect responsibility"
    ],
    communication_patterns: [
      "Sugar-coated language with hidden barbs",
      "Plays the victim or martyr while resenting the role",
      "Compliments with subtle sarcasm or doubt beneath the words"
    ],
    coaching_notes: [
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
      "May subtly blame others or 'forget' commitments",
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
    emotional_driver: {
      title: "Control / Hidden Power",
      description: "This person seeks power through indirect means—avoiding direct conflict while subtly asserting dominance or revenge."
    }
  },
  'Anger': {
    core_beliefs: [
      "People are wrong and need to be corrected.",
      "I must fight to be heard or respected.",
      "If I don't push back, I'll be overpowered."
    ],
    behavior_patterns: [
      "Explosive or intense reactions",
      "Easily triggered, critical, or confrontational",
      "Defends ego, territory, or pride with aggression",
      "May dominate or intimidate to feel strong"
    ],
    communication_patterns: [
      "Sharp tone, raised voice, or cutting remarks",
      "Interrupts or talks over others",
      "Focuses on blame and what's wrong with others"
    ],
    coaching_notes: [
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
    emotional_driver: {
      title: "Injustice / Threat to Power",
      description: "Anger is often protecting a deeper wound—usually tied to a perceived injustice, betrayal, or loss of control."
    }
  },
  'Antagonism': {
    core_beliefs: [
      "If I don't challenge others, they'll control me.",
      "People are generally wrong, weak, or fake.",
      "Life is a battle of wit and will."
    ],
    behavior_patterns: [
      "Argumentative, sarcastic, and contrarian",
      "Pokes holes in ideas, questions authority reflexively",
      "Seeks attention by stirring conflict or criticism",
      "Thrives on being 'right' or making others look foolish"
    ],
    communication_patterns: [
      "Snarky or biting humor",
      "Constant debate or playing devil's advocate",
      "Pushes buttons, interrupts, or provokes emotional reactions"
    ],
    coaching_notes: [
      "Do not personalize resistance—stay grounded and neutral",
      "Engage their intellect and challenge constructively",
      "Use collaborative language: 'Let's test this together'",
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
    emotional_driver: {
      title: "Control Through Challenge",
      description: "Antagonism protects the self by keeping others off-balance—asserting power through friction, disagreement, or exposure of weakness."
    }
  },
  'Boredom': {
    core_beliefs: [
      "There's nothing exciting or meaningful happening.",
      "Life is predictable and uninspiring.",
      "I'm not suffering—but I'm not thriving either."
    ],
    behavior_patterns: [
      "Wanders mentally or physically",
      "Starts things but lacks follow-through",
      "Distracted, fidgety, or casually critical",
      "Seeks novelty without commitment"
    ],
    communication_patterns: [
      "Casual, aloof tone",
      "May joke about seriousness or meaninglessness",
      "Often noncommittal or indecisive in conversation"
    ],
    coaching_notes: [
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
    emotional_driver: {
      title: "Stimulation / Meaning Seeking",
      description: "Boredom isn't apathy—it's the desire for something more, without clarity or urgency. Beneath it is the search for authentic engagement and inspiration."
    }
  },
  'Willingness': {
    core_beliefs: [
      "I can improve and make a difference.",
      "Life works better when I participate.",
      "I have something valuable to offer."
    ],
    behavior_patterns: [
      "Proactive and open to learning",
      "Follows through on commitments",
      "Seeks feedback and applies it constructively",
      "Engages in tasks with optimism and initiative"
    ],
    communication_patterns: [
      "Encouraging, curious, and inclusive tone",
      "Asks constructive questions",
      "Open to differing views without defensiveness"
    ],
    coaching_notes: [
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
    emotional_driver: {
      title: "Growth / Contribution",
      description: "This person is driven by a desire to participate, improve, and support others—they are ready to move forward and elevate those around them."
    }
  },
  'Stability': {
    core_beliefs: [
      "I am capable and centered.",
      "Things work when I show up consistently.",
      "I can trust life and myself."
    ],
    behavior_patterns: [
      "Calm, consistent, dependable",
      "Handles stress with emotional maturity",
      "Makes measured decisions without overreaction",
      "Models balanced routines and habits"
    ],
    communication_patterns: [
      "Clear, thoughtful, and measured",
      "Listens well and speaks with intention",
      "Resolves conflict with calm authority"
    ],
    coaching_notes: [
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
    emotional_driver: {
      title: "Trust / Integration",
      description: "This state is driven by a desire for inner and outer harmony—balancing reason, emotion, and purpose to create sustainable stability."
    }
  },
  'Enthusiasm': {
    core_beliefs: [
      "Life is full of exciting possibilities.",
      "I am here to create, grow, and inspire.",
      "When I express myself fully, life opens up."
    ],
    behavior_patterns: [
      "Energized, expressive, and optimistic",
      "Takes bold action and inspires others",
      "Embraces challenges with a can-do attitude",
      "May overcommit due to high momentum"
    ],
    communication_patterns: [
      "Uplifting, passionate, and visionary",
      "Speaks with conviction and emotion",
      "Easily motivates or influences others"
    ],
    coaching_notes: [
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
    emotional_driver: {
      title: "Inspiration / Expansion",
      description: "This person is propelled by a deep desire to create, uplift, and make a difference—enthusiasm fuels progress and collective momentum."
    }
  },
  'Exhilaration': {
    core_beliefs: [
      "Anything is possible right now.",
      "I am one with life's brilliance.",
      "I am living in flow and alignment."
    ],
    behavior_patterns: [
      "Electrifying presence and physical vitality",
      "Expresses spontaneous joy and creativity",
      "Often described as radiant or magnetic",
      "May leap into bold action without fear"
    ],
    communication_patterns: [
      "Highly expressive, fluid, and impassioned",
      "May shift into poetic or spiritual language",
      "Inspires without needing persuasion"
    ],
    coaching_notes: [
      "Allow celebration and flow; don't interrupt the state",
      "Channel excess energy into purpose-driven momentum",
      "Support grounding and embodiment for longevity"
    ],
    connection: [
      "Deep connection to self, others, and the present moment",
      "Effortless rapport and resonance with people",
      "Feels 'plugged in' to everything"
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
    emotional_driver: {
      title: "Ecstasy / Flow",
      description: "This person is immersed in the thrill of being alive—exhilaration comes from dancing fully with the now."
    }
  },
  'Action': {
    core_beliefs: [
      "I know what I'm here to do.",
      "Focused energy creates meaningful results.",
      "I am the source of aligned outcomes."
    ],
    behavior_patterns: [
      "Laser-focused, efficient, and effective",
      "Takes strategic, aligned action",
      "Leads self and others with clarity",
      "Less outward joy, more deliberate execution"
    ],
    communication_patterns: [
      "Direct, intentional, and impactful",
      "Uses language to move things forward",
      "Motivates through vision and grounded certainty"
    ],
    coaching_notes: [
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
    emotional_driver: {
      title: "Mastery / Alignment",
      description: "Action arises from a centered place of power—the engine is not pressure, but deep clarity of purpose."
    }
  },
  'Creative Power': {
    core_beliefs: [
      "I create my reality with intention and love.",
      "The universe moves through me.",
      "My imagination is divine expression."
    ],
    behavior_patterns: [
      "Inventive, visionary, multidimensional",
      "Creates effortlessly from inspiration",
      "Blends intuition, insight, and innovation"
    ],
    communication_patterns: [
      "Visionary, abstract, symbolic",
      "Speaks in imagery, possibility, and felt-sense",
      "Invites others into deeper reality"
    ],
    coaching_notes: [
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
    emotional_driver: {
      title: "Expression / Vision",
      description: "Creative Power flows from deep connection to one's essence and purpose—it builds new worlds, not just better systems."
    }
  },
  'Pure Awareness': {
    core_beliefs: [
      "I am.",
      "Everything is as it is.",
      "There is peace beyond form."
    ],
    behavior_patterns: [
      "Still, silent, radiant presence",
      "Acts without attachment",
      "May do very little but influence greatly",
      "Rests in awareness rather than effort"
    ],
    communication_patterns: [
      "Few words, deep transmission",
      "Communicates presence more than ideas",
      "Silence can be more powerful than speech"
    ],
    coaching_notes: [
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
      "Identity with 'doer' may dissolve",
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
    emotional_driver: {
      title: "Stillness / Beingness",
      description: "At this level, doing dissolves into being. Presence itself transforms."
    }
  }
};

// Helper function to get level number from state name
const getStateLevel = (stateName: string): number => {
  const levelMap: Record<string, number> = {
    'Apathy': 1,
    'Grief': 2,
    'Fear': 3,
    'Covert Resistance': 4,
    'Anger': 5,
    'Antagonism': 6,
    'Boredom': 7,
    'Willingness': 8,
    'Stability': 9,
    'Enthusiasm': 10,
    'Exhilaration': 11,
    'Action': 12,
    'Creative Power': 13,
    'Pure Awareness': 14
  };
  return levelMap[stateName] || 0;
};

const ResultVisual: React.FC<{ state: HarmonicState }> = ({ state }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 p-8 text-center mb-8 relative"
      style={{ 
        boxShadow: `0 10px 25px -5px rgba(${hexToRgb(state.color)}, 0.2), 0 10px 10px -5px rgba(${hexToRgb(state.color)}, 0.1)` 
      }}
    >
      <div className="absolute inset-0 bg-gradient-radial from-white to-gray-50 opacity-50"></div>
      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: state.color }}></div>
      
      <div className="relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.3 
          }}
          className="w-28 h-28 rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl"
          style={{ 
            backgroundColor: state.color,
            boxShadow: `0 10px 25px rgba(${hexToRgb(state.color)}, 0.3)` 
          }}
        >
          <Brain className="h-14 w-14 text-white" />
        </motion.div>
        
        <motion.h3 
          className="text-3xl font-bold mb-4"
          style={{ color: state.color }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Level {state.level}: {state.name}
        </motion.h3>
        
        <motion.div
          className="h-2 w-3/4 max-w-md mx-auto rounded-full mb-8 shadow-sm"
          style={{ backgroundColor: state.color }}
          initial={{ width: "0%" }}
          animate={{ width: "75%" }}
          transition={{ duration: 1, delay: 0.5 }}
        ></motion.div>
        
        <motion.p 
          className="text-gray-600 leading-relaxed max-w-2xl mx-auto text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {state.description}
        </motion.p>
      </div>
    </motion.div>
  );
};

// Helper function to convert hex to rgb
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
    '79, 70, 229'; // Default blue if parsing fails
}

const Results: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [state, setState] = useState<HarmonicState | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchResults = async () => {
      try {
        if (!id) {
          setError('Invalid assessment ID');
          return;
        }
        
        // Fetch assessment with dominant state
        const { data: assessment, error: assessmentError } = await supabase
          .from('assessments')
          .select(`
            id,
            created_at,
            completed,
            dominant_state,
            results,
            user_id
          `)
          .eq('id', id)
          .single();
        
        if (assessmentError) throw assessmentError;
        if (!assessment) throw new Error('Assessment not found');
        
        // Fetch user profile for the assessment
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .eq('id', assessment.user_id)
          .single();
        
        if (profileError) throw profileError;
        
        // Fetch all questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('id, question_text, harmonic_state, order')
          .order('order', { ascending: true });
        
        if (questionsError) throw questionsError;
        
        // Fetch all harmonic states
        const { data: statesData, error: statesError } = await supabase
          .from('harmonic_states')
          .select('id, name, color')
          .order('name');
        
        if (statesError) throw statesError;
        
        // Create state map for quick lookup
        const stateMap = (statesData || []).reduce((acc, state) => {
          acc[state.id] = state;
          return acc;
        }, {} as Record<string, any>);
        
        // Enhance questions with state info
        const enhancedQuestions = (questionsData || []).map(question => ({
          ...question,
          state_name: stateMap[question.harmonic_state]?.name,
          state_color: stateMap[question.harmonic_state]?.color
        }));
        
        setQuestions(enhancedQuestions);
        
        // Fetch responses for this assessment
        const { data: responsesData, error: responsesError } = await supabase
          .from('responses')
          .select('question_id, score')
          .eq('assessment_id', id);
        
        if (responsesError) throw responsesError;
        setResponses(responsesData || []);
        
        // Fetch the dominant harmonic state details
        if (assessment.dominant_state) {
          const { data: harmonicState, error: stateError } = await supabase
            .from('harmonic_states')
            .select('*')
            .eq('id', assessment.dominant_state)
            .single();
          
          if (stateError) throw stateError;
          
          // Enhance with detailed content and level
          const enhancedState = {
            ...harmonicState,
            level: getStateLevel(harmonicState.name),
            detailed_content: harmonicStateData[harmonicState.name] || harmonicStateData['Willingness']
          };
          
          setState(enhancedState);
        }
        
        // Set the result
        setResult({
          id: assessment.id,
          dominantState: assessment.dominant_state,
          results: assessment.results,
          completed: assessment.completed,
          user: {
            id: profile.id,
            firstName: profile.first_name || 'User',
            lastName: profile.last_name || '',
            email: profile.email || '',
          },
          createdAt: assessment.created_at,
        });
      } catch (err: any) {
        console.error('Error loading results:', err);
        setError(err.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [id]);
  
  const handleSavePDF = async () => {
    try {
      // Create PDF with jsPDF
      const pdf = new jsPDF();
      
      // Convert hex color to RGB for PDF
      const hexToRgbForPdf = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16)
        ] : [79, 70, 229];
      };
      
      const [r, g, b] = hexToRgbForPdf(state?.color || '#4F46E5');
      
      // Set up the PDF
      pdf.setFontSize(24);
      pdf.setTextColor(r, g, b);
      pdf.text('Emotional Dynamics Indicator™', 20, 30);
      
      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Assessment Results', 20, 45);
      
      // Add a colored line
      pdf.setDrawColor(r, g, b);
      pdf.setLineWidth(2);
      pdf.line(20, 50, 190, 50);
      
      // User info
      pdf.setFontSize(12);
      pdf.text(`Name: ${result?.user.firstName} ${result?.user.lastName}`, 20, 70);
      pdf.text(`Email: ${result?.user.email}`, 20, 80);
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 90);
      
      // Dominant state
      pdf.setFontSize(16);
      pdf.setTextColor(r, g, b);
      pdf.text('Your Dominant Harmonic State:', 20, 110);
      
      pdf.setFontSize(20);
      pdf.text(`Level ${state?.level}: ${state?.name || ''}`, 20, 125);
      
      // Description
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      const description = state?.description || '';
      const splitDescription = pdf.splitTextToSize(description, 170);
      pdf.text(splitDescription, 20, 145);
      
      // Save the PDF
      pdf.save(`EDI-Results-${result?.user.firstName}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      setSaveMessage('Results saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving results:', error);
      setSaveMessage('Failed to save results');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="rounded-full h-16 w-16 border-4 border-t-blue-600 border-b-blue-600 border-l-transparent border-r-transparent animate-spin"></div>
      </div>
    );
  }
  
  if (error || !result || !state) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4">
        <Brain className="h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Something went wrong</h2>
        <p className="mt-2 text-gray-600">{error || 'Results not available'}</p>
        <Button className="mt-6" onClick={() => window.location.href = '/'}>
          Return to Home
        </Button>
      </div>
    );
  }

  // Calculate summary statistics
  const totalQuestions = questions.length;
  const answeredQuestions = responses.length;
  const dominantStateScore = result.results[result.dominantState] || 0;
  const maxPossibleScore = totalQuestions * 7; // Max score per question is 7
  const totalScore = Math.round((dominantStateScore / maxPossibleScore) * 100);
  
  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Background gradient */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ 
          background: `radial-gradient(circle at 50% 0%, ${state.color}, transparent 70%)`,
        }}
      ></div>
      
      {/* Header */}
      <header className="bg-white shadow-sm py-4 sticky top-0 z-40">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Brain className="h-6 w-6" style={{ color: state.color }} />
            <span className="ml-2 font-semibold text-gray-900">Assessment Result</span>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={handleSavePDF}>
              <Download className="h-4 w-4 mr-2" />
              Save PDF
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Respondent Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-md p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Respondent Information</h2>
              <div className="flex items-center">
                {result.completed ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Completed
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    <Clock className="h-4 w-4 mr-1" />
                    In Progress
                  </span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {result.user.firstName} {result.user.lastName}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-lg font-semibold text-gray-900 break-all">
                    {result.user.email}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Assessment Code</p>
                  <p className="text-lg font-semibold text-gray-900 font-mono">
                    {result.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Submission Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(result.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Summary Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="bg-white rounded-2xl shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{totalQuestions}</div>
              <div className="text-sm font-medium text-gray-600">Total Questions</div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{answeredQuestions}</div>
              <div className="text-sm font-medium text-gray-600">Answered</div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{totalScore}%</div>
              <div className="text-sm font-medium text-gray-600">Dominant Score</div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-md p-6 text-center">
              <div className="text-3xl font-bold" style={{ color: state.color }}>L{state.level}</div>
              <div className="text-sm font-medium text-gray-600">Harmonic Level</div>
            </div>
          </motion.div>
          
          {/* Dominant State Visualization */}
          <ResultVisual state={state} />
          
          {/* Detailed Content Sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid gap-6 md:grid-cols-2"
          >
            {/* Core Beliefs */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: state.color }}>Core Beliefs</h3>
              <ul className="space-y-2">
                {state.detailed_content.core_beliefs.map((belief, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-lg mr-2" style={{ color: state.color }}>•</span>
                    <span className="text-gray-700 italic">"{belief}"</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Behavior Patterns */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: state.color }}>Behavior Patterns</h3>
              <ul className="space-y-2">
                {state.detailed_content.behavior_patterns.map((pattern, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-lg mr-2" style={{ color: state.color }}>•</span>
                    <span className="text-gray-700">{pattern}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Communication Patterns */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: state.color }}>Communication Patterns</h3>
              <ul className="space-y-2">
                {state.detailed_content.communication_patterns.map((pattern, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-lg mr-2" style={{ color: state.color }}>•</span>
                    <span className="text-gray-700">{pattern}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Coaching Notes */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: state.color }}>Coaching Notes</h3>
              <ul className="space-y-2">
                {state.detailed_content.coaching_notes.map((note, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-lg mr-2" style={{ color: state.color }}>•</span>
                    <span className="text-gray-700">{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
          
          {/* Additional Detailed Sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {/* Connection */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: state.color }}>Connection</h3>
              <ul className="space-y-2">
                {state.detailed_content.connection.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-lg mr-2" style={{ color: state.color }}>•</span>
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Reality */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: state.color }}>Reality</h3>
              <ul className="space-y-2">
                {state.detailed_content.reality.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-lg mr-2" style={{ color: state.color }}>•</span>
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Understanding */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: state.color }}>Understanding</h3>
              <ul className="space-y-2">
                {state.detailed_content.understanding.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-lg mr-2" style={{ color: state.color }}>•</span>
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Change */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: state.color }}>Change</h3>
              <ul className="space-y-2">
                {state.detailed_content.change.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-lg mr-2" style={{ color: state.color }}>•</span>
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Responsibility */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: state.color }}>Responsibility</h3>
              <ul className="space-y-2">
                {state.detailed_content.responsibility.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-lg mr-2" style={{ color: state.color }}>•</span>
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Help */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: state.color }}>Help</h3>
              <ul className="space-y-2">
                {state.detailed_content.help.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-lg mr-2" style={{ color: state.color }}>•</span>
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
          
          {/* Work & Emotional Driver */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="grid gap-6 md:grid-cols-2"
          >
            {/* Work */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: state.color }}>Work</h3>
              <ul className="space-y-2">
                {state.detailed_content.work.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-lg mr-2" style={{ color: state.color }}>•</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Emotional Driver */}
            <div className="bg-white rounded-2xl shadow-md p-6 border-l-4" style={{ borderLeftColor: state.color }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: state.color }}>Emotional Driver</h3>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">{state.detailed_content.emotional_driver.title}</h4>
                <p className="text-gray-700 leading-relaxed">{state.detailed_content.emotional_driver.description}</p>
              </div>
            </div>
          </motion.div>
          
          {/* Question-wise Results Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white rounded-2xl shadow-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Question-wise Results</h2>
              <p className="text-gray-600 text-sm mt-1">Your responses to each assessment question</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Q. No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Question Text
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Your Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Harmonic State
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questions.map((question) => {
                    const response = responses.find(r => r.question_id === question.id);
                    const score = response?.score || 0;
                    
                    return (
                      <tr key={question.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {question.order}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-md">
                            {question.question_text}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                              style={{ backgroundColor: score > 0 ? (question.state_color || '#6B7280') : '#D1D5DB' }}
                            >
                              {score || '-'}
                            </div>
                            <span className="ml-2 text-xs text-gray-500">/ 7</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: question.state_color || '#6B7280' }}
                            ></div>
                            <span className="text-sm text-gray-900">
                              {question.state_name || 'Unknown'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
          
          {/* Call to action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-12 rounded-xl p-8 text-center relative overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, ${state.color}15, ${state.color}30)`,
              border: `1px solid ${state.color}40`,
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: state.color }}></div>
            
            <h3 className="text-xl font-bold text-gray-900">Want to explore this pattern further?</h3>
            <p className="mt-2 text-gray-600">
              Work with one of our certified coaches to develop strategies for understanding and evolving your emotional patterns.
            </p>
            <div className="mt-6">
              <Link to="/dashboard">
                <Button 
                  rounded="full" 
                  emotionColor={state.color}
                  variant="emotion"
                  className="px-8 shadow-lg"
                >
                  Return to Dashboard
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Results;