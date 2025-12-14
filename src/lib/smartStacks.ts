import { FREQUENCIES, FREQUENCY_BATHS, type Frequency } from '@/lib/frequencies';

export interface SmartStack {
  id: string;
  name: string;
  goal: string;
  description: string;
  emoji: string;
  frequencies: number[];
  waveforms: ('sine' | 'triangle' | 'square')[];
  reasoning: string;
  category: 'focus' | 'relaxation' | 'sleep' | 'energy' | 'healing' | 'creativity' | 'meditation' | 'manifestation';
}

// AI-curated frequency stacks based on research and traditional uses
export const SMART_STACKS: SmartStack[] = [
  // Focus & Productivity
  {
    id: 'stack-deep-focus',
    name: 'Deep Focus',
    goal: 'I want deep concentration',
    description: 'Gamma + Beta waves for enhanced cognitive performance',
    emoji: '🧠',
    frequencies: [40, 14, 10],
    waveforms: ['sine', 'sine', 'sine'],
    reasoning: '40Hz Gamma boosts memory and focus, 14Hz Beta maintains alertness, 10Hz Alpha provides calm focus.',
    category: 'focus'
  },
  {
    id: 'stack-study-session',
    name: 'Study Session',
    goal: 'I need to study or learn',
    description: 'Memory enhancement and information retention',
    emoji: '📚',
    frequencies: [528, 40, 12],
    waveforms: ['sine', 'sine', 'triangle'],
    reasoning: '528Hz DNA repair frequency aids learning, 40Hz enhances memory encoding, 12Hz promotes information processing.',
    category: 'focus'
  },
  {
    id: 'stack-creative-flow',
    name: 'Creative Flow',
    goal: 'I want to be more creative',
    description: 'Alpha-Theta border state for creative insights',
    emoji: '🎨',
    frequencies: [417, 7.83, 10],
    waveforms: ['sine', 'sine', 'triangle'],
    reasoning: '417Hz facilitates change, 7.83Hz Schumann resonance connects to Earth\'s creative pulse, 10Hz Alpha enables creative visualization.',
    category: 'creativity'
  },
  
  // Relaxation & Stress
  {
    id: 'stack-instant-calm',
    name: 'Instant Calm',
    goal: 'I feel anxious or stressed',
    description: 'Rapid stress relief and nervous system reset',
    emoji: '🌸',
    frequencies: [396, 174, 639],
    waveforms: ['sine', 'sine', 'sine'],
    reasoning: '396Hz releases fear/guilt, 174Hz is a natural anesthetic, 639Hz harmonizes relationships (including with self).',
    category: 'relaxation'
  },
  {
    id: 'stack-deep-relaxation',
    name: 'Deep Relaxation',
    goal: 'I want to deeply relax',
    description: 'Theta waves with solfeggio frequencies',
    emoji: '🧘',
    frequencies: [528, 6, 432],
    waveforms: ['sine', 'sine', 'triangle'],
    reasoning: '528Hz miracle tone for healing, 6Hz Theta promotes deep relaxation, 432Hz natural tuning for harmony.',
    category: 'relaxation'
  },
  
  // Sleep
  {
    id: 'stack-fall-asleep',
    name: 'Fall Asleep Fast',
    goal: 'I can\'t fall asleep',
    description: 'Delta + Theta waves for quick sleep onset',
    emoji: '😴',
    frequencies: [174, 2, 4],
    waveforms: ['sine', 'sine', 'sine'],
    reasoning: '174Hz natural sedative effect, 2Hz deep Delta for sleep, 4Hz Theta for the transition to sleep.',
    category: 'sleep'
  },
  {
    id: 'stack-deep-sleep',
    name: 'Deep Restorative Sleep',
    goal: 'I need better sleep quality',
    description: 'Frequencies for deep, restorative rest',
    emoji: '🌙',
    frequencies: [174, 285, 0.5],
    waveforms: ['sine', 'sine', 'sine'],
    reasoning: '174Hz pain relief for physical relaxation, 285Hz heals tissues during sleep, 0.5Hz ultra-low Delta for deepest sleep.',
    category: 'sleep'
  },
  
  // Energy & Motivation
  {
    id: 'stack-morning-energy',
    name: 'Morning Energizer',
    goal: 'I need energy to start my day',
    description: 'Awakening frequencies for vitality',
    emoji: '☀️',
    frequencies: [528, 741, 18],
    waveforms: ['sine', 'triangle', 'sine'],
    reasoning: '528Hz awakens the body, 741Hz clears toxins and awakens intuition, 18Hz Beta for alertness.',
    category: 'energy'
  },
  {
    id: 'stack-afternoon-boost',
    name: 'Afternoon Boost',
    goal: 'I\'m feeling tired midday',
    description: 'Combat afternoon slump and regain focus',
    emoji: '⚡',
    frequencies: [852, 40, 14],
    waveforms: ['sine', 'sine', 'triangle'],
    reasoning: '852Hz spiritual awakening provides mental clarity, 40Hz Gamma energizes, 14Hz Beta maintains alertness.',
    category: 'energy'
  },
  
  // Healing
  {
    id: 'stack-pain-relief',
    name: 'Pain Relief',
    goal: 'I\'m experiencing physical pain',
    description: 'Natural anesthetic frequencies',
    emoji: '💚',
    frequencies: [174, 285, 528],
    waveforms: ['sine', 'sine', 'sine'],
    reasoning: '174Hz is a natural anesthetic, 285Hz heals tissues, 528Hz promotes DNA repair and healing.',
    category: 'healing'
  },
  {
    id: 'stack-immune-boost',
    name: 'Immune Support',
    goal: 'I want to boost my immune system',
    description: 'Frequencies associated with cellular health',
    emoji: '🛡️',
    frequencies: [528, 285, 727],
    waveforms: ['sine', 'sine', 'sine'],
    reasoning: '528Hz DNA repair, 285Hz tissue healing, 727Hz Rife frequency for general wellness.',
    category: 'healing'
  },
  {
    id: 'stack-headache-relief',
    name: 'Headache Relief',
    goal: 'I have a headache',
    description: 'Soothing frequencies for head tension',
    emoji: '🧊',
    frequencies: [174, 10, 396],
    waveforms: ['sine', 'sine', 'sine'],
    reasoning: '174Hz pain relief, 10Hz Alpha relaxes tension, 396Hz releases stress held in the body.',
    category: 'healing'
  },
  
  // Meditation & Spiritual
  {
    id: 'stack-deep-meditation',
    name: 'Deep Meditation',
    goal: 'I want to meditate deeply',
    description: 'Theta state for profound meditation',
    emoji: '🕉️',
    frequencies: [432, 7.83, 6],
    waveforms: ['sine', 'sine', 'sine'],
    reasoning: '432Hz natural harmony, 7.83Hz Schumann resonance (Earth\'s heartbeat), 6Hz deep Theta for meditation.',
    category: 'meditation'
  },
  {
    id: 'stack-third-eye',
    name: 'Third Eye Activation',
    goal: 'I want to enhance intuition',
    description: 'Frequencies for pineal gland stimulation',
    emoji: '👁️',
    frequencies: [852, 963, 288],
    waveforms: ['sine', 'sine', 'triangle'],
    reasoning: '852Hz awakens intuition, 963Hz activates pineal gland, 288Hz associated with third eye chakra.',
    category: 'meditation'
  },
  {
    id: 'stack-chakra-balance',
    name: 'Full Chakra Balance',
    goal: 'I want to balance my energy centers',
    description: 'All 7 chakra frequencies in harmony',
    emoji: '🌈',
    frequencies: [396, 417, 528, 639, 741, 852, 963],
    waveforms: ['sine', 'sine', 'sine', 'sine', 'sine', 'sine', 'sine'],
    reasoning: 'Each frequency corresponds to a chakra: Root 396Hz, Sacral 417Hz, Solar 528Hz, Heart 639Hz, Throat 741Hz, Third Eye 852Hz, Crown 963Hz.',
    category: 'meditation'
  },
  
  // Manifestation
  {
    id: 'stack-abundance',
    name: 'Abundance Attractor',
    goal: 'I want to attract abundance',
    description: 'Frequencies for prosperity consciousness',
    emoji: '💰',
    frequencies: [888, 528, 639],
    waveforms: ['sine', 'sine', 'triangle'],
    reasoning: '888Hz abundance frequency, 528Hz transformation and miracles, 639Hz harmonizes relationships for opportunities.',
    category: 'manifestation'
  },
  {
    id: 'stack-manifestation',
    name: 'Manifestation Boost',
    goal: 'I want to manifest my desires',
    description: 'Theta state for subconscious programming',
    emoji: '✨',
    frequencies: [963, 528, 4],
    waveforms: ['sine', 'sine', 'sine'],
    reasoning: '963Hz connection to higher self, 528Hz transformation frequency, 4Hz Theta for accessing the subconscious.',
    category: 'manifestation'
  },
  {
    id: 'stack-self-love',
    name: 'Self Love & Confidence',
    goal: 'I want more self-confidence',
    description: 'Heart-opening frequencies for self-acceptance',
    emoji: '💜',
    frequencies: [639, 528, 417],
    waveforms: ['sine', 'sine', 'sine'],
    reasoning: '639Hz heart chakra healing, 528Hz self-transformation, 417Hz facilitates positive change.',
    category: 'manifestation'
  }
];

