import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowRight, BarChart2, Brain, Heart, Lightbulb, Users, Book } from 'lucide-react';
import { motion } from 'framer-motion';

// Helper function to generate a dynamic color
const getEmotionColor = (index: number, total: number) => {
  const colors = [
    '#7E7E7E',   // Apathy
    '#5B7399',   // Grief
    '#9575CD',   // Fear
    '#64B5F6',   // Covert Resistance
    '#EF5350',   // Anger
    '#FF7043',   // Antagonism
    '#FFA726',   // Boredom
    '#FFEE58',   // Willingness
    '#9CCC65',   // Stability
    '#26A69A',   // Enthusiasm
    '#42A5F5',   // Exhilaration
    '#5C6BC0',   // Action
    '#AB47BC',   // Creative Power
    '#FFFFFF',   // Pure Awareness
  ];
  return colors[index % colors.length];
};

const LandingPage: React.FC = () => {
  const spectrumRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (spectrumRef.current) {
        const rect = spectrumRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Create a radial gradient effect following the mouse
        spectrumRef.current.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(236, 72, 153, 0.15), rgba(79, 70, 229, 0.1) 50%)`;
      }
    };

    const element = spectrumRef.current;
    if (element) {
      element.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (element) {
        element.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* Navigation */}
      <header className="bg-white shadow-sm backdrop-blur-sm bg-white/90 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Brain className="h-8 w-8 text-gradient-start animate-pulse-slow" />
              <span className="ml-2 text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gradient-start to-gradient-end">
                Emotional Dynamics Indicator™
              </span>
            </div>
            <div className="flex gap-4">
              <Link to="/emotional-states">
                <Button variant="ghost">Harmonic States</Button>
              </Link>
              <Link to="/questions-preview">
                <Button variant="ghost">Preview Questions</Button>
              </Link>
              <Link to="/results-preview">
                <Button variant="ghost">View Results Sample</Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link to="/register">
                <Button variant="gradient" rounded="full">Sign up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={spectrumRef} className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-emotion-wave bg-no-repeat bg-bottom"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-spectrum-gradient"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
                Discover the <span className="bg-clip-text text-transparent bg-gradient-to-r from-gradient-start to-gradient-end">emotional frequency</span> you lead from
              </h1>
              <p className="mt-6 text-xl text-gray-600">
                —and how to evolve it.
              </p>
            </motion.div>
            
            <motion.div 
              className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link to="/register">
                <Button variant="gradient" size="xl" rounded="full" className="shadow-glow animate-glow-pulse px-8 py-4">
                  Take the Free Assessment <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/emotional-states">
                <Button size="xl" variant="outline" rounded="full" className="px-8 py-4">
                  <Book className="mr-2 h-5 w-5" />
                  Harmonic States Guide
                </Button>
              </Link>
              <Link to="/questions-preview">
                <Button size="xl" variant="outline" rounded="full" className="px-8 py-4">
                  Preview Questions
                </Button>
              </Link>
              <Link to="/results-preview">
                <Button size="xl" variant="outline" rounded="full" className="px-6 py-4">
                  Sample Results
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
        
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-8 md:h-16 bg-spectrum-gradient opacity-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        ></motion.div>
      </section>

      {/* Emotion States Spectrum Visualization */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
            The <span className="bg-clip-text text-transparent bg-gradient-to-r from-gradient-start to-gradient-end">Harmonic Scale</span> of Emotional States
          </h2>
          
          <motion.div 
            className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto mb-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {[
              'Apathy', 'Grief', 'Fear', 'Covert Resistance', 
              'Anger', 'Antagonism', 'Boredom', 'Willingness', 
              'Stability', 'Enthusiasm', 'Exhilaration', 'Action', 
              'Creative Power', 'Pure Awareness'
            ].map((state, index) => (
              <motion.div 
                key={state}
                variants={itemVariants}
                className="group relative"
              >
                <div
                  className="py-2 px-4 rounded-full text-white text-sm font-medium transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
                  style={{ 
                    backgroundColor: getEmotionColor(index, 14),
                    boxShadow: `0 4px 10px rgba(0,0,0,0.1)`,
                    color: index === 13 ? '#333' : 'white'
                  }}
                >
                  {state}
                </div>
                <div className="absolute -bottom-1 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundColor: getEmotionColor(index, 14) }}></div>
              </motion.div>
            ))}
          </motion.div>
          
          <p className="text-center text-gray-600 max-w-2xl mx-auto">
            The Emotional Dynamics Indicator helps you identify which of these 14 harmonic states is currently your dominant emotional pattern.
          </p>
          
          <div className="flex justify-center mt-8">
            <Link to="/emotional-states">
              <Button variant="outline" size="lg" className="border-gradient-start text-gradient-start hover:bg-gradient-start/5">
                <Book className="mr-2 h-5 w-5" />
                View Complete Harmonic States Guide
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* What is it Section */}
      <section className="py-16 bg-gray-50 relative">
        <div className="absolute inset-0 bg-gradient-radial from-white/80 to-gray-50/30"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">What is the Emotional Dynamics Indicator™?</h2>
            <p className="mt-4 text-lg text-gray-600">
              A modern coaching tool based on the Harmonic Scale that helps you understand your dominant emotional pattern and gives coaches the tools to support your transformation.
            </p>
          </div>
          
          <motion.div 
            className="mt-16 grid gap-8 md:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.div 
              className="bg-white rounded-xl p-8 text-center shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
              variants={itemVariants}
            >
              <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg mb-5">
                <BarChart2 className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">98-Question Assessment</h3>
              <p className="mt-2 text-gray-600">Comprehensive evaluation of your emotional patterns across 14 harmonic states.</p>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl p-8 text-center shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
              variants={itemVariants}
            >
              <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg mb-5">
                <Lightbulb className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">Personalized Results</h3>
              <p className="mt-2 text-gray-600">Get insights into your dominant emotional state and actionable strategies.</p>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl p-8 text-center shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
              variants={itemVariants}
            >
              <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-pink-600 text-white shadow-lg mb-5">
                <Brain className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">AI-Powered Insights</h3>
              <p className="mt-2 text-gray-600">Conversational AI summary and coaching suggestions for deeper understanding.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Who it's for Section */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-50 opacity-50 rounded-l-full transform translate-x-1/3"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Who it's for</h2>
          </div>
          
          <div className="mt-16 grid gap-8 md:grid-cols-2">
            <motion.div 
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-gradient-start"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="mb-6">
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white shadow-lg">
                  <Heart className="h-7 w-7" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-900">Individuals</h3>
              <p className="mt-4 text-gray-600">
                Discover your dominant emotional pattern and get personalized insights to elevate your emotional intelligence and leadership style.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span className="text-gray-600">Understand your natural tendencies</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span className="text-gray-600">Learn how to leverage your emotional strengths</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span className="text-gray-600">Develop strategies for personal growth</span>
                </li>
              </ul>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-gradient-end"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="mb-6">
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-pink-600 text-white shadow-lg">
                  <Users className="h-7 w-7" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-900">Coaches & Trainers</h3>
              <p className="mt-4 text-gray-600">
                Access powerful tools to understand your clients better and provide targeted coaching based on their emotional patterns.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  <span className="text-gray-600">Gain deeper client insights</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  <span className="text-gray-600">Tailor coaching to specific harmonic states</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  <span className="text-gray-600">Track client progress over time</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-gradient-to-br from-purple-200 to-purple-300 rounded-full opacity-30 blur-3xl"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">What people are saying</h2>
          </div>
          
          <motion.div 
            className="mt-16 grid gap-8 md:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {[
              {
                quote: "The Emotional Dynamics Indicator gave me insights I've never seen from other assessments. It's transformed my coaching approach.",
                name: "Jennifer Lewis",
                role: "Executive Coach",
                initials: "JL",
                color: "bg-gradient-to-br from-blue-400 to-blue-600"
              },
              {
                quote: "Understanding my dominant state has helped me navigate challenging conversations with more awareness and intention.",
                name: "Michael Smith",
                role: "Team Leader",
                initials: "MS",
                color: "bg-gradient-to-br from-purple-400 to-purple-600"
              },
              {
                quote: "The AI coaching recommendations provided actionable steps that were surprisingly insightful for my specific situation.",
                name: "Rachel Johnson",
                role: "HR Director",
                initials: "RJ",
                color: "bg-gradient-to-br from-pink-400 to-pink-600"
              }
            ].map((testimonial, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative">
                  <div className="absolute -top-4 -left-4 text-4xl text-gray-200 font-serif">"</div>
                  <p className="italic text-gray-600 relative z-10">
                    {testimonial.quote}
                  </p>
                  <div className="absolute -bottom-4 -right-4 text-4xl text-gray-200 font-serif rotate-180">"</div>
                </div>
                <div className="mt-6 flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`h-12 w-12 rounded-full ${testimonial.color} text-white flex items-center justify-center font-medium shadow-md`}>
                      <span>{testimonial.initials}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Free vs Pro */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Free vs. Pro</h2>
            <p className="mt-4 text-lg text-gray-600">
              Choose the option that best fits your needs
            </p>
          </div>
          
          <div className="mt-16 grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
            <motion.div 
              className="bg-white rounded-xl shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900">Free Assessment</h3>
                <p className="mt-4 text-3xl font-bold text-gray-900">$0</p>
                <p className="mt-2 text-gray-600">Perfect for individual insights</p>
                
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Complete 98-question assessment</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Identify your dominant harmonic state</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Basic AI insights</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 p-8">
                <Link to="/register">
                  <Button variant="outline" className="w-full rounded-full">Start Free Assessment</Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl shadow-xl overflow-hidden relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-spectrum-gradient"></div>
              <div className="bg-gradient-to-r from-gradient-start to-gradient-end text-white text-center py-2 text-sm font-medium">
                RECOMMENDED
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900">Work with a Coach</h3>
                <p className="mt-4 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gradient-start to-gradient-end">Custom pricing</p>
                <p className="mt-2 text-gray-600">For deeper transformation</p>
                
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Everything in Free</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">1-on-1 coaching sessions</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Advanced AI coaching recommendations</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Full harmonic state profile</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Transformation strategies</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 p-8">
                <Link to="/register?role=client">
                  <Button variant="gradient" className="w-full rounded-full">Find a Coach</Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-gradient-start to-gradient-end relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-white/10 to-transparent mix-blend-overlay"></div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-white opacity-20"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-20"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2 
              className="text-3xl font-bold text-white sm:text-4xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              Ready to discover your emotional dynamics?
            </motion.h2>
            <motion.p 
              className="mt-4 text-lg text-blue-100"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Take the free assessment and start your journey to emotional mastery.
            </motion.p>
            <motion.div 
              className="mt-8 flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Link to="/register">
                <Button className="bg-white text-gradient-start hover:bg-gray-100 shadow-glow rounded-full px-8 py-3 font-medium">
                  Take the Assessment
                </Button>
              </Link>
              <Link to="/emotional-states">
                <Button variant="outline" className="text-white border-white hover:bg-white/10 rounded-full px-8 py-3 font-medium">
                  <Book className="mr-2 h-4 w-4" />
                  Harmonic States Guide
                </Button>
              </Link>
              <Link to="/questions-preview">
                <Button variant="outline" className="text-white border-white hover:bg-white/10 rounded-full px-8 py-3 font-medium">
                  Preview Questions
                </Button>
              </Link>
              <Link to="/results-preview">
                <Button variant="outline" className="text-white border-white hover:bg-white/10 rounded-full px-6 py-3 font-medium">
                  Sample Results
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="text-white border-white hover:bg-white/10 rounded-full px-8 py-3 font-medium">
                  Coach Login
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center">
                <Brain className="h-6 w-6 text-gradient-start" />
                <span className="ml-2 text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gradient-start to-gradient-end">
                  Emotional Dynamics Indicator™
                </span>
              </div>
              <p className="mt-4 text-gray-400 text-sm">
                Discover the emotional frequency you lead from—and how to evolve it.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Resources</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Blog</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Research</a></li>
                <li><Link to="/emotional-states" className="text-gray-300 hover:text-white transition-colors duration-200">The Harmonic Scale</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Company</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">About Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Contact</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Legal</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Terms of Service</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-800 pt-8">
            <p className="text-gray-400 text-sm text-center">
              &copy; {new Date().getFullYear()} Emotional Dynamics Indicator™. All rights reserved.
            </p>
          </div>
        </div>
        
        <div className="h-1 bg-spectrum-gradient opacity-20 mt-12"></div>
      </footer>
    </div>
  );
};

export default LandingPage;