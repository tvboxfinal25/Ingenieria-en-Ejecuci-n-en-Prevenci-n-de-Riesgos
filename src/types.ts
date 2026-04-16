export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  points: number;
}

export interface Question {
  id: string;
  q: string;
  a: string[];
  correct: number;
  explanation: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  content: string[];
  type: 'theory' | 'activity' | 'quiz';
  progress: number;
  checkpoint?: Question;
}

export interface UserState {
  name: string;
  points: number;
  unlockedBadges: string[];
  moduleProgress: Record<string, number>;
  completedModules: string[];
  answers: Record<string, any>;
}

export const MODULES: Module[] = [
  {
    id: 'moral-blindness',
    title: 'Ceguera Moral',
    description: 'La incapacidad de ver el aspecto ético de una decisión.',
    type: 'theory',
    progress: 0,
    content: [
      'La ceguera moral ocurre cuando no reconocemos que una decisión tiene implicaciones éticas.',
      'A menudo somos víctimas de rutinas o presiones externas que nos hacen ignorar las consecuencias morales.',
      'En prevención de riesgos, esto puede llevar a ignorar peligros críticos por "deseabilidad social" o metas de producción.'
    ],
    checkpoint: {
      id: 'cp1',
      q: "¿Cuál es la causa principal de la ceguera moral según lo visto?",
      a: ["Falta de leyes", "Rutinas y presiones externas", "Mala intención"],
      correct: 1,
      explanation: "La ceguera moral usualmente no es maldad, sino una desconexión causada por la rutina o la presión por cumplir metas, lo que nos impide ver el daño potencial."
    }
  },
  {
    id: 'industry-ethics',
    title: 'Ética en Industria 4.0/5.0',
    description: 'Nuevos desafíos éticos en la era de la automatización.',
    type: 'theory',
    progress: 0,
    content: [
      'La Industria 5.0 pone al humano en el centro (antropocentrismo).',
      'Debemos asegurar que la IA y la robótica no comprometan la seguridad ni la dignidad del trabajador.',
      'La integridad profesional implica auditar algoritmos de seguridad.'
    ],
    checkpoint: {
      id: 'cp2',
      q: "¿Cuál es el enfoque central de la Industria 5.0?",
      a: ["Eficiencia de máquinas", "Antropocentrismo (Humano al centro)", "Reducción de costos total"],
      correct: 1,
      explanation: "A diferencia de la 4.0 enfocada en eficiencia digital, la 5.0 busca que la tecnología colabore con el humano, priorizando su bienestar."
    }
  },
  {
    id: 'social-desirability',
    title: 'Sesgo de Deseabilidad Social',
    description: 'El impacto de querer "verse bien" en las investigaciones.',
    type: 'theory',
    progress: 0,
    content: [
      'Los trabajadores tienden a dar respuestas que se ajustan a las normas sociales.',
      'Esto puede distorsionar los datos de accidentes o cuasi-accidentes.',
      'Estrategias de mitigación: Garantizar anonimato y formular preguntas neutras.'
    ],
    checkpoint: {
      id: 'cp3',
      q: "¿Cómo afecta la deseabilidad social a la prevención?",
      a: ["Mejora el clima laboral", "Distorsiona los datos de seguridad", "Aumenta la productividad"],
      correct: 1,
      explanation: "Si los trabajadores ocultan la verdad para no verse mal, los prevencionistas trabajarán con datos falsos, impidiendo prevenir accidentes reales."
    }
  },
  {
    id: 't3c-accounting',
    title: 'Contabilidad Tridimensional (T3C)',
    description: 'Sustentabilidad ambiental, social y económica.',
    type: 'theory',
    progress: 0,
    content: [
      'Valora la riqueza ambiental y social sobre el lucro financiero.',
      'Propone unidades de medida no monetarias para proteger la vida.',
      'Es fundamental para una prevención de riesgos con visión biocéntrica.'
    ],
    checkpoint: {
      id: 'cp4',
      q: "¿Qué prioriza la T3C en su modelo?",
      a: ["Balances financieros", "Protección de la vida y el ambiente", "Marketing social"],
      correct: 1,
      explanation: "La T3C entiende que no todo se puede medir en dinero; la vida y el entorno tienen un valor intrínseco mayor que cualquier utilidad contable."
    }
  },
  {
    id: 'ethical-dilemma',
    title: 'Resolución de Dilemas',
    description: 'Actividad práctica con el modelo de seis pasos.',
    type: 'activity',
    progress: 0,
    content: []
  },
  {
    id: 'final-quiz',
    title: 'Evaluación de Maestría',
    description: 'Demuestra tu escepticismo profesional y juicio ético.',
    type: 'quiz',
    progress: 0,
    content: []
  }
];

export const BADGES: Badge[] = [
  { id: 'visionary', name: 'Visionario Moral', description: 'Identificaste la ceguera moral en el trabajo.', icon: 'Eye', unlocked: false },
  { id: 'guardian', name: 'Guardián 5.0', description: 'Dominaste los principios de ética en la tecnología.', icon: 'Shield', unlocked: false },
  { id: 'honest', name: 'Investigador Íntegro', description: 'Mitigaste el sesgo de deseabilidad social.', icon: 'ClipboardCheck', unlocked: false },
  { id: 'biocentric', name: 'Líder Biocéntrico', description: 'Aplicaste los principios de T3C.', icon: 'Leaf', unlocked: false },
  { id: 'ethicist', name: 'Maestro Ético', description: 'Resolviste el gran dilema profesional.', icon: 'Award', unlocked: false }
];