// Get suggested stacks based on user's stated goal
export function getSmartStackSuggestions(userGoal: string): SmartStack[] {
  const goalLower = userGoal.toLowerCase();
  
  // Keywords to category mapping
  const categoryKeywords: Record<SmartStack['category'], string[]> = {
    focus: ['focus', 'concentrate', 'study', 'work', 'productive', 'attention', 'learn', 'memory'],
    relaxation: ['relax', 'calm', 'stress', 'anxious', 'anxiety', 'peace', 'tension', 'nervous'],
    sleep: ['sleep', 'insomnia', 'tired', 'rest', 'bed', 'night', 'dream'],
    energy: ['energy', 'awake', 'morning', 'tired', 'fatigue', 'motivation', 'boost'],
    healing: ['heal', 'pain', 'hurt', 'sick', 'immune', 'headache', 'body', 'physical'],
    creativity: ['creative', 'art', 'music', 'write', 'ideas', 'inspiration', 'imagine'],
    meditation: ['meditat', 'spiritual', 'chakra', 'zen', 'mindful', 'third eye', 'intuition'],
    manifestation: ['manifest', 'attract', 'abundance', 'wealth', 'love', 'confidence', 'goal']
  };
  
  // Score each stack based on keyword matches
  const scoredStacks = SMART_STACKS.map(stack => {
    let score = 0;
    
    // Check category keywords
    const keywords = categoryKeywords[stack.category] || [];
    keywords.forEach(keyword => {
      if (goalLower.includes(keyword)) score += 10;
    });
    
    // Check goal match
    if (stack.goal.toLowerCase().includes(goalLower) || goalLower.includes(stack.goal.toLowerCase())) {
      score += 20;
    }
    
    // Check name match
    if (stack.name.toLowerCase().includes(goalLower)) {
      score += 15;
    }
    
    return { stack, score };
  });
  
  // Sort by score and return top matches
  return scoredStacks
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.stack);
}

// Get all stacks for a category
export function getStacksByCategory(category: SmartStack['category']): SmartStack[] {
  return SMART_STACKS.filter(s => s.category === category);
}

// Convert a smart stack to layer format for composer
export function convertStackToLayers(stack: SmartStack) {
  return stack.frequencies.map((hz, index) => {
    const freq = FREQUENCIES.find(f => f.hz === hz);
    return {
      uid: `smart_${Date.now()}_${index}`,
      presetId: freq?.id || `custom_${hz}`,
      name: freq?.name || `${hz}Hz`,
      category: freq?.category || 'custom',
      hz,
      waveform: stack.waveforms[index] || 'sine',
      duration: 300, // 5 minutes default
      volume: 70
    };
  });
}
