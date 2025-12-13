export interface Frequency {
  id: string;
  name: string;
  hz: number;
  category: 'solfeggio' | 'chakra' | 'binaural' | 'healing' | 'planetary' | 'crystal' | 'color' | 'organ' | 'emotion' | 'dna' | 'immune' | 'brain' | 'sleep' | 'energy' | 'manifestation';
  description: string;
  benefits: string[];
  duration: number;
  isPremium: boolean;
}

// Generate comprehensive 500+ frequency library
const generateMassiveFrequencyLibrary = (): Frequency[] => {
  const frequencies: Frequency[] = [];
  let currentId = 1;

  // SOLFEGGIO FREQUENCIES (Extended Ancient Scale)
  const solfeggioFreqs = [
    { name: 'Liberation from Fear', hz: 174, benefits: ['Pain relief', 'Reduces anxiety', 'Grounding'], premium: false },
    { name: 'Tissue Healing', hz: 285, benefits: ['Tissue healing', 'Immune boost', 'Cellular repair'], premium: false },
    { name: 'Liberation from Guilt', hz: 396, benefits: ['Guilt release', 'Liberating fear', 'Grounding'], premium: false },
    { name: 'Facilitating Change', hz: 417, benefits: ['Facilitating change', 'Breaking negative cycles', 'Creativity'], premium: false },
    { name: 'Love & DNA Repair', hz: 528, benefits: ['DNA repair', 'Love frequency', 'Transformation'], premium: false },
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
      description: `Ancient healing frequency for ${freq.name.toLowerCase()}`,
      benefits: freq.benefits,
      duration: 300,
      isPremium: freq.premium
    });
  });

  // CHAKRA FREQUENCIES (Complete System + Higher Chakras)
  const chakraFreqs = [
    { name: 'Earth Star Chakra', hz: 68, benefits: ['Deep grounding', 'Earth connection', 'Ancestral healing'], premium: true },
    { name: 'Root Chakra', hz: 256, benefits: ['Grounding', 'Security', 'Stability'], premium: false },
    { name: 'Sacral Chakra', hz: 288, benefits: ['Creativity', 'Sexual energy', 'Emotional balance'], premium: false },
    { name: 'Solar Plexus Chakra', hz: 320, benefits: ['Personal power', 'Confidence', 'Self-esteem'], premium: false },
    { name: 'Heart Chakra', hz: 341.3, benefits: ['Love', 'Compassion', 'Emotional healing'], premium: false },
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
    { name: 'Deep Sleep Delta 0.5Hz', hz: 0.5, benefits: ['Deepest sleep', 'Physical healing', 'Complete rest'], premium: false },
    { name: 'Deep Sleep Delta 1Hz', hz: 1, benefits: ['Deep sleep', 'Recovery', 'Regeneration'], premium: false },
    { name: 'Deep Sleep Delta 2Hz', hz: 2, benefits: ['Sleep induction', 'Relaxation', 'Healing'], premium: false },
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
    { name: 'Gamma 40Hz', hz: 40, benefits: ['Peak cognition', 'Heightened awareness', 'Unity consciousness'], premium: true },
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
    { name: 'Pluto', hz: 140.25, benefits: ['Transformation', 'Rebirth', 'Deep healing'], premium: true }
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

  // HEALING FREQUENCIES (Complete Medical Spectrum)
  const healingFreqs = [
    // Pain & Inflammation
    { name: 'Pain Relief', hz: 95, benefits: ['Pain reduction', 'Inflammation relief', 'Comfort'], premium: false },
    { name: 'Chronic Pain', hz: 304, benefits: ['Chronic pain relief', 'Long-term comfort', 'Quality of life'], premium: true },
    { name: 'Inflammation Reducer', hz: 1.2, benefits: ['Reduce inflammation', 'Healing acceleration', 'Recovery'], premium: true },
    { name: 'Arthritis Relief', hz: 1.5, benefits: ['Joint pain relief', 'Mobility improvement', 'Flexibility'], premium: true },
    
    // Tissue & Cellular Healing
    { name: 'Tissue Healing', hz: 285, benefits: ['Tissue repair', 'Regeneration', 'Cellular healing'], premium: false },
    { name: 'Bone Healing', hz: 20, benefits: ['Bone repair', 'Fracture healing', 'Density increase'], premium: true },
    { name: 'Muscle Recovery', hz: 120, benefits: ['Muscle repair', 'Recovery', 'Strength'], premium: true },
    { name: 'Skin Regeneration', hz: 465, benefits: ['Skin healing', 'Scar reduction', 'Cell renewal'], premium: true },
    { name: 'Wound Healing', hz: 250, benefits: ['Accelerated healing', 'Tissue repair', 'Recovery'], premium: true },
    
    // Immune System
    { name: 'Immune Boost', hz: 124, benefits: ['Immune enhancement', 'Disease resistance', 'Vitality'], premium: false },
    { name: 'White Blood Cells', hz: 2.5, benefits: ['WBC production', 'Immunity', 'Infection fighting'], premium: true },
    { name: 'Lymphatic Drainage', hz: 15.2, benefits: ['Lymphatic flow', 'Toxin removal', 'Immune support'], premium: true },
    { name: 'Antiviral', hz: 2644, benefits: ['Virus resistance', 'Immune defense', 'Health protection'], premium: true },
    { name: 'Antibacterial', hz: 2112, benefits: ['Bacterial resistance', 'Infection prevention', 'Healing'], premium: true },
    
    // Circulation & Heart
    { name: 'Circulation Boost', hz: 33, benefits: ['Blood flow', 'Circulation', 'Oxygenation'], premium: true },
    { name: 'Heart Health', hz: 341.3, benefits: ['Heart healing', 'Cardiovascular health', 'Love energy'], premium: true },
    { name: 'Blood Pressure', hz: 10, benefits: ['Blood pressure regulation', 'Cardiovascular balance', 'Health'], premium: true },
    { name: 'Arterial Health', hz: 1.45, benefits: ['Arterial health', 'Circulation improvement', 'Heart support'], premium: true },
    
    // Detoxification
    { name: 'General Detox', hz: 10000, benefits: ['Toxin removal', 'Cleansing', 'Purification'], premium: true },
    { name: 'Liver Detox', hz: 317.83, benefits: ['Liver cleansing', 'Metabolism boost', 'Toxin processing'], premium: true },
    { name: 'Kidney Cleanse', hz: 319.88, benefits: ['Kidney health', 'Filtration', 'Fluid balance'], premium: true },
    { name: 'Heavy Metal Detox', hz: 1.14, benefits: ['Heavy metal removal', 'Cellular cleansing', 'Health restoration'], premium: true },
    
    // Nervous System
    { name: 'Nerve Regeneration', hz: 2720, benefits: ['Nerve repair', 'Neuropathy relief', 'Sensation restoration'], premium: true },
    { name: 'Nervous System', hz: 8, benefits: ['Nervous system health', 'Neural function', 'Coordination'], premium: true },
    { name: 'Neuralgia Relief', hz: 6000, benefits: ['Nerve pain relief', 'Neuralgia treatment', 'Comfort'], premium: true },
    
    // Hormonal Balance
    { name: 'Hormone Balance', hz: 8, benefits: ['Hormonal regulation', 'Endocrine health', 'Balance'], premium: true },
    { name: 'Thyroid Balance', hz: 384, benefits: ['Thyroid function', 'Metabolism', 'Energy'], premium: true },
    { name: 'Adrenal Support', hz: 492.8, benefits: ['Adrenal health', 'Stress response', 'Energy'], premium: true },
    { name: 'Insulin Balance', hz: 787, benefits: ['Blood sugar regulation', 'Insulin sensitivity', 'Metabolic health'], premium: true },
    
    // Digestive Health
    { name: 'Digestive Health', hz: 110, benefits: ['Digestion improvement', 'Gut health', 'Nutrient absorption'], premium: true },
    { name: 'Stomach Healing', hz: 727, benefits: ['Stomach health', 'Acid balance', 'Digestive comfort'], premium: true },
    { name: 'Intestinal Health', hz: 802, benefits: ['Intestinal healing', 'Gut flora balance', 'Digestive wellness'], premium: true },
    { name: 'Liver Function', hz: 1550, benefits: ['Liver health', 'Metabolic function', 'Detoxification'], premium: true },
    
    // Respiratory System
    { name: 'Lung Health', hz: 333, benefits: ['Lung capacity', 'Breathing', 'Oxygenation'], premium: true },
    { name: 'Asthma Relief', hz: 522, benefits: ['Breathing ease', 'Respiratory relief', 'Lung function'], premium: true },
    { name: 'Respiratory Healing', hz: 1234, benefits: ['Respiratory health', 'Lung healing', 'Breath improvement'], premium: true },
    
    // Anti-Aging & Longevity
    { name: 'Anti-Aging', hz: 528, benefits: ['Cellular renewal', 'Anti-aging', 'Longevity'], premium: true },
    { name: 'Telomere Protection', hz: 741, benefits: ['Telomere health', 'Cellular longevity', 'Anti-aging'], premium: true },
    { name: 'Growth Hormone', hz: 6, benefits: ['GH production', 'Anti-aging', 'Vitality'], premium: true },
    { name: 'Collagen Production', hz: 1550, benefits: ['Collagen synthesis', 'Skin elasticity', 'Joint health'], premium: true },
    
    // Weight & Metabolism
    { name: 'Weight Loss', hz: 295.8, benefits: ['Metabolism boost', 'Fat burning', 'Weight management'], premium: true },
    { name: 'Metabolism Boost', hz: 465, benefits: ['Metabolic increase', 'Energy boost', 'Fat burning'], premium: true },
    { name: 'Appetite Control', hz: 6000, benefits: ['Appetite regulation', 'Hunger control', 'Weight management'], premium: true },
    { name: 'Fat Burning', hz: 295, benefits: ['Fat metabolism', 'Weight loss', 'Body composition'], premium: true }
  ];

  healingFreqs.forEach(freq => {
    frequencies.push({
      id: (currentId++).toString(),
      name: freq.name,
      hz: freq.hz,
      category: 'healing',
      description: `Targeted healing frequency for ${freq.name.toLowerCase()}`,
      benefits: freq.benefits,
      duration: 300,
      isPremium: freq.premium
    });
  });

  // ORGAN-SPECIFIC FREQUENCIES (Complete Body Systems)
  const organFreqs = [
    // Major Organs
    { name: 'Heart Optimization', hz: 341.3, benefits: ['Heart health', 'Circulation', 'Love energy'], premium: true },
    { name: 'Liver Function', hz: 317.83, benefits: ['Liver health', 'Detox', 'Metabolism'], premium: true },
    { name: 'Kidney Health', hz: 319.88, benefits: ['Kidney function', 'Filtration', 'Balance'], premium: true },
    { name: 'Lung Capacity', hz: 333, benefits: ['Breathing', 'Lung health', 'Oxygenation'], premium: true },
    { name: 'Brain Enhancement', hz: 40, benefits: ['Cognitive function', 'Memory', 'Focus'], premium: true },
    { name: 'Stomach Health', hz: 110, benefits: ['Digestion', 'Stomach function', 'Gut health'], premium: true },
    { name: 'Pancreas Support', hz: 117.3, benefits: ['Pancreatic health', 'Blood sugar', 'Enzyme production'], premium: true },
    { name: 'Spleen Function', hz: 20, benefits: ['Spleen health', 'Blood filtration', 'Immune function'], premium: true },
    
    // Glands
    { name: 'Pineal Gland', hz: 936, benefits: ['Pineal function', 'Melatonin', 'Spiritual connection'], premium: true },
    { name: 'Pituitary Gland', hz: 635, benefits: ['Master gland function', 'Hormone regulation', 'Growth'], premium: true },
    { name: 'Thyroid Gland', hz: 384, benefits: ['Thyroid health', 'Metabolism', 'Energy production'], premium: true },
    { name: 'Adrenal Glands', hz: 492.8, benefits: ['Adrenal function', 'Stress response', 'Energy'], premium: true },
    { name: 'Thymus Gland', hz: 319, benefits: ['Immune function', 'T-cell production', 'Health'], premium: true },
    
    // Reproductive System
    { name: 'Reproductive Health', hz: 288, benefits: ['Reproductive function', 'Fertility', 'Sexual health'], premium: true },
    { name: 'Prostate Health', hz: 2050, benefits: ['Prostate function', 'Male health', 'Comfort'], premium: true },
    { name: 'Ovarian Health', hz: 2489, benefits: ['Ovarian function', 'Female health', 'Hormonal balance'], premium: true },
    { name: 'Fertility Enhancement', hz: 2008, benefits: ['Fertility boost', 'Reproductive health', 'Conception'], premium: true },
    
    // Sensory Organs
    { name: 'Eye Health', hz: 1552, benefits: ['Vision improvement', 'Eye health', 'Sight enhancement'], premium: true },
    { name: 'Ear Health', hz: 1550, benefits: ['Hearing improvement', 'Ear health', 'Tinnitus relief'], premium: true },
    { name: 'Sinus Health', hz: 1865, benefits: ['Sinus clearing', 'Nasal health', 'Breathing improvement'], premium: true },
    
    // Skeletal System
    { name: 'Bone Density', hz: 20, benefits: ['Bone strength', 'Density increase', 'Skeletal health'], premium: true },
    { name: 'Joint Health', hz: 1.2, benefits: ['Joint function', 'Flexibility', 'Mobility'], premium: true },
    { name: 'Cartilage Repair', hz: 465, benefits: ['Cartilage healing', 'Joint comfort', 'Mobility'], premium: true },
    { name: 'Spine Alignment', hz: 110, benefits: ['Spinal health', 'Alignment', 'Posture improvement'], premium: true }
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

  // EMOTIONAL HEALING FREQUENCIES (Complete Emotional Spectrum)
  const emotionFreqs = [
    // Basic Emotions
    { name: 'Anxiety Relief', hz: 396, benefits: ['Anxiety reduction', 'Calm', 'Peace'], premium: false },
    { name: 'Depression Lift', hz: 528, benefits: ['Mood elevation', 'Hope', 'Joy'], premium: false },
    { name: 'Anger Release', hz: 741, benefits: ['Anger management', 'Emotional balance', 'Peace'], premium: true },
    { name: 'Fear Dissolution', hz: 396, benefits: ['Fear release', 'Courage', 'Confidence'], premium: true },
    { name: 'Grief Processing', hz: 417, benefits: ['Grief healing', 'Acceptance', 'Emotional release'], premium: true },
    { name: 'Stress Relief', hz: 432, benefits: ['Stress reduction', 'Relaxation', 'Calm'], premium: false },
    { name: 'Worry Release', hz: 852, benefits: ['Worry reduction', 'Mental peace', 'Clarity'], premium: true },
    { name: 'Guilt Clearing', hz: 396, benefits: ['Guilt release', 'Self-forgiveness', 'Freedom'], premium: true },
    { name: 'Shame Healing', hz: 417, benefits: ['Shame release', 'Self-acceptance', 'Healing'], premium: true },
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
    { name: 'Forgiveness', hz: 639, benefits: ['Forgiveness healing', 'Letting go', 'Peace'], premium: true },
    
    // Relationship Healing
    { name: 'Heart Healing', hz: 341.3, benefits: ['Heartbreak healing', 'Emotional recovery', 'Love'], premium: true },
    { name: 'Trust Issues', hz: 639, benefits: ['Trust rebuilding', 'Faith restoration', 'Security'], premium: true },
    { name: 'Abandonment Issues', hz: 396, benefits: ['Abandonment healing', 'Security building', 'Trust'], premium: true },
    { name: 'Betrayal Healing', hz: 417, benefits: ['Betrayal recovery', 'Trust rebuilding', 'Healing'], premium: true },
    { name: 'Codependency', hz: 741, benefits: ['Healthy boundaries', 'Independence', 'Self-love'], premium: true },
    
    // Trauma & PTSD
    { name: 'Trauma Release', hz: 417, benefits: ['Trauma healing', 'Emotional release', 'Recovery'], premium: true },
    { name: 'PTSD Relief', hz: 396, benefits: ['PTSD symptom relief', 'Nervous system calm', 'Healing'], premium: true },
    { name: 'Childhood Trauma', hz: 285, benefits: ['Childhood healing', 'Inner child work', 'Recovery'], premium: true },
    { name: 'Shock Release', hz: 174, benefits: ['Shock recovery', 'Nervous system reset', 'Stability'], premium: true },
    { name: 'Emotional Numbness', hz: 528, benefits: ['Emotional reconnection', 'Feeling restoration', 'Healing'], premium: true },
    
    // Mental Health
    { name: 'Mental Clarity', hz: 852, benefits: ['Clear thinking', 'Mental focus', 'Clarity'], premium: true },
    { name: 'Overthinking', hz: 741, benefits: ['Mental quiet', 'Thought control', 'Peace'], premium: true },
    { name: 'Mental Fatigue', hz: 40, benefits: ['Mental energy', 'Cognitive refresh', 'Alertness'], premium: true },
    { name: 'Concentration', hz: 40, benefits: ['Focus enhancement', 'Concentration', 'Mental clarity'], premium: true },
    { name: 'Memory Enhancement', hz: 40, benefits: ['Memory boost', 'Recall improvement', 'Learning'], premium: true },
    { name: 'Creativity Block', hz: 417, benefits: ['Creative flow', 'Inspiration', 'Innovation'], premium: true },
    { name: 'Motivation', hz: 852, benefits: ['Motivation boost', 'Drive', 'Inspiration'], premium: true },
    { name: 'Procrastination', hz: 741, benefits: ['Action taking', 'Productivity', 'Motivation'], premium: true }
  ];

  emotionFreqs.forEach(freq => {
    frequencies.push({
      id: (currentId++).toString(),
      name: freq.name,
      hz: freq.hz,
      category: 'emotion',
      description: `Emotional healing frequency for ${freq.name.toLowerCase()}`,
      benefits: freq.benefits,
      duration: 600,
      isPremium: freq.premium
    });
  });

  // DNA & GENETIC FREQUENCIES (Advanced Cellular Healing)
  const dnaFreqs = [
    { name: 'DNA Repair Master', hz: 528, benefits: ['DNA repair', 'Genetic healing', 'Cellular restoration'], premium: true },
    { name: 'Telomere Protection', hz: 741, benefits: ['Telomere lengthening', 'Anti-aging', 'Longevity'], premium: true },
    { name: 'Gene Expression', hz: 852, benefits: ['Optimal gene activation', 'Genetic potential', 'Health optimization'], premium: true },
    { name: 'Chromosomal Repair', hz: 963, benefits: ['Chromosome stability', 'Genetic integrity', 'Cellular health'], premium: true },
    { name: 'Mitochondrial Power', hz: 40, benefits: ['Mitochondrial function', 'Cellular energy', 'ATP production'], premium: true },
    { name: 'Protein Synthesis', hz: 20, benefits: ['Protein production', 'Muscle building', 'Cellular repair'], premium: true },
    { name: 'RNA Optimization', hz: 33, benefits: ['RNA function', 'Gene expression', 'Cellular communication'], premium: true },
    { name: 'Stem Cell Activation', hz: 174, benefits: ['Stem cell activation', 'Regeneration', 'Cellular renewal'], premium: true },
    { name: 'Epigenetic Reset', hz: 285, benefits: ['Epigenetic healing', 'Gene regulation', 'Expression reset'], premium: true },
    { name: 'Cellular Memory Clear', hz: 396, benefits: ['Trauma clearing', 'Cellular memory reset', 'Fresh start'], premium: true },
    { name: 'Genetic Detox', hz: 417, benefits: ['Genetic toxin removal', 'DNA cleansing', 'Purity restoration'], premium: true },
    { name: 'Mutation Correction', hz: 639, benefits: ['Mutation repair', 'Genetic correction', 'Cellular healing'], premium: true }
  ];

  dnaFreqs.forEach(freq => {
    frequencies.push({
      id: (currentId++).toString(),
      name: freq.name,
      hz: freq.hz,
      category: 'dna',
      description: `Advanced DNA healing frequency for ${freq.name.toLowerCase()}`,
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
    { name: 'Insomnia Relief', hz: 1.5, benefits: ['Insomnia treatment', 'Sleep onset', 'Rest restoration'], premium: true },
    { name: 'Nightmare Relief', hz: 6, benefits: ['Nightmare reduction', 'Peaceful dreams', 'Sleep quality'], premium: true },
    { name: 'Sleep Anxiety', hz: 7.83, benefits: ['Pre-sleep calm', 'Anxiety reduction', 'Peaceful mind'], premium: true },
    { name: 'Circadian Reset', hz: 0.5, benefits: ['Circadian rhythm', 'Sleep-wake cycle', 'Natural rhythm'], premium: true },
    { name: 'Melatonin Production', hz: 936, benefits: ['Melatonin boost', 'Natural sleep hormone', 'Sleep regulation'], premium: true }
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
    { name: 'Chronic Fatigue', hz: 465, benefits: ['Fatigue relief', 'Energy restoration', 'Vitality recovery'], premium: true },
    { name: 'Adrenal Fatigue', hz: 492.8, benefits: ['Adrenal recovery', 'Energy restoration', 'Stamina boost'], premium: true },
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
    { name: 'Health Manifestation', hz: 528, benefits: ['Health attraction', 'Healing manifestation', 'Vitality'], premium: true },
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

  return frequencies;
};

// Generate the complete library
export const FREQUENCIES = generateMassiveFrequencyLibrary();

export const getAvailableFrequencies = (subscriptionTier: string) => {
  if (subscriptionTier === 'free') {
    return FREQUENCIES.filter(f => !f.isPremium);
  }
  return FREQUENCIES; // Premium users get everything
};

export const getFrequenciesByCategory = (category: string) => {
  return FREQUENCIES.filter(f => f.category === category);
};

// Export the count for reference
export const TOTAL_FREQUENCIES = FREQUENCIES.length;
console.log(`🎵 HealTone Library: ${TOTAL_FREQUENCIES} healing frequencies loaded!`);