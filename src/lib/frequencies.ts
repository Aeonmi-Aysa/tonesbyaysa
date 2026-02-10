export interface Frequency {
  id: string;
  name: string;
  hz: number;
  category: 'solfeggio' | 'chakra' | 'binaural' | 'healing' | 'planetary' | 'crystal' | 'color' | 'organ' | 'emotion' | 'dna' | 'immune' | 'brain' | 'sleep' | 'energy' | 'manifestation' | 'bath' | 'rife' | 'angel' | 'schumann' | 'tesla' | 'sacred' | 'tibetan' | 'vedic' | 'egyptian';
  description: string;
  benefits: string[];
  duration: number;
  isPremium: boolean;
}

// Bath (multi-frequency) interface
export interface FrequencyBath {
  id: string;
  name: string;
  frequencies: number[]; // Array of Hz values to layer together
  category: 'healing' | 'mental' | 'spiritual' | 'emotional' | 'psychic' | 'manifestation' | 'metaphysical' | 'sleep';
  description: string;
  benefits: string[];
  usage: string;
  duration: number;
  isPremium: boolean;
}

// Generate comprehensive 500+ frequency library
const generateMassiveFrequencyLibrary = (): Frequency[] => {
  const frequencies: Frequency[] = [];
  let currentId = 1;

  // SOLFEGGIO FREQUENCIES (Extended Ancient Scale)
  const solfeggioFreqs = [
    { name: 'Liberation from Fear', hz: 174, benefits: ['Deep comfort', 'Calm support', 'Grounding'], premium: false },
    { name: 'Tissue Harmony', hz: 285, benefits: ['Tissue support', 'Vitality enhancement', 'Cellular wellness'], premium: false },
    { name: 'Liberation from Guilt', hz: 396, benefits: ['Guilt release', 'Liberating fear', 'Grounding'], premium: false },
    { name: 'Facilitating Change', hz: 417, benefits: ['Facilitating change', 'Breaking negative cycles', 'Creativity'], premium: false },
    { name: 'Love & DNA Harmony', hz: 528, benefits: ['DNA harmony', 'Love frequency', 'Transformation'], premium: false },
    { name: 'Relationships', hz: 639, benefits: ['Better relationships', 'Communication', 'Understanding'], premium: false },
    { name: 'Awakening Intuition', hz: 741, benefits: ['Intuition awakening', 'Self-expression', 'Truth seeking'], premium: false },
    { name: 'Spiritual Order', hz: 852, benefits: ['Spiritual insight', 'Clarity', 'Higher consciousness'], premium: false },
    { name: 'Divine Connection', hz: 963, benefits: ['Divine connection', 'Enlightenment', 'Cosmic consciousness'], premium: false },
    { name: 'Return to Unity', hz: 1074, benefits: ['Unity consciousness', 'Spiritual awakening', 'Universal love'], premium: true },
    { name: 'Higher Awareness', hz: 1185, benefits: ['Higher awareness', 'Cosmic consciousness', 'Divine wisdom'], premium: true },
    { name: 'Divine Feminine', hz: 1296, benefits: ['Divine feminine energy', 'Intuition', 'Nurturing'], premium: true }
  ];

  solfeggioFreqs.forEach(freq => {
    frequencies.push({
      id: (currentId++).toString(),
      name: freq.name,
      hz: freq.hz,
      category: 'solfeggio',
      description: `Ancient wellness frequency for ${freq.name.toLowerCase()}`,
      benefits: freq.benefits,
      duration: 300,
      isPremium: freq.premium
    });
  });

  // CHAKRA FREQUENCIES (Complete System + Higher Chakras)
  const chakraFreqs = [
    { name: 'Earth Star Chakra', hz: 68, benefits: ['Deep grounding', 'Earth connection', 'Ancestral connection'], premium: true },
    { name: 'Root Chakra', hz: 256, benefits: ['Grounding', 'Security', 'Stability'], premium: false },
    { name: 'Sacral Chakra', hz: 288, benefits: ['Creativity', 'Sexual energy', 'Emotional balance'], premium: false },
    { name: 'Solar Plexus Chakra', hz: 320, benefits: ['Personal power', 'Confidence', 'Self-esteem'], premium: false },
    { name: 'Heart Chakra', hz: 341.3, benefits: ['Love', 'Compassion', 'Emotional balance'], premium: false },
    { name: 'Throat Chakra', hz: 384, benefits: ['Communication', 'Truth speaking', 'Self-expression'], premium: false },
    { name: 'Third Eye Chakra', hz: 426.7, benefits: ['Intuition', 'Inner wisdom', 'Clairvoyance'], premium: false },
    { name: 'Crown Chakra', hz: 480, benefits: ['Spiritual connection', 'Enlightenment', 'Divine wisdom'], premium: false },
    { name: 'Soul Star Chakra', hz: 1152, benefits: ['Soul connection', 'Higher purpose', 'Cosmic awareness'], premium: true },
    { name: 'Universal Chakra', hz: 1440, benefits: ['Universal connection', 'Oneness', 'Divine love'], premium: true }
  ];

  chakraFreqs.forEach(freq => {
    frequencies.push({
      id: (currentId++).toString(),
      name: freq.name,
      hz: freq.hz,
      category: 'chakra',
      description: `Chakra balancing frequency for ${freq.name.toLowerCase()}`,
      benefits: freq.benefits,
      duration: 300,
      isPremium: freq.premium
    });
  });

  // BINAURAL BEATS (Complete Brainwave Spectrum)
  const binauralFreqs = [
    { name: 'Deep Sleep Delta 0.5Hz', hz: 0.5, benefits: ['Deepest sleep', 'Physical restoration', 'Complete rest'], premium: false },
    { name: 'Deep Sleep Delta 1Hz', hz: 1, benefits: ['Deep sleep', 'Recovery', 'Restoration'], premium: false },
    { name: 'Deep Sleep Delta 2Hz', hz: 2, benefits: ['Sleep induction', 'Relaxation', 'Rest support'], premium: false },
    { name: 'REM Sleep Delta 3Hz', hz: 3, benefits: ['REM sleep', 'Dreaming', 'Memory consolidation'], premium: false },
    { name: 'Deep Meditation Theta 4Hz', hz: 4, benefits: ['Deep meditation', 'Spiritual connection', 'Intuition'], premium: false },
    { name: 'Creative Theta 5Hz', hz: 5, benefits: ['Creativity', 'Innovation', 'Artistic flow'], premium: false },
    { name: 'Intuitive Theta 6Hz', hz: 6, benefits: ['Intuition', 'Psychic abilities', 'Inner knowing'], premium: false },
    { name: 'Meditation Theta 7Hz', hz: 7, benefits: ['Deep meditation', 'Tranquility', 'Peace'], premium: false },
    { name: 'Relaxed Alpha 8Hz', hz: 8, benefits: ['Relaxation', 'Calm alertness', 'Stress reduction'], premium: false },
    { name: 'Learning Alpha 9Hz', hz: 9, benefits: ['Learning enhancement', 'Memory', 'Study focus'], premium: false },
    { name: 'Focus Alpha 10Hz', hz: 10, benefits: ['Enhanced focus', 'Mental clarity', 'Concentration'], premium: false },
    { name: 'Aware Alpha 11Hz', hz: 11, benefits: ['Conscious awareness', 'Mindfulness', 'Present moment'], premium: true },
    { name: 'Alert Beta 12Hz', hz: 12, benefits: ['Alertness', 'Active thinking', 'Problem solving'], premium: true },
    { name: 'Focus Beta 14Hz', hz: 14, benefits: ['Sharp focus', 'Mental acuity', 'Productivity'], premium: true },
    { name: 'High Beta 16Hz', hz: 16, benefits: ['High activity', 'Quick thinking', 'Mental agility'], premium: true },
    { name: 'Peak Beta 18Hz', hz: 18, benefits: ['Peak performance', 'Analytical thinking', 'Logic'], premium: true },
    { name: 'Gamma 40Hz', hz: 40, benefits: ['Peak cognition (MIT research-backed)', 'Memory enhancement', 'Focus & clarity', 'Neural synchronization'], premium: true },
    { name: 'High Gamma 60Hz', hz: 60, benefits: ['Expanded consciousness', 'Mystical experiences', 'Transcendence'], premium: true },
    { name: 'Ultra Gamma 80Hz', hz: 80, benefits: ['Ultimate awareness', 'Cosmic consciousness', 'Enlightenment'], premium: true }
  ];

  binauralFreqs.forEach(freq => {
    frequencies.push({
      id: (currentId++).toString(),
      name: freq.name,
      hz: freq.hz,
      category: 'binaural',
      description: `Brainwave entrainment for ${freq.name.toLowerCase()}`,
      benefits: freq.benefits,
      duration: 600,
      isPremium: freq.premium
    });
  });

  // PLANETARY FREQUENCIES (Complete Solar System + Beyond)
  const planetaryFreqs = [
    { name: 'Earth (Schumann)', hz: 7.83, benefits: ['Grounding', 'Natural sync', 'Balance'], premium: false },
    { name: 'Moon', hz: 210.42, benefits: ['Feminine energy', 'Cycles', 'Emotional balance'], premium: true },
    { name: 'Sun', hz: 126.22, benefits: ['Vitality', 'Life force', 'Solar energy'], premium: true },
    { name: 'Mercury', hz: 141.27, benefits: ['Communication', 'Mental agility', 'Learning'], premium: true },
    { name: 'Venus', hz: 221.23, benefits: ['Love', 'Beauty', 'Harmony'], premium: true },
    { name: 'Mars', hz: 144.72, benefits: ['Motivation', 'Courage', 'Action'], premium: true },
    { name: 'Jupiter', hz: 183.58, benefits: ['Abundance', 'Growth', 'Wisdom'], premium: true },
    { name: 'Saturn', hz: 147.85, benefits: ['Discipline', 'Structure', 'Responsibility'], premium: true },
    { name: 'Uranus', hz: 207.36, benefits: ['Innovation', 'Change', 'Awakening'], premium: true },
    { name: 'Neptune', hz: 211.44, benefits: ['Intuition', 'Dreams', 'Spirituality'], premium: true },
    { name: 'Pluto', hz: 140.25, benefits: ['Transformation', 'Rebirth', 'Deep renewal'], premium: true }
  ];

  planetaryFreqs.forEach(freq => {
    frequencies.push({
      id: (currentId++).toString(),
      name: `${freq.name} Frequency`,
      hz: freq.hz,
      category: 'planetary',
      description: `Planetary frequency attuned to ${freq.name}`,
      benefits: freq.benefits,
      duration: 300,
      isPremium: freq.premium
    });
  });

  // WELLNESS FREQUENCIES (Complete Support Spectrum)
  const healingFreqs = [
    // Comfort & Relaxation
    { name: 'Comfort Support', hz: 95, benefits: ['Deep relaxation', 'Soothing balance', 'Comfort'], premium: false },
    { name: 'Deep Comfort', hz: 304, benefits: ['Deep comfort support', 'Long-term relaxation', 'Quality of life'], premium: true },
    { name: 'Soothing Balance', hz: 1.2, benefits: ['Soothing support', 'Wellness acceleration', 'Recovery support'], premium: true },
    { name: 'Joint Comfort', hz: 1.5, benefits: ['Joint comfort support', 'Mobility support', 'Flexibility'], premium: true },
    
    // Tissue & Cellular Support
    { name: 'Tissue Support', hz: 285, benefits: ['Tissue wellness', 'Renewal support', 'Cellular wellness'], premium: false },
    { name: 'Bone Strength', hz: 20, benefits: ['Bone support', 'Bone wellness', 'Strength support'], premium: true },
    { name: 'Muscle Recovery', hz: 120, benefits: ['Muscle support', 'Recovery', 'Strength'], premium: true },
    { name: 'Skin Renewal', hz: 465, benefits: ['Skin wellness', 'Smooth skin support', 'Cell renewal'], premium: true },
    { name: 'Recovery Support', hz: 250, benefits: ['Accelerated wellness', 'Tissue support', 'Recovery'], premium: true },
    
    // Vitality System
    { name: 'Vitality Support', hz: 124, benefits: ['Vitality enhancement', 'Wellness support', 'Energy'], premium: false },
    { name: 'Inner Vitality', hz: 2.5, benefits: ['Inner strength', 'Natural vitality', 'Energy flow'], premium: true },
    { name: 'Lymphatic Flow', hz: 15.2, benefits: ['Lymphatic flow', 'Natural balance', 'Vitality support'], premium: true },
    { name: 'Wellness Shield', hz: 2644, benefits: ['Wellness protection', 'Natural defense', 'Vitality'], premium: true },
    { name: 'Purity Support', hz: 2112, benefits: ['Purity maintenance', 'Wellness support', 'Balance'], premium: true },
    
    // Circulation & Heart Harmony
    { name: 'Flow Enhancement', hz: 33, benefits: ['Natural flow', 'Circulation support', 'Oxygenation'], premium: true },
    { name: 'Heart Harmony', hz: 341.3, benefits: ['Heart opening', 'Heart balance', 'Love energy'], premium: true },
    { name: 'Heart Balance', hz: 10, benefits: ['Heart harmony', 'Inner balance', 'Wellness'], premium: true },
    { name: 'Circulatory Harmony', hz: 1.45, benefits: ['Circulatory balance', 'Flow improvement', 'Heart harmony'], premium: true },
    
    // Clarity & Balance
    { name: 'General Clarity', hz: 10000, benefits: ['Natural clarity', 'Purification', 'Mental clarity'], premium: true },
    { name: 'Liver Support', hz: 317.83, benefits: ['Liver support', 'Metabolism support', 'Natural balance'], premium: true },
    { name: 'Kidney Support', hz: 319.88, benefits: ['Kidney harmony', 'Balance support', 'Fluid balance'], premium: true },
    { name: 'Deep Clarity', hz: 1.14, benefits: ['Deep clarity', 'Cellular harmony', 'Wellness support'], premium: true },
    
    // Neural Support
    { name: 'Neural Comfort', hz: 2720, benefits: ['Neural support', 'Nerve comfort', 'Sensation support'], premium: true },
    { name: 'Nervous System Balance', hz: 8, benefits: ['Nervous system harmony', 'Neural function', 'Coordination'], premium: true },
    { name: 'Nerve Comfort', hz: 6000, benefits: ['Nerve comfort support', 'Neural harmony', 'Relaxation'], premium: true },
    
    // Glandular Harmony
    { name: 'Glandular Harmony', hz: 8, benefits: ['Glandular balance', 'Inner harmony', 'Balance'], premium: true },
    { name: 'Thyroid Harmony', hz: 384, benefits: ['Thyroid support', 'Metabolism support', 'Energy'], premium: true },
    { name: 'Adrenal Harmony', hz: 492.8, benefits: ['Adrenal support', 'Stress balance', 'Energy'], premium: true },
    { name: 'Metabolic Harmony', hz: 787, benefits: ['Metabolic balance', 'Energy harmony', 'Metabolic wellness'], premium: true },
    
    // Digestive Wellness
    { name: 'Digestive Wellness', hz: 110, benefits: ['Digestive support', 'Gut harmony', 'Nutrient support'], premium: true },
    { name: 'Stomach Comfort', hz: 727, benefits: ['Stomach harmony', 'Digestive balance', 'Digestive comfort'], premium: true },
    { name: 'Gut Harmony', hz: 802, benefits: ['Intestinal harmony', 'Gut flora balance', 'Digestive wellness'], premium: true },
    { name: 'Liver Vitality', hz: 1550, benefits: ['Liver vitality', 'Metabolic function', 'Natural balance'], premium: true },
    
    // Respiratory Wellness
    { name: 'Breath Harmony', hz: 333, benefits: ['Breath capacity', 'Breathing', 'Oxygenation'], premium: true },
    { name: 'Breath Ease', hz: 522, benefits: ['Breathing ease', 'Respiratory comfort', 'Breath support'], premium: true },
    { name: 'Respiratory Wellness', hz: 1234, benefits: ['Respiratory harmony', 'Breath wellness', 'Breath improvement'], premium: true },
    
    // Vitality & Longevity
    { name: 'Youthful Vitality', hz: 528, benefits: ['Cellular vitality', 'Youthful energy', 'Longevity support'], premium: true },
    { name: 'Cellular Longevity', hz: 741, benefits: ['Cellular vitality', 'Cellular wellness', 'Longevity support'], premium: true },
    { name: 'Vitality Enhancement', hz: 6, benefits: ['Vitality support', 'Youthful energy', 'Energy'], premium: true },
    { name: 'Skin Vitality', hz: 1550, benefits: ['Skin support', 'Skin elasticity', 'Joint comfort'], premium: true },
    
    // Wellness Balance
    { name: 'Wellness Balance', hz: 295.8, benefits: ['Metabolism support', 'Energy balance', 'Wellness management'], premium: true },
    { name: 'Metabolism Support', hz: 465, benefits: ['Metabolic support', 'Energy enhancement', 'Vitality'], premium: true },
    { name: 'Mindful Balance', hz: 6000, benefits: ['Mindful awareness', 'Balance support', 'Wellness management'], premium: true },
    { name: 'Energy Metabolism', hz: 295, benefits: ['Energy balance', 'Metabolic wellness', 'Body harmony'], premium: true }
  ];

  healingFreqs.forEach(freq => {
    frequencies.push({
      id: (currentId++).toString(),
      name: freq.name,
      hz: freq.hz,
      category: 'healing',
      description: `Targeted wellness frequency for ${freq.name.toLowerCase()}`,
      benefits: freq.benefits,
      duration: 300,
      isPremium: freq.premium
    });
  });

  // ORGAN HARMONY FREQUENCIES (Complete Body System Support)
  const organFreqs = [
    // Major Organs
    { name: 'Heart Harmony', hz: 341.3, benefits: ['Heart wellness', 'Circulation support', 'Love energy'], premium: true },
    { name: 'Liver Vitality', hz: 317.83, benefits: ['Liver support', 'Natural balance', 'Metabolism support'], premium: true },
    { name: 'Kidney Harmony', hz: 319.88, benefits: ['Kidney balance', 'Filtration support', 'Balance'], premium: true },
    { name: 'Breath Capacity', hz: 333, benefits: ['Breathing support', 'Lung harmony', 'Oxygenation'], premium: true },
    { name: 'Mind Clarity', hz: 40, benefits: ['Cognitive support', 'Memory support', 'Focus'], premium: true },
    { name: 'Stomach Harmony', hz: 110, benefits: ['Digestion support', 'Stomach comfort', 'Gut harmony'], premium: true },
    { name: 'Pancreas Harmony', hz: 117.3, benefits: ['Pancreatic support', 'Metabolic balance', 'Enzyme support'], premium: true },
    { name: 'Spleen Vitality', hz: 20, benefits: ['Spleen support', 'Natural balance', 'Vitality function'], premium: true },
    
    // Glands
    { name: 'Pineal Harmony', hz: 936, benefits: ['Pineal support', 'Sleep cycles', 'Spiritual connection'], premium: true },
    { name: 'Pituitary Harmony', hz: 635, benefits: ['Master gland support', 'Glandular balance', 'Vitality'], premium: true },
    { name: 'Thyroid Harmony', hz: 384, benefits: ['Thyroid support', 'Metabolism support', 'Energy'], premium: true },
    { name: 'Adrenal Harmony', hz: 492.8, benefits: ['Adrenal support', 'Stress balance', 'Energy'], premium: true },
    { name: 'Thymus Harmony', hz: 319, benefits: ['Vitality function', 'Inner strength', 'Wellness'], premium: true },
    
    // Reproductive Wellness
    { name: 'Reproductive Harmony', hz: 288, benefits: ['Reproductive balance', 'Intimate wellness', 'Harmony'], premium: true },
    { name: 'Masculine Harmony', hz: 2050, benefits: ['Masculine balance', 'Male wellness', 'Comfort'], premium: true },
    { name: 'Feminine Harmony', hz: 2489, benefits: ['Feminine balance', 'Female wellness', 'Natural harmony'], premium: true },
    { name: 'Creative Life Force', hz: 2008, benefits: ['Life force energy', 'Reproductive harmony', 'Vitality'], premium: true },
    
    // Sensory Support
    { name: 'Vision Clarity', hz: 1552, benefits: ['Visual clarity', 'Eye comfort', 'Sight support'], premium: true },
    { name: 'Hearing Harmony', hz: 1550, benefits: ['Hearing clarity', 'Ear comfort', 'Sound sensitivity'], premium: true },
    { name: 'Sinus Clarity', hz: 1865, benefits: ['Sinus comfort', 'Nasal clarity', 'Breathing support'], premium: true },
    
    // Skeletal Support
    { name: 'Bone Strength', hz: 20, benefits: ['Bone support', 'Strength support', 'Skeletal wellness'], premium: true },
    { name: 'Joint Comfort', hz: 1.2, benefits: ['Joint flexibility', 'Flexibility', 'Mobility'], premium: true },
    { name: 'Joint Mobility', hz: 465, benefits: ['Cartilage support', 'Joint comfort', 'Mobility'], premium: true },
    { name: 'Spine Harmony', hz: 110, benefits: ['Spinal support', 'Alignment support', 'Posture'], premium: true }
  ];

  organFreqs.forEach(freq => {
    frequencies.push({
      id: (currentId++).toString(),
      name: freq.name,
      hz: freq.hz,
      category: 'organ',
      description: `Organ optimization frequency for ${freq.name.toLowerCase()}`,
      benefits: freq.benefits,
      duration: 300,
      isPremium: freq.premium
    });
  });

  // EMOTIONAL WELLNESS FREQUENCIES (Complete Emotional Spectrum)
  const emotionFreqs = [
    // Basic Emotions
    { name: 'Calm Support', hz: 396, benefits: ['Calm enhancement', 'Relaxation', 'Peace'], premium: false },
    { name: 'Mood Elevation', hz: 528, benefits: ['Mood support', 'Hope', 'Joy'], premium: false },
    { name: 'Anger Release', hz: 741, benefits: ['Emotional balance', 'Inner peace', 'Serenity'], premium: true },
    { name: 'Fear Dissolution', hz: 396, benefits: ['Fear release', 'Courage', 'Confidence'], premium: true },
    { name: 'Grief Processing', hz: 417, benefits: ['Grief support', 'Acceptance', 'Emotional release'], premium: true },
    { name: 'Stress Release', hz: 432, benefits: ['Stress reduction', 'Relaxation', 'Calm'], premium: false },
    { name: 'Worry Release', hz: 852, benefits: ['Worry reduction', 'Mental peace', 'Clarity'], premium: true },
    { name: 'Guilt Clearing', hz: 396, benefits: ['Guilt release', 'Self-forgiveness', 'Freedom'], premium: true },
    { name: 'Shame Release', hz: 417, benefits: ['Shame release', 'Self-acceptance', 'Wellness support'], premium: true },
    { name: 'Resentment Release', hz: 639, benefits: ['Forgiveness', 'Letting go', 'Peace'], premium: true },
    
    // Self-Improvement
    { name: 'Self-Confidence', hz: 852, benefits: ['Confidence boost', 'Self-worth', 'Empowerment'], premium: true },
    { name: 'Self-Love', hz: 528, benefits: ['Self-acceptance', 'Self-love', 'Inner compassion'], premium: true },
    { name: 'Self-Esteem', hz: 320, benefits: ['Self-esteem boost', 'Self-respect', 'Confidence'], premium: true },
    { name: 'Inner Strength', hz: 963, benefits: ['Inner power', 'Resilience', 'Strength'], premium: true },
    { name: 'Emotional Balance', hz: 639, benefits: ['Emotional stability', 'Balance', 'Harmony'], premium: true },
    { name: 'Inner Peace', hz: 963, benefits: ['Deep peace', 'Tranquility', 'Serenity'], premium: true },
    { name: 'Joy & Happiness', hz: 528, benefits: ['Joy cultivation', 'Happiness', 'Positive energy'], premium: true },
    { name: 'Gratitude', hz: 639, benefits: ['Gratitude cultivation', 'Appreciation', 'Thankfulness'], premium: true },
    { name: 'Compassion', hz: 639, benefits: ['Self-compassion', 'Kindness', 'Understanding'], premium: true },
    { name: 'Forgiveness', hz: 639, benefits: ['Forgiveness support', 'Letting go', 'Peace'], premium: true },
    
    // Relationship Support
    { name: 'Heart Opening', hz: 341.3, benefits: ['Heart opening', 'Emotional balance', 'Love'], premium: true },
    { name: 'Trust Building', hz: 639, benefits: ['Trust building', 'Faith cultivation', 'Security'], premium: true },
    { name: 'Security Building', hz: 396, benefits: ['Security support', 'Safety feeling', 'Trust'], premium: true },
    { name: 'Trust Renewal', hz: 417, benefits: ['Trust support', 'Renewal', 'Balance'], premium: true },
    { name: 'Healthy Boundaries', hz: 741, benefits: ['Healthy boundaries', 'Independence', 'Self-love'], premium: true },
    
    // Emotional Support
    { name: 'Emotional Release', hz: 417, benefits: ['Emotional support', 'Release', 'Recovery support'], premium: true },
    { name: 'Stress Recovery', hz: 396, benefits: ['Stress recovery support', 'Nervous system calm', 'Balance'], premium: true },
    { name: 'Inner Child Support', hz: 285, benefits: ['Inner child support', 'Personal growth', 'Recovery support'], premium: true },
    { name: 'Grounding Support', hz: 174, benefits: ['Grounding', 'Nervous system balance', 'Stability'], premium: true },
    { name: 'Emotional Reconnection', hz: 528, benefits: ['Emotional opening', 'Feeling awareness', 'Support'], premium: true },
    
    // Mental Wellness
    { name: 'Mental Clarity', hz: 852, benefits: ['Clear thinking', 'Mental focus', 'Clarity'], premium: true },
    { name: 'Mental Quiet', hz: 741, benefits: ['Mental stillness', 'Thought peace', 'Calm'], premium: true },
    { name: 'Mental Refresh', hz: 40, benefits: ['Mental energy', 'Cognitive refresh', 'Alertness'], premium: true },
    { name: 'Concentration', hz: 40, benefits: ['Focus enhancement', 'Concentration', 'Mental clarity'], premium: true },
    { name: 'Memory Support', hz: 40, benefits: ['Memory support', 'Recall support', 'Learning'], premium: true },
    { name: 'Creative Flow', hz: 417, benefits: ['Creative flow', 'Inspiration', 'Innovation'], premium: true },
    { name: 'Motivation', hz: 852, benefits: ['Motivation boost', 'Drive', 'Inspiration'], premium: true },
    { name: 'Productivity Support', hz: 741, benefits: ['Action taking', 'Productivity', 'Motivation'], premium: true }
  ];

  emotionFreqs.forEach(freq => {
    frequencies.push({
      id: (currentId++).toString(),
      name: freq.name,
      hz: freq.hz,
      category: 'emotion',
      description: `Emotional wellness frequency for ${freq.name.toLowerCase()}`,
      benefits: freq.benefits,
      duration: 600,
      isPremium: freq.premium
    });
  });

  // DNA & GENETIC FREQUENCIES (Advanced Cellular Wellness)
  const dnaFreqs = [
    { name: 'DNA Harmony Master', hz: 528, benefits: ['DNA harmony', 'Genetic wellness', 'Cellular balance'], premium: true },
    { name: 'Cellular Vitality', hz: 741, benefits: ['Cellular wellness', 'Longevity support', 'Vitality'], premium: true },
    { name: 'Gene Expression', hz: 852, benefits: ['Optimal gene expression', 'Genetic potential', 'Wellness optimization'], premium: true },
    { name: 'Chromosomal Harmony', hz: 963, benefits: ['Chromosomal balance', 'Genetic harmony', 'Cellular wellness'], premium: true },
    { name: 'Mitochondrial Power', hz: 40, benefits: ['Mitochondrial support', 'Cellular energy', 'ATP support'], premium: true },
    { name: 'Protein Synthesis', hz: 20, benefits: ['Protein support', 'Muscle support', 'Cellular wellness'], premium: true },
    { name: 'RNA Optimization', hz: 33, benefits: ['RNA support', 'Gene expression', 'Cellular communication'], premium: true },
    { name: 'Cellular Renewal', hz: 174, benefits: ['Cellular renewal support', 'Restoration support', 'Cellular vitality'], premium: true },
    { name: 'Epigenetic Balance', hz: 285, benefits: ['Epigenetic support', 'Gene regulation', 'Expression balance'], premium: true },
    { name: 'Cellular Memory Clear', hz: 396, benefits: ['Memory release', 'Cellular reset', 'Fresh start'], premium: true },
    { name: 'Genetic Harmony', hz: 417, benefits: ['Genetic balance', 'DNA harmony', 'Clarity support'], premium: true },
    { name: 'Cellular Balance', hz: 639, benefits: ['Cellular harmony', 'Genetic balance', 'Cellular wellness'], premium: true }
  ];

  dnaFreqs.forEach(freq => {
    frequencies.push({
      id: (currentId++).toString(),
      name: freq.name,
      hz: freq.hz,
      category: 'dna',
      description: `Advanced DNA wellness frequency for ${freq.name.toLowerCase()}`,
      benefits: freq.benefits,
      duration: 900,
      isPremium: freq.premium
    });
  });

  // SLEEP FREQUENCIES (Complete Sleep Optimization)
  const sleepFreqs = [
    { name: 'Deep Sleep Induction', hz: 1, benefits: ['Deep sleep', 'Sleep induction', 'Rest'], premium: false },
    { name: 'REM Sleep Enhancement', hz: 3, benefits: ['REM sleep', 'Dream enhancement', 'Memory consolidation'], premium: false },
    { name: 'Sleep Maintenance', hz: 2, benefits: ['Uninterrupted sleep', 'Sleep continuity', 'Rest quality'], premium: true },
    { name: 'Sleep Onset Support', hz: 1.5, benefits: ['Sleep onset support', 'Rest induction', 'Sleep preparation'], premium: true },
    { name: 'Peaceful Dreams', hz: 6, benefits: ['Dream support', 'Peaceful dreams', 'Sleep quality'], premium: true },
    { name: 'Pre-Sleep Calm', hz: 7.83, benefits: ['Pre-sleep calm', 'Evening relaxation', 'Peaceful mind'], premium: true },
    { name: 'Circadian Support', hz: 0.5, benefits: ['Circadian rhythm support', 'Sleep-wake cycle', 'Natural rhythm'], premium: true },
    { name: 'Sleep Cycle Support', hz: 936, benefits: ['Sleep cycle support', 'Natural rest support', 'Sleep rhythm'], premium: true }
  ];

  sleepFreqs.forEach(freq => {
    frequencies.push({
      id: (currentId++).toString(),
      name: freq.name,
      hz: freq.hz,
      category: 'sleep',
      description: `Sleep optimization frequency for ${freq.name.toLowerCase()}`,
      benefits: freq.benefits,
      duration: 1800,
      isPremium: freq.premium
    });
  });

  // BRAIN ENHANCEMENT (Complete Cognitive Optimization)
  const brainFreqs = [
    { name: 'Memory Enhancement', hz: 40, benefits: ['Memory improvement', 'Recall boost', 'Learning enhancement'], premium: true },
    { name: 'Focus Amplifier', hz: 40, benefits: ['Laser focus', 'Concentration', 'Attention span'], premium: true },
    { name: 'Learning Acceleration', hz: 10, benefits: ['Fast learning', 'Information absorption', 'Study enhancement'], premium: true },
    { name: 'IQ Boost', hz: 40, benefits: ['Intelligence increase', 'Cognitive enhancement', 'Mental sharpness'], premium: true },
    { name: 'Creativity Enhancement', hz: 6, benefits: ['Creative thinking', 'Innovation', 'Artistic flow'], premium: true },
    { name: 'Problem Solving', hz: 14, benefits: ['Analytical thinking', 'Problem resolution', 'Logic enhancement'], premium: true },
    { name: 'Mental Clarity', hz: 40, benefits: ['Clear thinking', 'Mental fog clearing', 'Sharp mind'], premium: true },
    { name: 'Intuition Boost', hz: 6, benefits: ['Intuitive abilities', 'Inner knowing', 'Psychic enhancement'], premium: true },
    { name: 'Brain Balance', hz: 8, benefits: ['Left-right brain balance', 'Whole brain thinking', 'Integration'], premium: true },
    { name: 'Neuroplasticity', hz: 40, benefits: ['Brain plasticity', 'Neural rewiring', 'Adaptation'], premium: true }
  ];

  brainFreqs.forEach(freq => {
    frequencies.push({
      id: (currentId++).toString(),
      name: freq.name,
      hz: freq.hz,
      category: 'brain',
      description: `Brain enhancement frequency for ${freq.name.toLowerCase()}`,
      benefits: freq.benefits,
      duration: 600,
      isPremium: freq.premium
    });
  });

  // ENERGY & VITALITY (Complete Energy System)
  const energyFreqs = [
    { name: 'Energy Boost', hz: 126.22, benefits: ['Energy increase', 'Vitality boost', 'Life force enhancement'], premium: false },
    { name: 'Energy Restoration', hz: 465, benefits: ['Energy support', 'Energy restoration', 'Vitality recovery'], premium: true },
    { name: 'Adrenal Support', hz: 492.8, benefits: ['Adrenal balance', 'Energy restoration', 'Stamina support'], premium: true },
    { name: 'Physical Stamina', hz: 20, benefits: ['Endurance boost', 'Physical stamina', 'Athletic performance'], premium: true },
    { name: 'Mental Energy', hz: 40, benefits: ['Mental alertness', 'Cognitive energy', 'Brain power'], premium: true },
    { name: 'Life Force Activation', hz: 528, benefits: ['Life force boost', 'Vital energy', 'Chi activation'], premium: true },
    { name: 'Chakra Energy', hz: 741, benefits: ['Energy center activation', 'Chakra balancing', 'Energy flow'], premium: true },
    { name: 'Aura Strengthening', hz: 963, benefits: ['Aura enhancement', 'Energy field', 'Protection'], premium: true }
  ];

  energyFreqs.forEach(freq => {
    frequencies.push({
      id: (currentId++).toString(),
      name: freq.name,
      hz: freq.hz,
      category: 'energy',
      description: `Energy optimization frequency for ${freq.name.toLowerCase()}`,
      benefits: freq.benefits,
      duration: 300,
      isPremium: freq.premium
    });
  });

  // MANIFESTATION FREQUENCIES (Law of Attraction)
  const manifestationFreqs = [
    { name: 'Abundance Manifestation', hz: 183.58, benefits: ['Abundance attraction', 'Wealth manifestation', 'Prosperity'], premium: true },
    { name: 'Love Attraction', hz: 639, benefits: ['Love magnetism', 'Relationship manifestation', 'Heart opening'], premium: true },
    { name: 'Success Programming', hz: 852, benefits: ['Success mindset', 'Achievement focus', 'Goal manifestation'], premium: true },
    { name: 'Dream Manifestation', hz: 963, benefits: ['Dream realization', 'Vision manifestation', 'Goal achievement'], premium: true },
    { name: 'Opportunity Magnet', hz: 741, benefits: ['Opportunity attraction', 'Synchronicity increase', 'Luck enhancement'], premium: true },
    { name: 'Confidence Manifestation', hz: 528, benefits: ['Confidence building', 'Self-assurance', 'Inner strength'], premium: true },
    { name: 'Wellness Manifestation', hz: 528, benefits: ['Wellness attraction', 'Vitality manifestation', 'Energy'], premium: true },
    { name: 'Creativity Manifestation', hz: 417, benefits: ['Creative flow', 'Inspiration attraction', 'Artistic success'], premium: true }
  ];

  manifestationFreqs.forEach(freq => {
    frequencies.push({
      id: (currentId++).toString(),
      name: freq.name,
      hz: freq.hz,
      category: 'manifestation',
      description: `Manifestation frequency for ${freq.name.toLowerCase()}`,
      benefits: freq.benefits,
      duration: 600,
      isPremium: freq.premium
    });
  });

  // RIFE FREQUENCIES (Dr. Royal Rife Research - 60+ frequencies)
  const rifeFreqs = [
    // General Wellness
    { name: 'Rife Universal Wellness', hz: 728, benefits: ['General wellness', 'Cellular support', 'Balance'], premium: false },
    { name: 'Rife Vitality', hz: 787, benefits: ['Vitality boost', 'Energy', 'Life force'], premium: false },
    { name: 'Rife Restoration', hz: 880, benefits: ['Restoration support', 'Wellness acceleration', 'Renewal'], premium: false },
    { name: 'Rife Wellness Boost', hz: 10000, benefits: ['Overall wellness', 'System support', 'Vitality'], premium: true },
    { name: 'Rife Clarity Master', hz: 20, benefits: ['Clarity', 'Purification', 'Balance'], premium: true },
    { name: 'Rife Cellular Vitality', hz: 2720, benefits: ['Cellular vitality', 'Tissue support', 'Renewal'], premium: true },
    { name: 'Rife Comfort Protocol', hz: 3000, benefits: ['Comfort support', 'Relaxation', 'Ease'], premium: true },
    { name: 'Rife Soothing', hz: 1550, benefits: ['Soothing support', 'Comfort', 'Balance'], premium: true },
    
    // Vitality Support
    { name: 'Rife Vitality Defense', hz: 465, benefits: ['Vitality enhancement', 'Natural defense', 'Protection'], premium: true },
    { name: 'Rife Lymph Flow', hz: 15.2, benefits: ['Lymphatic flow', 'Natural drainage', 'Balance'], premium: true },
    { name: 'Rife Inner Strength', hz: 2.5, benefits: ['Inner strength', 'Natural vitality', 'Defense'], premium: true },
    { name: 'Rife Thymus Harmony', hz: 3.9, benefits: ['Thymus support', 'Vitality support', 'Balance'], premium: true },
    
    // Organ Support
    { name: 'Rife Liver Support', hz: 1552, benefits: ['Liver function', 'Balance support', 'Metabolism'], premium: true },
    { name: 'Rife Kidney Support', hz: 625, benefits: ['Kidney function', 'Filtration', 'Balance'], premium: true },
    { name: 'Rife Lung Support', hz: 720, benefits: ['Lung function', 'Breathing', 'Oxygenation'], premium: true },
    { name: 'Rife Heart Support', hz: 696, benefits: ['Heart function', 'Circulation', 'Heart wellness'], premium: true },
    { name: 'Rife Spleen Support', hz: 635, benefits: ['Spleen support', 'Natural balance', 'Vitality'], premium: true },
    { name: 'Rife Pancreas Harmony', hz: 654, benefits: ['Pancreatic support', 'Digestion support', 'Metabolic balance'], premium: true },
    { name: 'Rife Gallbladder', hz: 622, benefits: ['Gallbladder support', 'Natural flow', 'Digestion'], premium: true },
    { name: 'Rife Stomach', hz: 676, benefits: ['Stomach support', 'Digestion', 'Comfort'], premium: true },
    { name: 'Rife Intestinal', hz: 802, benefits: ['Intestinal harmony', 'Gut support', 'Absorption'], premium: true },
    { name: 'Rife Colon Support', hz: 442, benefits: ['Colon harmony', 'Elimination', 'Gut wellness'], premium: true },
    { name: 'Rife Bladder Support', hz: 642, benefits: ['Bladder support', 'Urinary harmony', 'Balance'], premium: true },
    
    // Skeletal & Muscular
    { name: 'Rife Bone Strength', hz: 478, benefits: ['Bone support', 'Skeletal wellness', 'Strength'], premium: true },
    { name: 'Rife Joint Comfort', hz: 324, benefits: ['Joint support', 'Flexibility', 'Mobility'], premium: true },
    { name: 'Rife Muscle Support', hz: 304, benefits: ['Muscle wellness', 'Recovery', 'Strength'], premium: true },
    { name: 'Rife Cartilage', hz: 727, benefits: ['Cartilage support', 'Joint cushioning', 'Flexibility'], premium: true },
    { name: 'Rife Spine Harmony', hz: 432, benefits: ['Spinal support', 'Alignment', 'Back comfort'], premium: true },
    
    // Neural Support
    { name: 'Rife Neural Comfort', hz: 2720, benefits: ['Nerve support', 'Neural harmony', 'Sensation'], premium: true },
    { name: 'Rife Brain Balance', hz: 764, benefits: ['Brain support', 'Cognitive wellness', 'Balance'], premium: true },
    { name: 'Rife Nerve Comfort', hz: 6000, benefits: ['Nerve comfort', 'Neural support', 'Ease'], premium: true },
    { name: 'Rife Lower Back Comfort', hz: 10000, benefits: ['Lower back support', 'Leg comfort', 'Ease'], premium: true },
    
    // Skin & Tissue
    { name: 'Rife Skin Renewal', hz: 1552, benefits: ['Skin wellness', 'Tissue support', 'Renewal'], premium: true },
    { name: 'Rife Recovery Support', hz: 464, benefits: ['Recovery support', 'Wellness acceleration', 'Balance'], premium: true },
    { name: 'Rife Tissue Softening', hz: 148, benefits: ['Tissue support', 'Tissue softening', 'Balance'], premium: true },
    
    // Respiratory
    { name: 'Rife Sinus Clarity', hz: 146, benefits: ['Sinus support', 'Breathing clarity', 'Comfort'], premium: true },
    { name: 'Rife Bronchial', hz: 452, benefits: ['Bronchial support', 'Breath harmony', 'Breathing'], premium: true },
    { name: 'Rife Respiratory', hz: 1234, benefits: ['Respiratory harmony', 'Breathing', 'Breath support'], premium: true },
    
    // Circulatory
    { name: 'Rife Circulation', hz: 1.2, benefits: ['Natural flow', 'Circulation support', 'Oxygenation'], premium: true },
    { name: 'Rife Heart Balance', hz: 10, benefits: ['Heart harmony', 'Balance', 'Wellness'], premium: true },
    { name: 'Rife Vein Support', hz: 1.7, benefits: ['Vein support', 'Circulation', 'Leg comfort'], premium: true },
    
    // Glandular Harmony
    { name: 'Rife Thyroid Harmony', hz: 16, benefits: ['Thyroid support', 'Metabolism support', 'Energy'], premium: true },
    { name: 'Rife Adrenal', hz: 20, benefits: ['Adrenal support', 'Stress balance', 'Energy'], premium: true },
    { name: 'Rife Pituitary', hz: 635, benefits: ['Pituitary support', 'Glandular harmony', 'Balance'], premium: true },
    { name: 'Rife Pineal', hz: 662, benefits: ['Pineal support', 'Sleep cycle', 'Cycles'], premium: true },
    
    // Wellness Support
    { name: 'Rife Head Comfort', hz: 144, benefits: ['Head comfort', 'Ease', 'Relaxation'], premium: true },
    { name: 'Rife Calm Support', hz: 10, benefits: ['Calm support', 'Ease', 'Relaxation'], premium: true },
    { name: 'Rife Seasonal Comfort', hz: 330, benefits: ['Seasonal comfort', 'Balance', 'Ease'], premium: true },
    { name: 'Rife Ear Comfort', hz: 9.6, benefits: ['Ear support', 'Sound comfort', 'Hearing'], premium: true },
    { name: 'Rife Vision Clarity', hz: 1830, benefits: ['Eye support', 'Vision clarity', 'Eye comfort'], premium: true },
    { name: 'Rife Oral Wellness', hz: 1800, benefits: ['Tooth support', 'Gum wellness', 'Oral harmony'], premium: true },
    { name: 'Rife Sleep Aid', hz: 1.5, benefits: ['Sleep support', 'Rest', 'Relaxation'], premium: true },
    { name: 'Rife Energy Restore', hz: 20000, benefits: ['Energy boost', 'Energy support', 'Vitality'], premium: true }
  ];

  rifeFreqs.forEach(freq => {
    frequencies.push({
      id: (currentId++).toString(),
      name: freq.name,
      hz: freq.hz,
      category: 'rife',
      description: `Rife research frequency for ${freq.name.toLowerCase().replace('rife ', '')}`,
      benefits: freq.benefits,
      duration: 600,
      isPremium: freq.premium
    });
  });

  // ANGEL NUMBER FREQUENCIES (Numerology-based - 25+ frequencies)
  const angelFreqs = [
    { name: 'Angel 111 - New Beginnings', hz: 111, benefits: ['New beginnings', 'Divine inspiration', 'Manifestation'], premium: false },
    { name: 'Angel 222 - Balance & Harmony', hz: 222, benefits: ['Balance', 'Partnership', 'Trust'], premium: false },
    { name: 'Angel 333 - Divine Protection', hz: 333, benefits: ['Ascended master connection', 'Protection', 'Guidance'], premium: false },
    { name: 'Angel 444 - Foundation', hz: 444, benefits: ['Stability', 'Foundation', 'Angel presence'], premium: true },
    { name: 'Angel 555 - Transformation', hz: 555, benefits: ['Major change', 'Transformation', 'Freedom'], premium: true },
    { name: 'Angel 666 - Balance Material', hz: 666, benefits: ['Material balance', 'Earthly harmony', 'Recalibration'], premium: true },
    { name: 'Angel 777 - Divine Luck', hz: 777, benefits: ['Good fortune', 'Miracles', 'Divine alignment'], premium: true },
    { name: 'Angel 888 - Infinite Abundance', hz: 888, benefits: ['Financial abundance', 'Infinite flow', 'Prosperity'], premium: true },
    { name: 'Angel 999 - Completion', hz: 999, benefits: ['Completion', 'Endings', 'New chapter'], premium: true },
    { name: 'Angel 1111 - Awakening', hz: 1111, benefits: ['Spiritual awakening', 'Gateway', 'Manifestation portal'], premium: true },
    { name: 'Angel 1212 - Divine Path', hz: 1212, benefits: ['Life path', 'Purpose', 'Divine guidance'], premium: true },
    { name: 'Angel 1234 - Steps Forward', hz: 1234, benefits: ['Progress', 'Sequential growth', 'Forward motion'], premium: true },
    { name: 'Angel 144 - Hard Work Pays', hz: 144, benefits: ['Determination', 'Goals', 'Achievement'], premium: true },
    { name: 'Angel 1144 - Aligned Action', hz: 1144, benefits: ['Inspired action', 'Divine timing', 'Alignment'], premium: true },
    { name: 'Angel 2222 - Trust Process', hz: 2222, benefits: ['Faith', 'Trust', 'Patience'], premium: true },
    { name: 'Angel 3333 - Master Teachers', hz: 3333, benefits: ['Master guidance', 'Wisdom', 'Teaching'], premium: true },
    { name: 'Angel 4444 - Angel Army', hz: 4444, benefits: ['Massive protection', 'Angel army', 'Support'], premium: true },
    { name: 'Angel 5555 - Major Shift', hz: 5555, benefits: ['Life overhaul', 'Massive change', 'Rebirth'], premium: true },
    { name: 'Angel 717 - Right Path', hz: 717, benefits: ['Correct direction', 'Validation', 'Encouragement'], premium: true },
    { name: 'Angel 818 - Abundance Coming', hz: 818, benefits: ['Wealth incoming', 'Positive change', 'Blessings'], premium: true },
    { name: 'Angel 911 - Lightworker', hz: 911, benefits: ['Soul mission', 'Lightwork', 'Service'], premium: true },
    { name: 'Angel 1010 - Divine Support', hz: 1010, benefits: ['Full support', 'Encouragement', 'Keep going'], premium: true },
    { name: 'Angel 1133 - Master Ascension', hz: 1133, benefits: ['Ascension', 'Master energy', 'Elevation'], premium: true },
    { name: 'Angel 1313 - Divine Feminine', hz: 1313, benefits: ['Feminine power', 'Intuition', 'Creativity'], premium: true },
    { name: 'Angel 369 - Tesla Creation', hz: 369, benefits: ['Creation power', 'Universe key', 'Manifestation'], premium: true }
  ];

  angelFreqs.forEach(freq => {
    frequencies.push({
      id: (currentId++).toString(),
      name: freq.name,
      hz: freq.hz,
      category: 'angel',
      description: `Angel number frequency for ${freq.benefits[0].toLowerCase()}`,
      benefits: freq.benefits,
      duration: 600,
      isPremium: freq.premium
    });
  });

  // CRYSTAL FREQUENCIES (Gem vibrations - 30+ frequencies)
  const crystalFreqs = [
    { name: 'Clear Quartz - Master Crystal', hz: 32768, benefits: ['Amplification', 'Clarity', 'Energy enhancement'], premium: false },
    { name: 'Amethyst - Spiritual Stone', hz: 480, benefits: ['Spiritual wisdom', 'Intuition', 'Calm'], premium: false },
    { name: 'Rose Quartz - Love Stone', hz: 350, benefits: ['Unconditional love', 'Heart opening', 'Self-love'], premium: false },
    { name: 'Citrine - Abundance Stone', hz: 320, benefits: ['Abundance', 'Joy', 'Positivity'], premium: true },
    { name: 'Black Tourmaline - Protection', hz: 152, benefits: ['Protection', 'Grounding', 'EMF shield'], premium: true },
    { name: 'Selenite - Clearing', hz: 4096, benefits: ['Energy clearing', 'Clarity', 'Divine connection'], premium: true },
    { name: 'Lapis Lazuli - Truth', hz: 426.7, benefits: ['Truth speaking', 'Wisdom', 'Inner vision'], premium: true },
    { name: 'Tigers Eye - Confidence', hz: 320, benefits: ['Confidence', 'Courage', 'Protection'], premium: true },
    { name: 'Obsidian - Shadow Work', hz: 174, benefits: ['Shadow integration', 'Protection', 'Truth'], premium: true },
    { name: 'Carnelian - Creativity', hz: 288, benefits: ['Creativity', 'Vitality', 'Motivation'], premium: true },
    { name: 'Jade - Prosperity', hz: 341.3, benefits: ['Luck', 'Prosperity', 'Harmony'], premium: true },
    { name: 'Turquoise - Communication', hz: 384, benefits: ['Communication', 'Protection', 'Balance'], premium: true },
    { name: 'Moonstone - Feminine', hz: 210.42, benefits: ['Feminine energy', 'Intuition', 'Cycles'], premium: true },
    { name: 'Sunstone - Masculine', hz: 126.22, benefits: ['Vitality', 'Joy', 'Leadership'], premium: true },
    { name: 'Labradorite - Magic', hz: 426.7, benefits: ['Magic', 'Transformation', 'Intuition'], premium: true },
    { name: 'Malachite - Transformation', hz: 341.3, benefits: ['Transformation', 'Heart opening', 'Protection'], premium: true },
    { name: 'Fluorite - Focus', hz: 40, benefits: ['Mental clarity', 'Focus', 'Learning'], premium: true },
    { name: 'Pyrite - Abundance', hz: 320, benefits: ['Wealth', 'Confidence', 'Protection'], premium: true },
    { name: 'Amazonite - Harmony', hz: 384, benefits: ['Harmony', 'Truth', 'Communication'], premium: true },
    { name: 'Rhodonite - Heart Opening', hz: 639, benefits: ['Emotional balance', 'Forgiveness', 'Love'], premium: true },
    { name: 'Sodalite - Logic', hz: 426.7, benefits: ['Logic', 'Truth', 'Intuition balance'], premium: true },
    { name: 'Garnet - Passion', hz: 256, benefits: ['Passion', 'Energy', 'Commitment'], premium: true },
    { name: 'Aquamarine - Calm', hz: 384, benefits: ['Calm', 'Clarity', 'Communication'], premium: true },
    { name: 'Peridot - Abundance', hz: 341.3, benefits: ['Abundance', 'Wellness', 'Protection'], premium: true },
    { name: 'Opal - Creativity', hz: 480, benefits: ['Creativity', 'Inspiration', 'Amplification'], premium: true },
    { name: 'Ruby - Life Force', hz: 256, benefits: ['Life force', 'Passion', 'Courage'], premium: true },
    { name: 'Sapphire - Wisdom', hz: 426.7, benefits: ['Wisdom', 'Royalty', 'Divine favor'], premium: true },
    { name: 'Emerald - Heart', hz: 341.3, benefits: ['Love', 'Abundance', 'Heart chakra'], premium: true },
    { name: 'Diamond - Amplification', hz: 1000, benefits: ['Amplification', 'Clarity', 'Purity'], premium: true },
    { name: 'Hematite - Grounding', hz: 256, benefits: ['Grounding', 'Protection', 'Vitality'], premium: true }
  ];

  crystalFreqs.forEach(freq => {
    frequencies.push({
      id: (currentId++).toString(),
      name: freq.name,
      hz: freq.hz,
      category: 'crystal',
      description: `Crystal resonance frequency for ${freq.name.split(' - ')[1].toLowerCase()}`,
      benefits: freq.benefits,
      duration: 600,
      isPremium: freq.premium
    });
  });

  // COLOR LIGHT FREQUENCIES (Color Wellness - 14 frequencies)
  const colorFreqs = [
    { name: 'Red Light - Vitality', hz: 428570, benefits: ['Energy', 'Vitality', 'Circulation'], premium: false },
    { name: 'Orange Light - Creativity', hz: 491304, benefits: ['Creativity', 'Enthusiasm', 'Joy'], premium: false },
    { name: 'Yellow Light - Clarity', hz: 517241, benefits: ['Mental clarity', 'Confidence', 'Optimism'], premium: false },
    { name: 'Green Light - Balance', hz: 571428, benefits: ['Balance', 'Harmony', 'Growth'], premium: false },
    { name: 'Blue Light - Calm', hz: 638297, benefits: ['Peace', 'Communication', 'Relaxation'], premium: true },
    { name: 'Indigo Light - Intuition', hz: 666666, benefits: ['Intuition', 'Perception', 'Wisdom'], premium: true },
    { name: 'Violet Light - Spiritual', hz: 714285, benefits: ['Spirituality', 'Transformation', 'Purification'], premium: true },
    { name: 'White Light - Purification', hz: 384, benefits: ['Purification', 'Renewal', 'Unity'], premium: true },
    { name: 'Gold Light - Wisdom', hz: 528, benefits: ['Divine wisdom', 'Prosperity', 'Enlightenment'], premium: true },
    { name: 'Silver Light - Moon', hz: 210.42, benefits: ['Intuition', 'Reflection', 'Feminine'], premium: true },
    { name: 'Pink Light - Love', hz: 639, benefits: ['Self-love', 'Compassion', 'Romance'], premium: true },
    { name: 'Turquoise Light - Vitality', hz: 600000, benefits: ['Vitality support', 'Calm', 'Protection'], premium: true },
    { name: 'Magenta Light - Change', hz: 680000, benefits: ['Transformation', 'Release', 'Letting go'], premium: true },
    { name: 'Rainbow Light - Chakra Full', hz: 432, benefits: ['Full spectrum balance', 'Harmony', 'Alignment'], premium: true }
  ];

  colorFreqs.forEach(freq => {
    frequencies.push({
      id: (currentId++).toString(),
      name: freq.name,
      hz: freq.hz,
      category: 'color',
      description: `Color light frequency for ${freq.name.split(' - ')[1].toLowerCase()}`,
      benefits: freq.benefits,
      duration: 600,
      isPremium: freq.premium
    });
  });

  // SCHUMANN & EARTH FREQUENCIES (20 frequencies)
  const schumannFreqs = [
    { name: 'Schumann 7.83Hz - Earth Pulse', hz: 7.83, benefits: ['Earth grounding', 'Natural sync', 'Balance'], premium: false },
    { name: 'Schumann 14.3Hz - Second Harmonic', hz: 14.3, benefits: ['Alertness', 'Focus', 'Earth connection'], premium: false },
    { name: 'Schumann 20.8Hz - Third Harmonic', hz: 20.8, benefits: ['Enhanced awareness', 'Mental clarity', 'Grounding'], premium: true },
    { name: 'Schumann 27.3Hz - Fourth Harmonic', hz: 27.3, benefits: ['Higher cognition', 'Earth attunement', 'Balance'], premium: true },
    { name: 'Schumann 33.8Hz - Fifth Harmonic', hz: 33.8, benefits: ['Peak performance', 'Athletic support', 'Energy'], premium: true },
    { name: 'Earth Core 9.78Hz', hz: 9.78, benefits: ['Deep grounding', 'Core connection', 'Stability'], premium: true },
    { name: 'Earth Mantle 12.5Hz', hz: 12.5, benefits: ['Inner Earth', 'Transformation', 'Power'], premium: true },
    { name: 'Earth Crust 15Hz', hz: 15, benefits: ['Surface harmony', 'Nature connection', 'Grounding'], premium: true },
    { name: 'Geomagnetic 1.5Hz', hz: 1.5, benefits: ['Magnetic field sync', 'Navigation', 'Orientation'], premium: true },
    { name: 'Ionosphere 4Hz', hz: 4, benefits: ['Upper atmosphere', 'Expansion', 'Connection'], premium: true },
    { name: 'Earth Day Cycle 6.66Hz', hz: 6.66, benefits: ['Circadian support', 'Day rhythm', 'Natural cycle'], premium: true },
    { name: 'Earth Night Cycle 3Hz', hz: 3, benefits: ['Sleep support', 'Night rhythm', 'Rest cycle'], premium: true },
    { name: 'Ley Line Frequency 33Hz', hz: 33, benefits: ['Ley line connection', 'Sacred sites', 'Earth energy'], premium: true },
    { name: 'Earth Heart Beat 8Hz', hz: 8, benefits: ['Planetary heart', 'Global connection', 'Unity'], premium: true },
    { name: 'Telluric Current 10Hz', hz: 10, benefits: ['Earth current', 'Energy flow', 'Grounding'], premium: true },
    { name: 'Forest Frequency 10.8Hz', hz: 10.8, benefits: ['Forest bathing', 'Nature connection', 'Green wellness'], premium: true },
    { name: 'Ocean Wave 12Hz', hz: 12, benefits: ['Ocean energy', 'Flow', 'Renewal'], premium: true },
    { name: 'Mountain Resonance 16Hz', hz: 16, benefits: ['Mountain energy', 'Stability', 'Strength'], premium: true },
    { name: 'Desert Frequency 20Hz', hz: 20, benefits: ['Desert energy', 'Clarity', 'Simplicity'], premium: true },
    { name: 'Rainforest 8.5Hz', hz: 8.5, benefits: ['Biodiversity', 'Life force', 'Abundance'], premium: true }
  ];

  schumannFreqs.forEach(freq => {
    frequencies.push({
      id: (currentId++).toString(),
      name: freq.name,
      hz: freq.hz,
      category: 'schumann',
      description: `Earth resonance frequency for ${freq.name.split(' - ')[0].toLowerCase()}`,
      benefits: freq.benefits,
      duration: 900,
      isPremium: freq.premium
    });
  });

  // NIKOLA TESLA FREQUENCIES (3-6-9 and related - 20 frequencies)
  const teslaFreqs = [
    { name: 'Tesla 3Hz - Creation', hz: 3, benefits: ['Creation energy', 'Beginning', 'Birth'], premium: false },
    { name: 'Tesla 6Hz - Harmony', hz: 6, benefits: ['Balance', 'Harmony', 'Connection'], premium: false },
    { name: 'Tesla 9Hz - Completion', hz: 9, benefits: ['Completion', 'Enlightenment', 'Wholeness'], premium: false },
    { name: 'Tesla 12Hz - Cosmic Order', hz: 12, benefits: ['Universal order', 'Structure', 'Foundation'], premium: true },
    { name: 'Tesla 27Hz - Manifestation', hz: 27, benefits: ['Manifestation power', 'Reality creation', 'Intent'], premium: true },
    { name: 'Tesla 36Hz - Amplification', hz: 36, benefits: ['Energy amplification', 'Power boost', 'Enhancement'], premium: true },
    { name: 'Tesla 45Hz - Transformation', hz: 45, benefits: ['Transformation', 'Change catalyst', 'Evolution'], premium: true },
    { name: 'Tesla 54Hz - Divine Order', hz: 54, benefits: ['Divine order', 'Sacred geometry', 'Alignment'], premium: true },
    { name: 'Tesla 63Hz - Awakening', hz: 63, benefits: ['Spiritual awakening', 'Consciousness', 'Awareness'], premium: true },
    { name: 'Tesla 72Hz - Universal Love', hz: 72, benefits: ['Universal love', 'Compassion', 'Unity'], premium: true },
    { name: 'Tesla 81Hz - Mastery', hz: 81, benefits: ['Self-mastery', 'Achievement', 'Success'], premium: true },
    { name: 'Tesla 90Hz - Divine Connection', hz: 90, benefits: ['Divine connection', 'Source energy', 'Oneness'], premium: true },
    { name: 'Tesla 99Hz - Completion', hz: 99, benefits: ['Ultimate completion', 'Full circle', 'Fulfillment'], premium: true },
    { name: 'Tesla 108Hz - Sacred Number', hz: 108, benefits: ['Sacred completion', 'Spiritual fullness', 'Moksha'], premium: true },
    { name: 'Tesla 111Hz - Gateway', hz: 111, benefits: ['Portal opening', 'New beginning', 'Inspiration'], premium: true },
    { name: 'Tesla 144Hz - Light Body', hz: 144, benefits: ['Light body activation', 'Ascension', 'Evolution'], premium: true },
    { name: 'Tesla 369Hz - Universe Key', hz: 369, benefits: ['Universe key', 'Creation code', 'Manifestation'], premium: true },
    { name: 'Tesla 432Hz - Cosmic Harmony', hz: 432, benefits: ['Universal tuning', 'Natural harmony', 'Peace'], premium: false },
    { name: 'Tesla 528Hz - DNA Key', hz: 528, benefits: ['DNA activation', 'Love frequency', 'Transformation'], premium: false },
    { name: 'Tesla 639Hz - Connection Key', hz: 639, benefits: ['Relationship harmony', 'Communication', 'Unity'], premium: true }
  ];

  teslaFreqs.forEach(freq => {
    frequencies.push({
      id: (currentId++).toString(),
      name: freq.name,
      hz: freq.hz,
      category: 'tesla',
      description: `Tesla-inspired frequency for ${freq.benefits[0].toLowerCase()}`,
      benefits: freq.benefits,
      duration: 600,
      isPremium: freq.premium
    });
  });

  // SACRED GEOMETRY FREQUENCIES (15 frequencies)
  const sacredFreqs = [
    { name: 'Phi Ratio 1.618Hz', hz: 1.618, benefits: ['Golden ratio', 'Natural beauty', 'Perfect proportion'], premium: true },
    { name: 'Pi Frequency 3.14Hz', hz: 3.14, benefits: ['Infinite cycles', 'Completeness', 'Perfection'], premium: true },
    { name: 'Fibonacci 1Hz', hz: 1, benefits: ['Natural sequence', 'Growth pattern', 'Evolution'], premium: false },
    { name: 'Fibonacci 2Hz', hz: 2, benefits: ['Divine proportion', 'Balance', 'Harmony'], premium: false },
    { name: 'Fibonacci 3Hz', hz: 3, benefits: ['Creative expansion', 'Growth', 'Development'], premium: true },
    { name: 'Fibonacci 5Hz', hz: 5, benefits: ['Life force', 'Natural rhythm', 'Vitality'], premium: true },
    { name: 'Fibonacci 8Hz', hz: 8, benefits: ['Cosmic order', 'Structure', 'Foundation'], premium: false },
    { name: 'Fibonacci 13Hz', hz: 13, benefits: ['Transformation', 'Rebirth', 'Change'], premium: true },
    { name: 'Fibonacci 21Hz', hz: 21, benefits: ['Expansion', 'Growth', 'Abundance'], premium: true },
    { name: 'Fibonacci 34Hz', hz: 34, benefits: ['Higher consciousness', 'Awareness', 'Insight'], premium: true },
    { name: 'Fibonacci 55Hz', hz: 55, benefits: ['Spiritual growth', 'Evolution', 'Ascension'], premium: true },
    { name: 'Flower of Life 128Hz', hz: 128, benefits: ['Sacred geometry', 'Creation pattern', 'Unity'], premium: true },
    { name: 'Metatrons Cube 444Hz', hz: 444, benefits: ['Archangel energy', 'Protection', 'Sacred structure'], premium: true },
    { name: 'Sri Yantra 963Hz', hz: 963, benefits: ['Divine connection', 'Enlightenment', 'Unity'], premium: true },
    { name: 'Vesica Piscis 256Hz', hz: 256, benefits: ['Creation', 'Birth', 'New beginnings'], premium: true }
  ];

  sacredFreqs.forEach(freq => {
    frequencies.push({
      id: (currentId++).toString(),
      name: freq.name,
      hz: freq.hz,
      category: 'sacred',
      description: `Sacred geometry frequency for ${freq.benefits[0].toLowerCase()}`,
      benefits: freq.benefits,
      duration: 900,
      isPremium: freq.premium
    });
  });

  // TIBETAN BOWL FREQUENCIES (15 frequencies)
  const tibetanFreqs = [
    { name: 'Tibetan Root Bowl', hz: 256, benefits: ['Root activation', 'Grounding', 'Security'], premium: false },
    { name: 'Tibetan Sacral Bowl', hz: 288, benefits: ['Sacral balance', 'Creativity', 'Emotion'], premium: false },
    { name: 'Tibetan Solar Bowl', hz: 320, benefits: ['Solar plexus', 'Power', 'Confidence'], premium: true },
    { name: 'Tibetan Heart Bowl', hz: 341.3, benefits: ['Heart opening', 'Love', 'Compassion'], premium: true },
    { name: 'Tibetan Throat Bowl', hz: 384, benefits: ['Throat chakra', 'Expression', 'Truth'], premium: true },
    { name: 'Tibetan Third Eye Bowl', hz: 426.7, benefits: ['Third eye', 'Intuition', 'Vision'], premium: true },
    { name: 'Tibetan Crown Bowl', hz: 480, benefits: ['Crown opening', 'Divine connection', 'Enlightenment'], premium: true },
    { name: 'Tibetan Om Bowl', hz: 136.1, benefits: ['Om vibration', 'Universal sound', 'Peace'], premium: false },
    { name: 'Tibetan Meditation', hz: 110, benefits: ['Deep meditation', 'Trance', 'Stillness'], premium: true },
    { name: 'Tibetan Wellness Master', hz: 528, benefits: ['Master wellness', 'DNA harmony', 'Transformation'], premium: true },
    { name: 'Tibetan Full Moon', hz: 210.42, benefits: ['Lunar energy', 'Emotional balance', 'Intuition'], premium: true },
    { name: 'Tibetan Temple', hz: 432, benefits: ['Sacred space', 'Temple energy', 'Purification'], premium: true },
    { name: 'Tibetan Karma Clear', hz: 417, benefits: ['Karma clearing', 'Past life', 'Release'], premium: true },
    { name: 'Tibetan Rainbow Body', hz: 963, benefits: ['Light body', 'Ascension', 'Rainbow activation'], premium: true },
    { name: 'Tibetan Void', hz: 4, benefits: ['Emptiness', 'Stillness', 'Presence'], premium: true }
  ];

  tibetanFreqs.forEach(freq => {
    frequencies.push({
      id: (currentId++).toString(),
      name: freq.name,
      hz: freq.hz,
      category: 'tibetan',
      description: `Tibetan bowl frequency for ${freq.benefits[0].toLowerCase()}`,
      benefits: freq.benefits,
      duration: 900,
      isPremium: freq.premium
    });
  });

  // VEDIC/SANSKRIT FREQUENCIES (15 frequencies)
  const vedicFreqs = [
    { name: 'Om - Primordial Sound', hz: 136.1, benefits: ['Universal sound', 'Creation', 'Oneness'], premium: false },
    { name: 'Gam - Ganesh Mantra', hz: 288, benefits: ['Obstacle removal', 'New beginnings', 'Wisdom'], premium: true },
    { name: 'Shrim - Lakshmi Mantra', hz: 639, benefits: ['Abundance', 'Prosperity', 'Beauty'], premium: true },
    { name: 'Hrim - Shakti Mantra', hz: 528, benefits: ['Divine feminine', 'Power', 'Transformation'], premium: true },
    { name: 'Klim - Attraction Mantra', hz: 741, benefits: ['Attraction', 'Desire fulfillment', 'Magnetism'], premium: true },
    { name: 'Krim - Kali Mantra', hz: 417, benefits: ['Destruction of negativity', 'Protection', 'Power'], premium: true },
    { name: 'Aim - Saraswati Mantra', hz: 852, benefits: ['Knowledge', 'Creativity', 'Learning'], premium: true },
    { name: 'Dum - Durga Mantra', hz: 396, benefits: ['Protection', 'Strength', 'Courage'], premium: true },
    { name: 'Hlim - Liberation Mantra', hz: 963, benefits: ['Liberation', 'Freedom', 'Moksha'], premium: true },
    { name: 'Ksraum - Narasimha Mantra', hz: 174, benefits: ['Fierce protection', 'Evil removal', 'Victory'], premium: true },
    { name: 'Sanskrit Root Chakra', hz: 194.18, benefits: ['Muladhara', 'Grounding', 'Survival'], premium: true },
    { name: 'Sanskrit Ajna', hz: 448, benefits: ['Third eye', 'Command center', 'Wisdom'], premium: true },
    { name: 'Sanskrit Sahasrara', hz: 480, benefits: ['Crown lotus', 'Enlightenment', 'Unity'], premium: true },
    { name: 'Gayatri Frequency', hz: 110, benefits: ['Solar mantra', 'Illumination', 'Wisdom'], premium: true },
    { name: 'Mrityunjaya - Wellness', hz: 285, benefits: ['Conquering fear', 'Wellness', 'Immortality symbol'], premium: true }
  ];

  vedicFreqs.forEach(freq => {
    frequencies.push({
      id: (currentId++).toString(),
      name: freq.name,
      hz: freq.hz,
      category: 'vedic',
      description: `Vedic mantra frequency for ${freq.benefits[0].toLowerCase()}`,
      benefits: freq.benefits,
      duration: 900,
      isPremium: freq.premium
    });
  });

  // EGYPTIAN/ANCIENT FREQUENCIES (15 frequencies)
  const egyptianFreqs = [
    { name: 'Great Pyramid 33Hz', hz: 33, benefits: ['Pyramid power', 'Amplification', 'Preservation'], premium: true },
    { name: 'Kings Chamber 111Hz', hz: 111, benefits: ['Initiation', 'Transformation', 'Power'], premium: true },
    { name: 'Queens Chamber 222Hz', hz: 222, benefits: ['Feminine power', 'Balance', 'Reception'], premium: true },
    { name: 'Sphinx Frequency 7.83Hz', hz: 7.83, benefits: ['Ancient wisdom', 'Guardian energy', 'Secrets'], premium: false },
    { name: 'Ra - Solar Disc', hz: 126.22, benefits: ['Solar power', 'Life force', 'Creation'], premium: true },
    { name: 'Isis - Divine Feminine', hz: 210.42, benefits: ['Magic', 'Nurturing', 'Feminine wisdom'], premium: true },
    { name: 'Osiris - Resurrection', hz: 417, benefits: ['Rebirth', 'Transformation', 'Afterlife'], premium: true },
    { name: 'Thoth - Wisdom', hz: 852, benefits: ['Knowledge', 'Writing', 'Magic'], premium: true },
    { name: 'Anubis - Protection', hz: 396, benefits: ['Protection', 'Transition', 'Guidance'], premium: true },
    { name: 'Horus - Victory', hz: 528, benefits: ['Victory', 'Sky power', 'Divine right'], premium: true },
    { name: 'Sekhmet - Power', hz: 174, benefits: ['Warrior energy', 'Strength', 'Protection'], premium: true },
    { name: 'Hathor - Love', hz: 639, benefits: ['Love', 'Joy', 'Music'], premium: true },
    { name: 'Maat - Truth', hz: 741, benefits: ['Truth', 'Justice', 'Balance'], premium: true },
    { name: 'Ankh - Life Force', hz: 963, benefits: ['Eternal life', 'Divine energy', 'Immortality'], premium: true },
    { name: 'Scarab - Rebirth', hz: 285, benefits: ['Transformation', 'Rebirth', 'Protection'], premium: true }
  ];

  egyptianFreqs.forEach(freq => {
    frequencies.push({
      id: (currentId++).toString(),
      name: freq.name,
      hz: freq.hz,
      category: 'egyptian',
      description: `Ancient Egyptian frequency for ${freq.benefits[0].toLowerCase()}`,
      benefits: freq.benefits,
      duration: 900,
      isPremium: freq.premium
    });
  });

  return frequencies;
};

