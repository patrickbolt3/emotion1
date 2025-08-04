/*
  # Add Complete Harmonic Scale Questions

  1. New Data
    - Add all 98 questions across 14 harmonic states
    - Each state has 7 questions (4 reflective/situational, 2 double-negative, 1 calibration)
    - Questions are ordered sequentially from 1-98

  2. Structure
    - Apathy: Questions 1-7
    - Grief: Questions 8-14
    - Fear: Questions 15-21
    - Covert Resistance: Questions 22-28
    - Anger: Questions 29-35
    - Antagonism: Questions 36-42
    - Boredom: Questions 43-49
    - Willingness: Questions 50-56
    - Stability: Questions 57-63
    - Enthusiasm: Questions 64-70
    - Exhilaration: Questions 71-77
    - Action: Questions 78-84
    - Creative Power: Questions 85-91
    - Pure Awareness: Questions 92-98
*/

-- First, get the harmonic state IDs
DO $$
DECLARE
    apathy_id uuid;
    grief_id uuid;
    fear_id uuid;
    covert_resistance_id uuid;
    anger_id uuid;
    antagonism_id uuid;
    boredom_id uuid;
    willingness_id uuid;
    stability_id uuid;
    enthusiasm_id uuid;
    exhilaration_id uuid;
    action_id uuid;
    creative_power_id uuid;
    pure_awareness_id uuid;
