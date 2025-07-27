import React from 'react';
import { Brain, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const EmotionalStatesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 sticky top-0 z-40">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Brain className="h-6 w-6 text-blue-600" />
            <span className="ml-2 font-semibold text-gray-900">Emotional Dynamics Indicator™</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Emotional Dynamics Indicator™ - Master Table of Harmonic States</h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          The spectrum of emotional states arranged from lowest frequency (Apathy) to highest frequency (Pure Awareness).
          Each state has its characteristic beliefs, behaviors, and communication patterns.
        </p>

        <div className="max-w-4xl mx-auto space-y-6 pb-20">
          {/* Apathy */}
          <div className="rounded-lg overflow-hidden shadow-md">
            <div className="bg-emotion-apathy text-white p-6">
              <h2 className="text-2xl font-bold mb-4">Apathy</h2>
              <div className="space-y-3">
                <p><span className="font-semibold">Beliefs:</span> Nothing matters. There's no point in trying.</p>
                <p><span className="font-semibold">Behavior Patterns:</span> Disengaged, withdrawn, passive, lacks motivation.</p>
                <p><span className="font-semibold">Communication Patterns:</span> Barely speaks, avoids eye contact, flat or no emotional tone.</p>
                <p><span className="font-semibold">Coaching Notes:</span> Reconnect with safety, body awareness, and small sensory wins to reengage aliveness.</p>
              </div>
            </div>
          </div>

          {/* Grief */}
          <div className="rounded-lg overflow-hidden shadow-md">
            <div className="bg-emotion-grief text-white p-6">
              <h2 className="text-2xl font-bold mb-4">Grief</h2>
              <div className="space-y-3">
                <p><span className="font-semibold">Beliefs:</span> Something important has been lost forever.</p>
                <p><span className="font-semibold">Behavior Patterns:</span> Fearful, nostalgic, regrets the past, may isolate.</p>
                <p><span className="font-semibold">Communication Patterns:</span> Soft tone, often reliving losses or what could have been.</p>
                <p><span className="font-semibold">Coaching Notes:</span> Honor the loss, create a new context of meaning, and introduce gentle forward-looking language.</p>
              </div>
            </div>
          </div>

          {/* Fear */}
          <div className="rounded-lg overflow-hidden shadow-md">
            <div className="bg-emotion-fear text-white p-6">
              <h2 className="text-2xl font-bold mb-4">Fear</h2>
              <div className="space-y-3">
                <p><span className="font-semibold">Beliefs:</span> Something bad is about to happen.</p>
                <p><span className="font-semibold">Behavior Patterns:</span> Anxious, overthinks, hesitates, avoids decision-making.</p>
                <p><span className="font-semibold">Communication Patterns:</span> Worried tone, asks 'what if' questions, seeks reassurance.</p>
                <p><span className="font-semibold">Coaching Notes:</span> Build safety, regulate nervous system, create certainty through micro-commitments.</p>
              </div>
            </div>
          </div>

          {/* Covert Resistance */}
          <div className="rounded-lg overflow-hidden shadow-md">
            <div className="bg-emotion-covertResistance text-white p-6">
              <h2 className="text-2xl font-bold mb-4">Covert Resistance</h2>
              <div className="space-y-3">
                <p><span className="font-semibold">Beliefs:</span> I can't confront directly, so I manipulate.</p>
                <p><span className="font-semibold">Behavior Patterns:</span> Passive-aggressive, agreeable but undermining, gossipy.</p>
                <p><span className="font-semibold">Communication Patterns:</span> Barbed jokes, sarcasm, indirect or insincere tone.</p>
                <p><span className="font-semibold">Coaching Notes:</span> Build trust and transparency, reflect hidden resistance, use calibration questions.</p>
              </div>
            </div>
          </div>

          {/* Anger */}
          <div className="rounded-lg overflow-hidden shadow-md">
            <div className="bg-emotion-anger text-white p-6">
              <h2 className="text-2xl font-bold mb-4">Anger</h2>
              <div className="space-y-3">
                <p><span className="font-semibold">Beliefs:</span> My boundaries have been violated; I need to protect myself.</p>
                <p><span className="font-semibold">Behavior Patterns:</span> Confrontational, defensive, may attack or withdraw.</p>
                <p><span className="font-semibold">Communication Patterns:</span> Raised voice, accusatory language, blaming others.</p>
                <p><span className="font-semibold">Coaching Notes:</span> Acknowledge the emotion, find the legitimate need behind anger, create healthy expression channels.</p>
              </div>
            </div>
          </div>

          {/* Antagonism */}
          <div className="rounded-lg overflow-hidden shadow-md">
            <div className="bg-emotion-antagonism text-white p-6">
              <h2 className="text-2xl font-bold mb-4">Antagonism</h2>
              <div className="space-y-3">
                <p><span className="font-semibold">Beliefs:</span> The world is a hostile place; I must fight to survive.</p>
                <p><span className="font-semibold">Behavior Patterns:</span> Argumentative, oppositional, creates conflict.</p>
                <p><span className="font-semibold">Communication Patterns:</span> Contradicts others, plays devil's advocate, debates unnecessarily.</p>
                <p><span className="font-semibold">Coaching Notes:</span> Explore core values, redirect combative energy to constructive causes, develop collaborative skills.</p>
              </div>
            </div>
          </div>

          {/* Boredom */}
          <div className="rounded-lg overflow-hidden shadow-md">
            <div className="bg-emotion-boredom text-white p-6">
              <h2 className="text-2xl font-bold mb-4">Boredom</h2>
              <div className="space-y-3">
                <p><span className="font-semibold">Beliefs:</span> Nothing is interesting; life is dull and repetitive.</p>
                <p><span className="font-semibold">Behavior Patterns:</span> Restless, difficulty focusing, seeks stimulation.</p>
                <p><span className="font-semibold">Communication Patterns:</span> Distracted, flat affect, frequent sighing, minimal engagement.</p>
                <p><span className="font-semibold">Coaching Notes:</span> Spark curiosity, find meaningful challenges, connect to deeper purpose and values.</p>
              </div>
            </div>
          </div>

          {/* Willingness */}
          <div className="rounded-lg overflow-hidden shadow-md">
            <div className="bg-emotion-willingness text-gray-900 p-6">
              <h2 className="text-2xl font-bold mb-4">Willingness</h2>
              <div className="space-y-3">
                <p><span className="font-semibold">Beliefs:</span> I can work with this situation; I'm open to possibilities.</p>
                <p><span className="font-semibold">Behavior Patterns:</span> Receptive, adaptable, takes initiative when needed.</p>
                <p><span className="font-semibold">Communication Patterns:</span> Open to discussion, asks questions, considers different viewpoints.</p>
                <p><span className="font-semibold">Coaching Notes:</span> Cultivate flexibility, develop bias toward action, build on existing openness.</p>
              </div>
            </div>
          </div>

          {/* Stability */}
          <div className="rounded-lg overflow-hidden shadow-md">
            <div className="bg-emotion-stability text-gray-900 p-6">
              <h2 className="text-2xl font-bold mb-4">Stability</h2>
              <div className="space-y-3">
                <p><span className="font-semibold">Beliefs:</span> I can handle whatever comes; I have solid ground beneath me.</p>
                <p><span className="font-semibold">Behavior Patterns:</span> Consistent, reliable, balanced approach to challenges.</p>
                <p><span className="font-semibold">Communication Patterns:</span> Clear, grounded, practical, reassuring to others.</p>
                <p><span className="font-semibold">Coaching Notes:</span> Strengthen emotional regulation, develop adaptive routines, connect stability to growth.</p>
              </div>
            </div>
          </div>

          {/* Enthusiasm */}
          <div className="rounded-lg overflow-hidden shadow-md">
            <div className="bg-emotion-enthusiasm text-white p-6">
              <h2 className="text-2xl font-bold mb-4">Enthusiasm</h2>
              <div className="space-y-3">
                <p><span className="font-semibold">Beliefs:</span> Life offers exciting possibilities; challenges are opportunities.</p>
                <p><span className="font-semibold">Behavior Patterns:</span> Energetic, engaged, initiates action, pulls others along.</p>
                <p><span className="font-semibold">Communication Patterns:</span> Animated, passionate, expressive, positive framing.</p>
                <p><span className="font-semibold">Coaching Notes:</span> Channel energy into focused outcomes, develop sustainable practices, balance with reflection.</p>
              </div>
            </div>
          </div>

          {/* Exhilaration */}
          <div className="rounded-lg overflow-hidden shadow-md">
            <div className="bg-emotion-exhilaration text-white p-6">
              <h2 className="text-2xl font-bold mb-4">Exhilaration</h2>
              <div className="space-y-3">
                <p><span className="font-semibold">Beliefs:</span> I'm on fire with possibility; everything is aligning perfectly.</p>
                <p><span className="font-semibold">Behavior Patterns:</span> Inspired action, highly productive, magnetic presence.</p>
                <p><span className="font-semibold">Communication Patterns:</span> Compelling, visionary, infectious energy, inspiring.</p>
                <p><span className="font-semibold">Coaching Notes:</span> Harness peak states for creation, develop systems to capture insights, ground with practical execution.</p>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="rounded-lg overflow-hidden shadow-md">
            <div className="bg-emotion-action text-white p-6">
              <h2 className="text-2xl font-bold mb-4">Action</h2>
              <div className="space-y-3">
                <p><span className="font-semibold">Beliefs:</span> I can create what matters through decisive movement.</p>
                <p><span className="font-semibold">Behavior Patterns:</span> Decisive, efficient, goal-oriented, persistent.</p>
                <p><span className="font-semibold">Communication Patterns:</span> Direct, concise, outcome-focused, solution-oriented.</p>
                <p><span className="font-semibold">Coaching Notes:</span> Balance doing with being, develop strategic pauses, connect actions to deeper meaning.</p>
              </div>
            </div>
          </div>

          {/* Creative Power */}
          <div className="rounded-lg overflow-hidden shadow-md">
            <div className="bg-emotion-creativePower text-white p-6">
              <h2 className="text-2xl font-bold mb-4">Creative Power</h2>
              <div className="space-y-3">
                <p><span className="font-semibold">Beliefs:</span> I can bring new realities into being through my creative capacity.</p>
                <p><span className="font-semibold">Behavior Patterns:</span> Innovative, boundary-pushing, sees novel connections.</p>
                <p><span className="font-semibold">Communication Patterns:</span> Metaphorical, stories, compelling frameworks, provocative questions.</p>
                <p><span className="font-semibold">Coaching Notes:</span> Develop creation rituals, balance innovation with execution, connect to larger creative purpose.</p>
              </div>
            </div>
          </div>

          {/* Pure Awareness */}
          <div className="rounded-lg overflow-hidden shadow-md">
            <div className="bg-emotion-pureAwareness text-gray-900 p-6 border border-gray-300">
              <h2 className="text-2xl font-bold mb-4">Pure Awareness</h2>
              <div className="space-y-3">
                <p><span className="font-semibold">Beliefs:</span> I am the witnessing capacity; all experiences arise and dissolve within awareness.</p>
                <p><span className="font-semibold">Behavior Patterns:</span> Present, responsive rather than reactive, choiceful engagement.</p>
                <p><span className="font-semibold">Communication Patterns:</span> Spacious, attentive listening, speaks from direct experience, compassionate.</p>
                <p><span className="font-semibold">Coaching Notes:</span> Cultivate witnessing practices, develop moment-to-moment awareness, integrate presence into all activities.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Color spectrum footer */}
      <div className="h-2 bg-spectrum-gradient fixed bottom-0 left-0 right-0"></div>
    </div>
  );
};

export default EmotionalStatesPage;