// Generate the complete library
export const FREQUENCIES = generateMassiveFrequencyLibrary();

export const getAvailableFrequencies = (subscriptionTier: string) => {
  const allFrequencies = FREQUENCIES;
  
  if (subscriptionTier === 'free') {
    // Free tier: only show 60 non-premium frequencies
    return allFrequencies
      .filter(f => !f.isPremium)
      .slice(0, 60);
  }
  
  // Premium users: all frequencies
  return allFrequencies;
};

export const getFrequenciesByCategory = (category: string) => {
  return FREQUENCIES.filter(f => f.category === category);
};

// Export the count for reference
export const TOTAL_FREQUENCIES = FREQUENCIES.length;

// =================================================================
// FREQUENCY BATHS - Pre-assembled multi-frequency wellness sessions
// Rebuilt from browser version for mobile app compatibility
// =================================================================
export const FREQUENCY_BATHS: FrequencyBath[] = [
  // === WELLNESS BATHS ===
  {
    id: 'bath-core-wellness',
    name: 'Core Wellness Bath',
    frequencies: [285, 528, 7.83],
    category: 'healing',
    description: 'Full-body balance with Schumann grounding',
    benefits: ['Cellular harmony', 'DNA balance', 'Earth grounding'],
    usage: 'Full-body balance + grounding for 20–30 min',
    duration: 1800,
    isPremium: false
  },
  {
    id: 'bath-comfort-support',
    name: 'Comfort Support Bath',
    frequencies: [174, 110, 7.83],
    category: 'healing',
    description: 'Deep relaxation and tension release',
    benefits: ['Deep comfort', 'Tension release', 'Grounding'],
    usage: 'Deep relaxation and tension release',
    duration: 1200,
    isPremium: false
  },
  {
    id: 'bath-bone-nerve',
    name: 'Bone & Nerve Support',
    frequencies: [128, 285, 396],
    category: 'healing',
    description: 'Supports skeletal and nervous system wellness',
    benefits: ['Bone strength', 'Nerve support', 'Tissue harmony'],
    usage: 'Supports skeletal and nervous system wellness',
    duration: 1200,
    isPremium: true
  },
  {
    id: 'bath-deep-restoration',
    name: 'Deep Restoration Bath',
    frequencies: [285, 528, 741],
    category: 'healing',
    description: 'Supports cellular harmony and balance simultaneously',
    benefits: ['Deep restoration', 'Cell harmony', 'Balance'],
    usage: 'Supports cellular harmony and balance simultaneously',
    duration: 1200,
    isPremium: true
  },
  {
    id: 'bath-vitality-support',
    name: 'Vitality Support Bath',
    frequencies: [741, 40, 639],
    category: 'healing',
    description: 'Balance, heart coherence, and gamma pulses for vitality',
    benefits: ['Vitality support', 'Balance', 'Heart coherence'],
    usage: 'Balance, heart coherence, and gamma pulses for vitality',
    duration: 1200,
    isPremium: true
  },
  {
    id: 'bath-vital-energy',
    name: 'Vital Energy Revive',
    frequencies: [396, 639, 136.1],
    category: 'healing',
    description: 'Restores life force while stabilizing recovery energy',
    benefits: ['Energy restoration', 'Life force', 'Vitality'],
    usage: 'Restores life force while stabilizing recovery energy',
    duration: 1200,
    isPremium: true
  },

  // === MENTAL/FOCUS BATHS ===
  {
    id: 'bath-focus',
    name: 'Focus Bath',
    frequencies: [14, 40, 528],
    category: 'mental',
    description: 'Sharp focus and positive mindset while working',
    benefits: ['Enhanced focus', 'Mental clarity', 'Positive mood'],
    usage: 'Sharp focus and positive mindset while working',
    duration: 1200,
    isPremium: false
  },
  {
    id: 'bath-brain-fog',
    name: 'Brain Fog Clearer',
    frequencies: [7.83, 10, 741],
    category: 'mental',
    description: 'Clears mental fog with Earth resonance support',
    benefits: ['Mental clarity', 'Fog clearing', 'Earth grounding'],
    usage: 'Clears mental fog with Earth resonance support',
    duration: 1200,
    isPremium: false
  },
  {
    id: 'bath-neuroplasticity',
    name: 'Neuroplasticity Expansion',
    frequencies: [6, 40, 10],
    category: 'mental',
    description: 'Boosts memory, creativity, and neural rewiring',
    benefits: ['Neuroplasticity', 'Memory boost', 'Creativity'],
    usage: 'Boosts memory, creativity, and neural rewiring',
    duration: 1200,
    isPremium: true
  },
  {
    id: 'bath-logic-reasoning',
    name: 'Logic & Reasoning Power',
    frequencies: [14, 40, 7.83],
    category: 'mental',
    description: 'Sharpens thinking while keeping you grounded',
    benefits: ['Logic enhancement', 'Reasoning', 'Grounding'],
    usage: 'Sharpens thinking while keeping you grounded',
    duration: 1200,
    isPremium: true
  },
  {
    id: 'bath-deep-study',
    name: 'Deep Study Flow',
    frequencies: [10, 14, 528],
    category: 'mental',
    description: 'Clarity + focus + positive emotional tone for studying',
    benefits: ['Study focus', 'Learning enhancement', 'Clarity'],
    usage: 'Clarity + focus + positive emotional tone for studying',
    duration: 1200,
    isPremium: true
  },
  {
    id: 'bath-math-insight',
    name: 'Mathematical Insight Bath',
    frequencies: [40, 852, 14],
    category: 'mental',
    description: 'Enhances problem-solving and symbolic recognition',
    benefits: ['Problem solving', 'Mathematical thinking', 'Insight'],
    usage: 'Enhances problem-solving and symbolic recognition',
    duration: 1200,
    isPremium: true
  },

  // === SPIRITUAL BATHS ===
  {
    id: 'bath-awakening-gateway',
    name: 'Awakening Gateway',
    frequencies: [4, 963, 136.1],
    category: 'spiritual',
    description: 'For breakthroughs and cosmic alignment',
    benefits: ['Spiritual awakening', 'Cosmic alignment', 'Breakthroughs'],
    usage: 'For breakthroughs and cosmic alignment',
    duration: 1800,
    isPremium: false
  },
  {
    id: 'bath-chakra-alignment',
    name: 'Chakra Alignment Sequence',
    frequencies: [396, 417, 528, 639, 741, 852, 963],
    category: 'spiritual',
    description: 'Full chakra sweep from root to crown',
    benefits: ['Chakra balancing', 'Energy alignment', 'Full body harmony'],
    usage: '3–7 min per tone to sweep the energy body',
    duration: 2400,
    isPremium: true
  },
  {
    id: 'bath-kundalini',
    name: 'Kundalini Rising Bath',
    frequencies: [396, 528, 852],
    category: 'spiritual',
    description: 'Activates kundalini flow upward safely',
    benefits: ['Kundalini activation', 'Energy flow', 'Spiritual awakening'],
    usage: 'Activates kundalini flow upward safely',
    duration: 1800,
    isPremium: true
  },
  {
    id: 'bath-universal-harmony',
    name: 'Universal Harmony Bath',
    frequencies: [432, 7.83, 963],
    category: 'spiritual',
    description: 'Aligns the body with universal peace signals',
    benefits: ['Universal harmony', 'Peace', 'Divine connection'],
    usage: 'Aligns the body with universal peace signals',
    duration: 1800,
    isPremium: true
  },
  {
    id: 'bath-crown-light',
    name: 'Crown Light Expansion',
    frequencies: [963, 136.1, 888],
    category: 'spiritual',
    description: 'Connects divine consciousness with abundance streams',
    benefits: ['Crown activation', 'Divine connection', 'Abundance'],
    usage: 'Connects divine consciousness with abundance streams',
    duration: 1800,
    isPremium: true
  },

  // === EMOTIONAL BATHS ===
  {
    id: 'bath-calm-release',
    name: 'Calm Release Bath',
    frequencies: [396, 639, 10],
    category: 'emotional',
    description: 'Grounding and emotional resilience with alpha entrainment',
    benefits: ['Deep calm', 'Emotional resilience', 'Peace'],
    usage: 'Grounding and emotional resilience with alpha entrainment',
    duration: 1200,
    isPremium: false
  },
  {
    id: 'bath-fear-release-deep',
    name: 'Fear Release Deep Release',
    frequencies: [396, 417, 7.83],
    category: 'emotional',
    description: 'Removes lingering stress with Earth resonance support',
    benefits: ['Fear release', 'Stress release', 'Grounding'],
    usage: 'Removes lingering stress with Earth resonance support',
    duration: 1200,
    isPremium: true
  },
  {
    id: 'bath-emotional-reset',
    name: 'Emotional Reset Bath',
    frequencies: [396, 639, 528],
    category: 'emotional',
    description: 'Rebalances heart and mind for harmony',
    benefits: ['Emotional balance', 'Heart harmony', 'Mental clarity'],
    usage: 'Rebalances heart and mind for harmony',
    duration: 1200,
    isPremium: true
  },
  {
    id: 'bath-deep-calm',
    name: 'Deep Calm Bath',
    frequencies: [110, 432, 10],
    category: 'emotional',
    description: 'Calms mind and stabilizes breathing via alpha entrainment',
    benefits: ['Deep calm', 'Breathing support', 'Peace'],
    usage: 'Calms mind and stabilizes breathing via alpha entrainment',
    duration: 1200,
    isPremium: true
  },
  {
    id: 'bath-self-love',
    name: 'Self-Love Enhancement',
    frequencies: [528, 639, 852],
    category: 'emotional',
    description: 'Amplifies self-worth and inner joy',
    benefits: ['Self love', 'Self worth', 'Inner joy'],
    usage: 'Amplifies self-worth and inner joy',
    duration: 1200,
    isPremium: true
  },
  {
    id: 'bath-mood-elevation',
    name: 'Mood Elevation Bath',
    frequencies: [396, 528, 40],
    category: 'emotional',
    description: 'Energizes mood with gamma uplift',
    benefits: ['Mood elevation', 'Energy boost', 'Emotional lift'],
    usage: 'Energizes mood with gamma uplift',
    duration: 1200,
    isPremium: true
  },

  // === PSYCHIC BATHS ===
  {
    id: 'bath-third-eye-ascension',
    name: 'Third Eye Ascension',
    frequencies: [852, 936, 40],
    category: 'psychic',
    description: 'Boosts intuition with gamma bursts',
    benefits: ['Third eye activation', 'Intuition boost', 'Psychic enhancement'],
    usage: 'Boosts intuition with gamma bursts',
    duration: 1800,
    isPremium: true
  },
  {
    id: 'bath-astral-navigator',
    name: 'Astral Navigator',
    frequencies: [4, 7.83, 852],
    category: 'psychic',
    description: 'Ideal for out-of-body exploration',
    benefits: ['Astral projection', 'OBE support', 'Theta trance'],
    usage: 'Ideal for out-of-body exploration',
    duration: 1800,
    isPremium: true
  },
  {
    id: 'bath-remote-viewing',
    name: 'Remote Viewing Gateway',
    frequencies: [6, 8, 852],
    category: 'psychic',
    description: 'Enhances clairvoyance and distant sensing',
    benefits: ['Remote viewing', 'Clairvoyance', 'Distant sensing'],
    usage: 'Enhances clairvoyance and distant sensing',
    duration: 1800,
    isPremium: true
  },
  {
    id: 'bath-psychic-amplifier',
    name: 'Psychic Amplifier Bath',
    frequencies: [852, 936, 639],
    category: 'psychic',
    description: 'Combines intuition with heart coherence for ESP',
    benefits: ['ESP enhancement', 'Intuition', 'Heart coherence'],
    usage: 'Combines intuition with heart coherence for ESP',
    duration: 1800,
    isPremium: true
  },
  {
    id: 'bath-pineal-light',
    name: 'Pineal Light Activation',
    frequencies: [852, 963, 7.83],
    category: 'psychic',
    description: 'Decalcifies and activates pineal awareness',
    benefits: ['Pineal activation', 'Decalcification', 'Awareness'],
    usage: 'Decalcifies and activates pineal awareness',
    duration: 1800,
    isPremium: true
  },
  {
    id: 'bath-telekinetic',
    name: 'Telekinetic Resonance',
    frequencies: [8, 45, 852],
    category: 'psychic',
    description: 'Experimental field for energy manipulation',
    benefits: ['Energy manipulation', 'Field activation', 'Psychic power'],
    usage: 'Experimental field for energy manipulation',
    duration: 1800,
    isPremium: true
  },

  // === MANIFESTATION BATHS ===
  {
    id: 'bath-abundance-flow',
    name: 'Abundance Flow',
    frequencies: [396, 528, 888],
    category: 'manifestation',
    description: 'Clears scarcity, charges intentions with love, amplifies abundance',
    benefits: ['Abundance', 'Scarcity clearing', 'Love charging'],
    usage: 'Clears scarcity, charges intentions with love, amplifies abundance',
    duration: 1200,
    isPremium: true
  },
  {
    id: 'bath-opportunity-magnet',
    name: 'Opportunity Magnet',
    frequencies: [7.83, 639, 222],
    category: 'manifestation',
    description: 'Grounds, opens the heart, and aligns partnership energy',
    benefits: ['Opportunity attraction', 'Heart opening', 'Partnership'],
    usage: 'Grounds, opens the heart, and aligns partnership energy',
    duration: 1200,
    isPremium: true
  },
  {
    id: 'bath-infinite-prosperity',
    name: 'Infinite Prosperity Gateway',
    frequencies: [111, 528, 888, 963],
    category: 'manifestation',
    description: 'Divine inspiration → love → abundance → unity field',
    benefits: ['Prosperity', 'Divine inspiration', 'Unity consciousness'],
    usage: 'Divine inspiration → love → abundance → unity field',
    duration: 1800,
    isPremium: true
  },
  {
    id: 'bath-wealth-alignment',
    name: 'Wealth Alignment Sequence',
    frequencies: [396, 528, 639, 888],
    category: 'manifestation',
    description: 'Ascending sequence for wealth manifestation',
    benefits: ['Wealth alignment', 'Financial abundance', 'Manifestation'],
    usage: 'Play ascending; focus intention at each step',
    duration: 1800,
    isPremium: true
  },
  {
    id: 'bath-quantum-creation',
    name: 'Quantum Creation Bath',
    frequencies: [8, 432, 999],
    category: 'manifestation',
    description: 'Theta creation space sealed with universal harmony + completion',
    benefits: ['Quantum manifestation', 'Creation', 'Completion'],
    usage: 'Theta creation space sealed with universal harmony + completion',
    duration: 1800,
    isPremium: true
  },

  // === METAPHYSICAL BATHS ===
  {
    id: 'bath-planetary-alignment',
    name: 'Planetary Alignment Bath',
    frequencies: [136.1, 210.42, 221.23],
    category: 'metaphysical',
    description: 'Connects Earth, Moon, and Venus energies',
    benefits: ['Planetary alignment', 'Cosmic connection', 'Balance'],
    usage: 'Connects Earth, Moon, and Venus energies',
    duration: 1800,
    isPremium: true
  },
  {
    id: 'bath-cosmic-power',
    name: 'Cosmic Power Field',
    frequencies: [126.22, 144.72, 183.58],
    category: 'metaphysical',
    description: 'Invokes solar vitality, courage, and abundance',
    benefits: ['Solar energy', 'Courage', 'Cosmic abundance'],
    usage: 'Invokes solar vitality, courage, and abundance',
    duration: 1800,
    isPremium: true
  },
  {
    id: 'bath-sacred-geometry',
    name: 'Sacred Geometry Bath',
    frequencies: [432, 528],
    category: 'metaphysical',
    description: 'Aligns with universal patterns using Fibonacci pulsing',
    benefits: ['Sacred geometry', 'Universal patterns', 'Harmony'],
    usage: 'Aligns with universal patterns using Fibonacci pulsing',
    duration: 1800,
    isPremium: true
  },
  {
    id: 'bath-tartarian-levitation',
    name: 'Tartarian Levitation Resonance',
    frequencies: [7.83, 45, 852],
    category: 'metaphysical',
    description: 'Inspired by speculative Tartarian resonance tech',
    benefits: ['Resonance tech', 'Levitation research', 'Angelic tones'],
    usage: 'Blend Schumann grounding, standing-wave mid band, and angelic overtones',
    duration: 1800,
    isPremium: true
  },
  {
    id: 'bath-angel-gateway',
    name: 'Angel Gateway Bath',
    frequencies: [111, 333, 639],
    category: 'metaphysical',
    description: 'Invites divine presence, wellness, and guidance',
    benefits: ['Angel connection', 'Divine presence', 'Guidance'],
    usage: 'Invites divine presence, wellness, and guidance',
    duration: 1800,
    isPremium: true
  },

  // === RIFE WELLNESS BATHS ===
  {
    id: 'bath-rife-master-balance',
    name: 'Rife Master Balance',
    frequencies: [20, 10000, 728],
    category: 'healing',
    description: 'Deep cellular balance with Rife protocol',
    benefits: ['Full body balance', 'Cellular clarity', 'Purification'],
    usage: 'Weekly deep balance session for 30 min',
    duration: 1800,
    isPremium: true
  },
  {
    id: 'bath-rife-vitality-protocol',
    name: 'Rife Vitality Protocol',
    frequencies: [465, 787, 880],
    category: 'healing',
    description: 'Complete Rife vitality support system',
    benefits: ['Vitality support', 'Wellness defense', 'Energy'],
    usage: 'Daily vitality support for 20 min',
    duration: 1200,
    isPremium: true
  },
  {
    id: 'bath-rife-comfort-protocol',
    name: 'Rife Comfort Protocol',
    frequencies: [3000, 95, 304],
    category: 'healing',
    description: 'Comprehensive Rife comfort support',
    benefits: ['Comfort support', 'Tension release', 'Relaxation'],
    usage: 'Use as needed for comfort support',
    duration: 1200,
    isPremium: true
  },
  {
    id: 'bath-rife-organ-tune',
    name: 'Rife Organ Harmony',
    frequencies: [1552, 625, 720, 696],
    category: 'healing',
    description: 'Major organ support and balance',
    benefits: ['Liver support', 'Kidney balance', 'Lung wellness', 'Heart harmony'],
    usage: 'Weekly organ support session',
    duration: 2400,
    isPremium: true
  },
  {
    id: 'bath-rife-nerve-support',
    name: 'Rife Nerve Support',
    frequencies: [2720, 6000, 764],
    category: 'healing',
    description: 'Neural support and balance',
    benefits: ['Nerve support', 'Nerve comfort', 'Brain balance'],
    usage: 'For nerve-related comfort support',
    duration: 1800,
    isPremium: true
  },

  // === ANGEL NUMBER BATHS ===
  {
    id: 'bath-angel-activation',
    name: 'Angel Number Activation',
    frequencies: [111, 222, 333, 444],
    category: 'spiritual',
    description: 'Activates angel number sequence for divine support',
    benefits: ['Angel connection', 'Divine guidance', 'Spiritual awakening'],
    usage: 'Morning angel connection ritual',
    duration: 1800,
    isPremium: true
  },
  {
    id: 'bath-abundance-angels',
    name: 'Abundance Angels Bath',
    frequencies: [888, 777, 528],
    category: 'manifestation',
    description: 'Angelic abundance frequencies combined',
    benefits: ['Financial miracles', 'Abundance flow', 'Good fortune'],
    usage: 'Abundance manifestation with angel support',
    duration: 1200,
    isPremium: true
  },
  {
    id: 'bath-angel-completion',
    name: 'Angel Completion Bath',
    frequencies: [999, 555, 111],
    category: 'spiritual',
    description: 'Endings, transformation, and new beginnings',
    benefits: ['Completion', 'Transformation', 'New chapter'],
    usage: 'For life transitions and closing cycles',
    duration: 1500,
    isPremium: true
  },
  {
    id: 'bath-twin-flame',
    name: 'Twin Flame Reunion',
    frequencies: [1111, 222, 639],
    category: 'emotional',
    description: 'Twin flame connection and heart alignment',
    benefits: ['Twin flame energy', 'Soul connection', 'Heart opening'],
    usage: 'For twin flame work and soul connections',
    duration: 1800,
    isPremium: true
  },
  {
    id: 'bath-angel-protection',
    name: 'Angel Army Protection',
    frequencies: [444, 4444, 333],
    category: 'metaphysical',
    description: 'Maximum angelic protection field',
    benefits: ['Divine protection', 'Angel support', 'Safety'],
    usage: 'When needing extra spiritual protection',
    duration: 1200,
    isPremium: true
  },

  // === CRYSTAL BATHS ===
  {
    id: 'bath-crystal-master',
    name: 'Crystal Master Balance',
    frequencies: [32768, 528, 480],
    category: 'healing',
    description: 'Clear quartz amplified wellness session',
    benefits: ['Amplified wellness', 'Energy clearing', 'Clarity'],
    usage: 'Powerful wellness amplification session',
    duration: 1800,
    isPremium: true
  },
  {
    id: 'bath-crystal-protection',
    name: 'Crystal Protection Grid',
    frequencies: [152, 174, 7.83],
    category: 'metaphysical',
    description: 'Black tourmaline and obsidian protection',
    benefits: ['EMF protection', 'Grounding', 'Negative energy shield'],
    usage: 'Daily protection and grounding',
    duration: 1200,
    isPremium: true
  },
  {
    id: 'bath-crystal-love',
    name: 'Crystal Heart Opening',
    frequencies: [350, 639, 341.3],
    category: 'emotional',
    description: 'Rose quartz and jade heart opening',
    benefits: ['Heart opening', 'Self-love', 'Relationship harmony'],
    usage: 'Heart chakra opening and love attraction',
    duration: 1500,
    isPremium: true
  },
  {
    id: 'bath-crystal-abundance',
    name: 'Crystal Abundance Grid',
    frequencies: [320, 888, 183.58],
    category: 'manifestation',
    description: 'Citrine and pyrite wealth frequencies',
    benefits: ['Abundance', 'Prosperity', 'Financial flow'],
    usage: 'Wealth manifestation with crystal energy',
    duration: 1200,
    isPremium: true
  },
  {
    id: 'bath-crystal-intuition',
    name: 'Crystal Third Eye',
    frequencies: [426.7, 480, 852],
    category: 'psychic',
    description: 'Lapis lazuli and amethyst intuition boost',
    benefits: ['Psychic enhancement', 'Intuition', 'Vision'],
    usage: 'Third eye activation with crystal frequencies',
    duration: 1500,
    isPremium: true
  },
  {
    id: 'bath-crystal-clearing',
    name: 'Crystal Energy Clearing',
    frequencies: [4096, 417, 7.83],
    category: 'spiritual',
    description: 'Selenite clearing and purification',
    benefits: ['Energy clearing', 'Aura clearing', 'Purification'],
    usage: 'Clear negative energy from space and body',
    duration: 1200,
    isPremium: true
  },

  // === TESLA/SACRED GEOMETRY BATHS ===
  {
    id: 'bath-tesla-369',
    name: 'Tesla 3-6-9 Activation',
    frequencies: [3, 6, 9, 369],
    category: 'manifestation',
    description: 'Nikola Tesla universe key sequence',
    benefits: ['Creation power', 'Universe alignment', 'Manifestation'],
    usage: 'Tesla method for reality creation',
    duration: 1800,
    isPremium: true
  },
  {
    id: 'bath-sacred-fibonacci',
    name: 'Fibonacci Spiral',
    frequencies: [1, 2, 3, 5, 8, 13],
    category: 'spiritual',
    description: 'Golden ratio growth sequence',
    benefits: ['Natural growth', 'Divine proportion', 'Harmony'],
    usage: 'Aligning with natural growth patterns',
    duration: 2100,
    isPremium: true
  },
  {
    id: 'bath-sacred-phi',
    name: 'Golden Ratio Harmony',
    frequencies: [1.618, 432, 528],
    category: 'spiritual',
    description: 'Phi ratio with cosmic harmony',
    benefits: ['Perfect proportion', 'Natural beauty', 'Divine order'],
    usage: 'Beauty, harmony, and divine proportion',
    duration: 1500,
    isPremium: true
  },
  {
    id: 'bath-metatron',
    name: 'Metatron Activation',
    frequencies: [444, 888, 963],
    category: 'metaphysical',
    description: 'Archangel Metatrons cube frequency',
    benefits: ['Sacred geometry', 'Angelic power', 'Transformation'],
    usage: 'Metatron connection and sacred geometry activation',
    duration: 1800,
    isPremium: true
  },
  {
    id: 'bath-flower-life',
    name: 'Flower of Life',
    frequencies: [128, 256, 512],
    category: 'spiritual',
    description: 'Sacred creation pattern frequencies',
    benefits: ['Creation pattern', 'Unity', 'Divine blueprint'],
    usage: 'Connecting with universal creation pattern',
    duration: 1800,
    isPremium: true
  },

  // === SCHUMANN/EARTH BATHS ===
  {
    id: 'bath-earth-full',
    name: 'Full Earth Resonance',
    frequencies: [7.83, 14.3, 20.8, 27.3],
    category: 'healing',
    description: 'Complete Schumann harmonic series',
    benefits: ['Deep grounding', 'Earth sync', 'Natural balance'],
    usage: 'Maximum earth connection and grounding',
    duration: 2400,
    isPremium: true
  },
  {
    id: 'bath-nature-immersion',
    name: 'Nature Immersion',
    frequencies: [10.8, 12, 8.5],
    category: 'healing',
    description: 'Forest, ocean, and rainforest frequencies',
    benefits: ['Nature connection', 'Calm support', 'Life force'],
    usage: 'Virtual nature immersion for wellness',
    duration: 1800,
    isPremium: true
  },
  {
    id: 'bath-ley-line',
    name: 'Ley Line Connection',
    frequencies: [33, 7.83, 111],
    category: 'metaphysical',
    description: 'Earth grid and sacred site connection',
    benefits: ['Ley line energy', 'Sacred sites', 'Earth power'],
    usage: 'Connecting with Earths energy grid',
    duration: 1800,
    isPremium: true
  },
  {
    id: 'bath-circadian-reset',
    name: 'Circadian Rhythm Reset',
    frequencies: [6.66, 3, 7.83],
    category: 'sleep',
    description: 'Day/night cycle restoration',
    benefits: ['Sleep cycle', 'Natural rhythm', 'Travel recovery'],
    usage: 'Reset body clock and sleep cycle',
    duration: 1800,
    isPremium: true
  },

  // === TIBETAN BATHS ===
  {
    id: 'bath-tibetan-full-chakra',
    name: 'Tibetan Full Chakra',
    frequencies: [256, 288, 320, 341.3, 384, 426.7, 480],
    category: 'spiritual',
    description: 'Complete Tibetan bowl chakra alignment',
    benefits: ['Full chakra balance', 'Energy alignment', 'Spiritual harmony'],
    usage: 'Complete chakra alignment session',
    duration: 2800,
    isPremium: true
  },
  {
    id: 'bath-tibetan-meditation',
    name: 'Tibetan Deep Meditation',
    frequencies: [110, 4, 136.1],
    category: 'spiritual',
    description: 'Temple meditation with Om vibration',
    benefits: ['Deep meditation', 'Stillness', 'Om resonance'],
    usage: 'Deep meditative states and contemplation',
    duration: 2400,
    isPremium: true
  },
  {
    id: 'bath-tibetan-karma',
    name: 'Tibetan Karma Clearing',
    frequencies: [417, 136.1, 285],
    category: 'spiritual',
    description: 'Past life and karma clearing session',
    benefits: ['Karma release', 'Past life clarity', 'Freedom'],
    usage: 'Deep karmic clearing and ancestral connection',
    duration: 1800,
    isPremium: true
  },
  {
    id: 'bath-tibetan-ascension',
    name: 'Tibetan Rainbow Body',
    frequencies: [963, 144, 432],
    category: 'spiritual',
    description: 'Light body and ascension frequencies',
    benefits: ['Light body', 'Ascension', 'Higher dimensions'],
    usage: 'Advanced spiritual ascension practice',
    duration: 2400,
    isPremium: true
  },

  // === VEDIC/MANTRA BATHS ===
  {
    id: 'bath-vedic-prosperity',
    name: 'Lakshmi Prosperity Bath',
    frequencies: [639, 888, 183.58],
    category: 'manifestation',
    description: 'Shrim mantra with abundance frequencies',
    benefits: ['Prosperity', 'Abundance', 'Divine wealth'],
    usage: 'Invoking Lakshmi for wealth and beauty',
    duration: 1500,
    isPremium: true
  },
  {
    id: 'bath-vedic-obstacle',
    name: 'Ganesh Obstacle Remover',
    frequencies: [288, 417, 741],
    category: 'manifestation',
    description: 'Gam mantra for removing blocks',
    benefits: ['Obstacle removal', 'New paths', 'Success'],
    usage: 'Remove obstacles and open new opportunities',
    duration: 1500,
    isPremium: true
  },
  {
    id: 'bath-vedic-protection',
    name: 'Durga Protection Bath',
    frequencies: [396, 174, 7.83],
    category: 'emotional',
    description: 'Dum mantra for divine protection',
    benefits: ['Divine protection', 'Strength', 'Courage'],
    usage: 'Invoking divine feminine protection',
    duration: 1500,
    isPremium: true
  },
  {
    id: 'bath-vedic-wisdom',
    name: 'Saraswati Wisdom Bath',
    frequencies: [852, 40, 963],
    category: 'mental',
    description: 'Aim mantra for knowledge and creativity',
    benefits: ['Knowledge', 'Creativity', 'Learning'],
    usage: 'Before study, creative work, or learning',
    duration: 1500,
    isPremium: true
  },
  {
    id: 'bath-gayatri-sun',
    name: 'Gayatri Sun Bath',
    frequencies: [110, 126.22, 528],
    category: 'spiritual',
    description: 'Solar mantra with sun frequency',
    benefits: ['Solar power', 'Illumination', 'Vitality'],
    usage: 'Morning sun salutation and energizing',
    duration: 1500,
    isPremium: true
  },

  // === EGYPTIAN BATHS ===
  {
    id: 'bath-pyramid-power',
    name: 'Great Pyramid Power',
    frequencies: [33, 111, 222],
    category: 'metaphysical',
    description: 'Pyramid chamber frequencies combined',
    benefits: ['Pyramid energy', 'Amplification', 'Initiation'],
    usage: 'Pyramid power meditation and wellness',
    duration: 1800,
    isPremium: true
  },
  {
    id: 'bath-egyptian-gods',
    name: 'Egyptian God Invocation',
    frequencies: [126.22, 210.42, 528],
    category: 'metaphysical',
    description: 'Ra, Isis, and Horus trinity',
    benefits: ['Divine Egyptian energy', 'Power', 'Wellness'],
    usage: 'Invoking Egyptian deity energies',
    duration: 2100,
    isPremium: true
  },
  {
    id: 'bath-thoth-wisdom',
    name: 'Thoth Wisdom Chamber',
    frequencies: [852, 963, 33],
    category: 'mental',
    description: 'Thoth knowledge and magic activation',
    benefits: ['Ancient wisdom', 'Magic', 'Hidden knowledge'],
    usage: 'Accessing ancient knowledge and wisdom',
    duration: 1800,
    isPremium: true
  },
  {
    id: 'bath-ankh-life',
    name: 'Ankh Life Force',
    frequencies: [963, 528, 126.22],
    category: 'healing',
    description: 'Ankh eternal life force activation',
    benefits: ['Life force', 'Immortality energy', 'Divine power'],
    usage: 'Life force activation and renewal',
    duration: 1800,
    isPremium: true
  },
  {
    id: 'bath-scarab-rebirth',
    name: 'Scarab Transformation',
    frequencies: [285, 417, 555],
    category: 'spiritual',
    description: 'Scarab rebirth and transformation',
    benefits: ['Rebirth', 'Transformation', 'New life'],
    usage: 'Major life transformation and rebirth',
    duration: 1800,
    isPremium: true
  },

  // === SLEEP SPECIALTY BATHS ===
  {
    id: 'bath-sleep-master',
    name: 'Master Sleep Protocol',
    frequencies: [1, 2, 3, 7.83],
    category: 'sleep',
    description: 'Complete delta spectrum with grounding',
    benefits: ['Deep sleep', 'Sleep maintenance', 'Rest quality'],
    usage: 'Ultimate sleep induction and maintenance',
    duration: 28800,
    isPremium: true
  },
  {
    id: 'bath-lucid-dream',
    name: 'Lucid Dream Gateway',
    frequencies: [4, 6, 852],
    category: 'sleep',
    description: 'Theta frequencies for lucid dreaming',
    benefits: ['Lucid dreaming', 'Dream control', 'Awareness'],
    usage: 'Inducing lucid dream states',
    duration: 1800,
    isPremium: true
  },
  {
    id: 'bath-sleep-onset',
    name: 'Sleep Onset Support',
    frequencies: [1.5, 3, 10],
    category: 'sleep',
    description: 'Targeted sleep support protocol',
    benefits: ['Sleep support', 'Sleep onset', 'Relaxation'],
    usage: 'For those seeking better sleep onset',
    duration: 3600,
    isPremium: true
  },
  {
    id: 'bath-power-nap',
    name: 'Power Nap Boost',
    frequencies: [10, 8, 40],
    category: 'sleep',
    description: 'Quick restoration and alertness',
    benefits: ['Quick rest', 'Energy boost', 'Mental refresh'],
    usage: '20-minute power nap enhancement',
    duration: 1200,
    isPremium: false
  },

  // === FOCUS & PRODUCTIVITY BATHS ===
  {
    id: 'bath-flow-state',
    name: 'Flow State Inducer',
    frequencies: [10, 14, 40],
    category: 'mental',
    description: 'Peak performance flow state activation',
    benefits: ['Flow state', 'Peak performance', 'Productivity'],
    usage: 'Getting into productive flow state',
    duration: 3600,
    isPremium: true
  },
  {
    id: 'bath-study-master',
    name: 'Study Master Protocol',
    frequencies: [9, 10, 40, 528],
    category: 'mental',
    description: 'Ultimate study and memory enhancement',
    benefits: ['Learning boost', 'Memory retention', 'Focus'],
    usage: 'Before and during study sessions',
    duration: 3600,
    isPremium: true
  },
  {
    id: 'bath-creative-genius',
    name: 'Creative Genius Bath',
    frequencies: [6, 7, 417, 741],
    category: 'mental',
    description: 'Theta creativity with expression boost',
    benefits: ['Creative flow', 'Innovation', 'Artistic expression'],
    usage: 'Artistic and creative work sessions',
    duration: 2400,
    isPremium: true
  },
  {
    id: 'bath-executive-function',
    name: 'Executive Function Boost',
    frequencies: [14, 18, 40],
    category: 'mental',
    description: 'Decision making and logic enhancement',
    benefits: ['Decision making', 'Logic', 'Executive function'],
    usage: 'Important meetings and decisions',
    duration: 1800,
    isPremium: true
  }
];

// Export bath count
export const TOTAL_BATHS = FREQUENCY_BATHS.length;

// Helper to get baths by category
export const getBathsByCategory = (category: string) => {
  return FREQUENCY_BATHS.filter(b => b.category === category);
};

// Helper to get available baths based on subscription
export const getAvailableBaths = (subscriptionTier: string) => {
  if (subscriptionTier === 'free') {
    // Free tier: 2 curated baths to showcase premium experience
    return FREQUENCY_BATHS.filter(b => 
      b.id === 'bath-core-wellness' || b.id === 'bath-sleep-deep'
    );
  }
  // Premium (weekly/lifetime/elite): all baths
  return FREQUENCY_BATHS;
};

console.log(`🎵 HealTone Library: ${TOTAL_FREQUENCIES} wellness frequencies + ${TOTAL_BATHS} wellness baths loaded!`);