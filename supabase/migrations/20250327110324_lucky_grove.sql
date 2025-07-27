/*
  # Sample harmonic states data

  This migration populates the harmonic_states table with the 14 emotional states
  used in the Emotional Dynamics Indicator assessment.
*/

-- Insert sample harmonic states
INSERT INTO harmonic_states (name, description, color, coaching_tips)
VALUES
  (
    'Antagonism',
    'In this state, you tend to resist or challenge others. You may often feel the need to defend your position or push back against perceived threats. This energy can be protective but sometimes creates unnecessary conflict.',
    '#FF5252',
    'Focus on helping the client recognize when defensiveness is serving them versus when it''s creating unnecessary conflict. Encourage more conscious choices about when to engage versus when to observe.'
  ),
  (
    'Resistance',
    'You experience persistent internal friction against change or external demands. This state manifests as hesitation, procrastination, or passive opposition. While protective, it can prevent growth and adaptation.',
    '#FF7043',
    'Work with the client to identify the underlying fears driving resistance. Timeline techniques are effective for locating the root experiences. Practice gradually expanding comfort zones with small, manageable steps.'
  ),
  (
    'Frustration',
    'You regularly experience the tension of unmet expectations or blocked goals. This state is characterized by impatience and irritability. While motivating at times, persistent frustration depletes your emotional resources.',
    '#FFA726',
    'Help the client distinguish between productive frustration (signaling needed change) and unproductive rumination. Teach pattern interruption techniques and reframing skills to transform frustration into determined action.'
  ),
  (
    'Overwhelm',
    'You feel submerged by demands, information, or emotional stimuli beyond your capacity to process. This state manifests as mental paralysis or anxiety. While signaling legitimate limits, it can become a habitual response.',
    '#FFCA28',
    'Focus on practical organization tools and boundaries. Somatic techniques for nervous system regulation are essential. Help create structure around decision-making processes to reduce cognitive load.'
  ),
  (
    'Uncertainty',
    'You experience persistent doubt and difficulty committing to decisions or beliefs. While this state promotes openness and consideration, excessive uncertainty leads to inaction and anxiety about making wrong choices.',
    '#FFEE58',
    'Work on developing the client''s internal compass and decision-making confidence. Values clarification exercises help establish clearer priorities. Practice making small decisions with full commitment to build the decision muscle.'
  ),
  (
    'Longing',
    'You regularly experience yearning for what''s missing or nostalgia for what''s lost. This state connects you to deeper desires but can create attachment to specific outcomes rather than appreciating present reality.',
    '#C0CA33',
    'Help the client translate longing into clear visions while developing greater presence. Focus on the underlying values represented by what they long for rather than specific forms. Practice gratitude for what already exists.'
  ),
  (
    'Apathy',
    'You experience emotional disconnection and reduced motivation. This state can provide a needed break from intensity but when persistent leads to disengagement from what matters and diminished life energy.',
    '#26A69A',
    'Don''t try to push through apathy directly. Instead, focus on curiosity and micro-interests. Physical movement and changing environments are crucial. Help the client reconnect with fundamental values before working on motivation.'
  ),
  (
    'Contentment',
    'You experience satisfaction with current circumstances and peace of mind. This harmonious state brings clarity and appreciation but can sometimes lead to complacency or resistance to beneficial growth opportunities.',
    '#29B6F6',
    'Help the client distinguish between authentic contentment and settling. Explore how they can maintain inner peace while still embracing growth. Contentment can be expanded to include more dimensions of life experience.'
  ),
  (
    'Curiosity',
    'You regularly experience openness to discovery and learning. This state drives exploration and connection but can sometimes manifest as distraction or difficulty focusing on completion when consistently jumping to what''s new.',
    '#5C6BC0',
    'Channel natural curiosity into deeper inquiry rather than constant novelty-seeking. Help establish completion rituals for projects. Curiosity can be directed toward mastery when properly focused.'
  ),
  (
    'Enthusiasm',
    'You experience energetic engagement and excitement about possibilities. This vibrant state fuels action and inspires others but can sometimes lead to scattered focus or taking on too many initiatives simultaneously.',
    '#7E57C2',
    'Help the client harness enthusiastic energy through prioritization and pacing. Develop systems for evaluating opportunities against core objectives. Enthusiasm becomes more powerful when strategically directed.'
  ),
  (
    'Confidence',
    'You embody assured belief in your capabilities and decisions. This empowered state enables decisive action but can sometimes reduce receptivity to feedback or consideration of alternative perspectives.',
    '#EC407A',
    'Work on balancing confidence with openness and humility. Develop the meta-skill of knowing when to be certain versus when to question. Confidence can be maintained while still remaining receptive to refinement.'
  ),
  (
    'Reverence',
    'You experience deep respect and appreciation for something greater than yourself. This state brings perspective and meaning but can sometimes manifest as idealization or difficulty taking necessary action due to excessive deference.',
    '#AB47BC',
    'Help the client translate reverence into grounded action. Connect transcendent experiences with everyday choices. Reverence becomes most powerful when it informs practical engagement rather than remaining abstract.'
  ),
  (
    'Harmony',
    'You experience balance, proportion and resonance across multiple dimensions. This integrative state brings cohesion to complexity but can sometimes lead to excessive compromise to maintain peace rather than addressing necessary tensions.',
    '#42A5F5',
    'Focus on distinguishing true harmony from conflict avoidance. Develop skills for productive engagement with necessary tensions. True harmony includes and transcends differences rather than suppressing them.'
  ),
  (
    'Presence',
    'You experience full engagement with the immediate moment, unburdened by past or future concerns. This state brings clarity and direct experience but requires continual return as the mind naturally time-travels.',
    '#66BB6A',
    'Develop practical mindfulness habits integrated into daily activities. Connect present-moment awareness with purposeful action. Presence becomes most valuable when it informs both being and doing.'
  );