BEGIN
    -- Get harmonic state IDs
    SELECT id INTO apathy_id FROM harmonic_states WHERE name = 'Apathy';
    SELECT id INTO grief_id FROM harmonic_states WHERE name = 'Grief';
    SELECT id INTO fear_id FROM harmonic_states WHERE name = 'Fear';
    SELECT id INTO covert_resistance_id FROM harmonic_states WHERE name = 'Covert Resistance';
    SELECT id INTO anger_id FROM harmonic_states WHERE name = 'Anger';
    SELECT id INTO antagonism_id FROM harmonic_states WHERE name = 'Antagonism';
    SELECT id INTO boredom_id FROM harmonic_states WHERE name = 'Boredom';
    SELECT id INTO willingness_id FROM harmonic_states WHERE name = 'Willingness';
    SELECT id INTO stability_id FROM harmonic_states WHERE name = 'Stability';
    SELECT id INTO enthusiasm_id FROM harmonic_states WHERE name = 'Enthusiasm';
    SELECT id INTO exhilaration_id FROM harmonic_states WHERE name = 'Exhilaration';
    SELECT id INTO action_id FROM harmonic_states WHERE name = 'Action';
    SELECT id INTO creative_power_id FROM harmonic_states WHERE name = 'Creative Power';
    SELECT id INTO pure_awareness_id FROM harmonic_states WHERE name = 'Pure Awareness';

    -- Clear existing questions
    DELETE FROM questions;

    -- HARMONIC STATE 1: Apathy (Questions 1-7)
    INSERT INTO questions (question_text, harmonic_state, "order") VALUES
    ('I sometimes feel like there''s no point in trying, no matter what I do.', apathy_id, 1),
    ('When things go wrong, I tend to just shut down rather than react.', apathy_id, 2),
    ('I often find myself disconnected or emotionally numb, even in important situations.', apathy_id, 3),
    ('It''s hard for me to imagine a future that feels different from now.', apathy_id, 4),
    ('I don''t really think that not caring has ever hurt me.', apathy_id, 5),
    ('It''s not like nothing ever works out, even if I don''t expect it to.', apathy_id, 6),
    ('If someone asked what truly matters to me right now, I''m not sure I''d have a clear answer.', apathy_id, 7);

    -- HARMONIC STATE 2: Grief (Questions 8-14)
    INSERT INTO questions (question_text, harmonic_state, "order") VALUES
    ('I often replay moments in my past that I wish had turned out differently.', grief_id, 8),
    ('Even when I''m with others, I sometimes feel a quiet sense of emptiness or loss.', grief_id, 9),
    ('There are things I''ve lost that I don''t think I''ve ever truly moved on from.', grief_id, 10),
    ('It''s hard to fully enjoy the present when part of me still feels weighed down.', grief_id, 11),
    ('I don''t believe that feeling sad is something I can just get over.', grief_id, 12),
    ('It''s not like everything is fine, even when I try to act like it is.', grief_id, 13),
    ('If someone asked me if I''ve truly healed from my past, I''d probably hesitate to say yes.', grief_id, 14);

    -- HARMONIC STATE 3: Fear (Questions 15-21)
    INSERT INTO questions (question_text, harmonic_state, "order") VALUES
    ('I often imagine the worst-case scenario before making a decision.', fear_id, 15),
    ('There are situations I avoid because they feel too unpredictable or risky.', fear_id, 16),
    ('I sometimes feel tense or on edge even when nothing specific is wrong.', fear_id, 17),
    ('I tend to overthink things, just in case something goes wrong.', fear_id, 18),
    ('I don''t think that being overly cautious has ever held me back.', fear_id, 19),
    ('It''s not like I''m always afraid, I just like to be prepared.', fear_id, 20),
    ('If I really slowed down and noticed my body, I''d probably realize I''m not as relaxed as I seem.', fear_id, 21);

    -- HARMONIC STATE 4: Covert Resistance (Questions 22-28)
    INSERT INTO questions (question_text, harmonic_state, "order") VALUES
    ('I sometimes act like I agree on the outside, even when I''m not fully on board inside.', covert_resistance_id, 22),
    ('It''s common for me to question people''s motives, even when they seem supportive.', covert_resistance_id, 23),
    ('I''ve found that keeping my guard up is often the smarter option.', covert_resistance_id, 24),
    ('I tend to go along with things publicly but remain unconvinced privately.', covert_resistance_id, 25),
    ('I don''t really think that holding back my real thoughts creates problems.', covert_resistance_id, 26),
    ('It''s not like I''m actively resisting, I just have a different perspective.', covert_resistance_id, 27),
    ('If I had to choose between honesty and keeping the peace, I''d probably stay quiet.', covert_resistance_id, 28);

    -- HARMONIC STATE 5: Anger (Questions 29-35)
    INSERT INTO questions (question_text, harmonic_state, "order") VALUES
    ('When I feel disrespected or ignored, I have a hard time staying quiet.', anger_id, 29),
    ('I sometimes feel like I''m carrying a fire inside, even if I don''t show it.', anger_id, 30),
    ('I don''t mind getting into arguments when I think something needs to be said.', anger_id, 31),
    ('There are moments where I feel ready to explode, even over small things.', anger_id, 32),
    ('I don''t think that letting people know I''m angry is a bad thing.', anger_id, 33),
    ('It''s not like I go around picking fights, I just stand my ground.', anger_id, 34),
    ('If someone asked whether I''ve been feeling tense or reactive lately, I''d probably admit it.', anger_id, 35);

    -- HARMONIC STATE 6: Antagonism (Questions 36-42)
    INSERT INTO questions (question_text, harmonic_state, "order") VALUES
    ('I often notice what''s wrong with people or systems before I notice what''s working.', antagonism_id, 36),
    ('I don''t mind pushing back or speaking up, especially when something seems off.', antagonism_id, 37),
    ('I''ve been told I can come across as blunt or confrontational, but I''m just being real.', antagonism_id, 38),
    ('Sometimes I feel like people need a wake-up call, and I''m the one who''ll say it.', antagonism_id, 39),
    ('I don''t really think that being direct or critical makes things worse.', antagonism_id, 40),
    ('It''s not like I''m angry all the time, I just don''t tolerate nonsense.', antagonism_id, 41),
    ('If someone told me to "just let it go," I''d probably think they don''t get it.', antagonism_id, 42);

    -- HARMONIC STATE 7: Boredom (Questions 43-49)
    INSERT INTO questions (question_text, harmonic_state, "order") VALUES
    ('I often feel like I''m just going through the motions, without much excitement.', boredom_id, 43),
    ('Things that used to interest me now seem kind of dull or repetitive.', boredom_id, 44),
    ('I sometimes feel like I''m waiting for something to change, but not sure what.', boredom_id, 45),
    ('I crave more challenge or stimulation, even if I don''t act on it.', boredom_id, 46),
    ('I don''t think that having nothing to complain about means I''m satisfied.', boredom_id, 47),
    ('It''s not like I''m miserable, I''m just not really engaged either.', boredom_id, 48),
    ('If someone asked me what I''m passionate about right now, I''d probably need a minute to think.', boredom_id, 49);

    -- HARMONIC STATE 8: Willingness (Questions 50-56)
    INSERT INTO questions (question_text, harmonic_state, "order") VALUES
    ('I''m usually open to feedback, even when it''s uncomfortable.', willingness_id, 50),
    ('When something matters to me, I''ll put in the effort even if it''s hard.', willingness_id, 51),
    ('I believe there''s always something to learn, even from challenges.', willingness_id, 52),
    ('I tend to look for how I can help or contribute, not just what''s in it for me.', willingness_id, 53),
    ('I don''t think it''s ever hurt me to give something an honest try.', willingness_id, 54),
    ('It''s not like I need to know everything up front to get started.', willingness_id, 55),
    ('If someone asked whether I''m really open to growth right now, I''d feel comfortable saying yes.', willingness_id, 56);

    -- HARMONIC STATE 9: Stability (Questions 57-63)
    INSERT INTO questions (question_text, harmonic_state, "order") VALUES
    ('I''m usually able to stay calm and centered, even in stressful situations.', stability_id, 57),
    ('People often describe me as steady, reliable, or grounded.', stability_id, 58),
    ('I don''t get easily thrown off course by other people''s emotions or energy.', stability_id, 59),
    ('I tend to look for solutions, not drama, when things go wrong.', stability_id, 60),
    ('I don''t think being calm under pressure is something everyone naturally does.', stability_id, 61),
    ('It''s not like I never get emotional — I just don''t let it run the show.', stability_id, 62),
    ('If someone close to me were feeling overwhelmed, I''d likely be the one to ground them.', stability_id, 63);

    -- HARMONIC STATE 10: Enthusiasm (Questions 64-70)
    INSERT INTO questions (question_text, harmonic_state, "order") VALUES
    ('When I talk about things I love, my energy tends to lift the room.', enthusiasm_id, 64),
    ('I often find myself feeling genuinely excited about what''s ahead.', enthusiasm_id, 65),
    ('I bring a natural sense of momentum into projects or conversations I care about.', enthusiasm_id, 66),
    ('I feel most alive when I''m engaged with something meaningful.', enthusiasm_id, 67),
    ('I don''t think I''ve ever regretted letting myself get passionate about something.', enthusiasm_id, 68),
    ('It''s not like I''m overly positive, I just really care about what I''m doing.', enthusiasm_id, 69),
    ('If someone asked what lights me up right now, I could answer immediately.', enthusiasm_id, 70);

    -- HARMONIC STATE 11: Exhilaration (Questions 71-77)
    INSERT INTO questions (question_text, harmonic_state, "order") VALUES
    ('There are moments when I feel so alive it''s like I''m buzzing with energy.', exhilaration_id, 71),
    ('I sometimes catch myself laughing or smiling for no specific reason, just because I feel good.', exhilaration_id, 72),
    ('When I''m truly in the flow, it feels like time disappears.', exhilaration_id, 73),
    ('I''ve had times where my energy felt limitless and contagious.', exhilaration_id, 74),
    ('I don''t believe that feeling this good needs to be toned down or hidden.', exhilaration_id, 75),
    ('It''s not like I''m always on a high, but when I am — I feel unstoppable.', exhilaration_id, 76),
    ('If someone asked whether I''ve recently had a moment of pure joy or inspiration, I''d say yes without hesitation.', exhilaration_id, 77);

    -- HARMONIC STATE 12: Action (Questions 78-84)
    INSERT INTO questions (question_text, harmonic_state, "order") VALUES
    ('When I commit to something, I move forward with clarity and consistency.', action_id, 78),
    ('I often feel a sense of momentum and direction, even when things are challenging.', action_id, 79),
    ('I enjoy turning ideas into results — I thrive on making progress.', action_id, 80),
    ('Taking action gives me energy, especially when it aligns with what matters to me.', action_id, 81),
    ('I don''t think waiting for the perfect time ever helped me move forward.', action_id, 82),
    ('It''s not like I''m busy for the sake of being busy — I know what I''m building.', action_id, 83),
    ('If someone asked what I''m actively working toward right now, I''d have a clear answer.', action_id, 84);

    -- HARMONIC STATE 13: Creative Power (Questions 85-91)
    INSERT INTO questions (question_text, harmonic_state, "order") VALUES
    ('I feel like my ideas, words, or work can have a real impact on others.', creative_power_id, 85),
    ('When I''m creating or expressing myself fully, I feel deeply aligned.', creative_power_id, 86),
    ('I often find myself generating new ideas or solutions without forcing it.', creative_power_id, 87),
    ('My actions feel like an extension of something bigger than just me.', creative_power_id, 88),
    ('I don''t believe that creativity is just for artists — it''s part of how I lead or live.', creative_power_id, 89),
    ('It''s not like I''m trying to impress anyone — I''m simply being fully myself.', creative_power_id, 90),
    ('If someone asked when I feel most powerful or free, I''d say: when I''m creating.', creative_power_id, 91);

    -- HARMONIC STATE 14: Pure Awareness (Questions 92-98)
    INSERT INTO questions (question_text, harmonic_state, "order") VALUES
    ('I often experience moments of stillness where I feel completely at peace.', pure_awareness_id, 92),
    ('There are times when I''m just aware of being, without needing to think or do.', pure_awareness_id, 93),
    ('I feel connected to something beyond myself, even if I can''t explain it.', pure_awareness_id, 94),
    ('When I''m fully present, I notice a kind of quiet intelligence beneath everything.', pure_awareness_id, 95),
    ('I don''t believe I need to be doing something to feel deeply alive.', pure_awareness_id, 96),
    ('It''s not like I''m disconnected — I''m just aware without being attached.', pure_awareness_id, 97),
    ('If someone asked me what I truly am beneath it all, I''d pause before answering.', pure_awareness_id, 98);

END $$;