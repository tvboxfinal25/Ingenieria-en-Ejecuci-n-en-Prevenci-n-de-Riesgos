export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  isSecret?: boolean;
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

export interface DilemmaHistory {
  moduleId: string;
  moduleTitle: string;
  scenario: string;
  decision: string;
  isEthical: boolean;
  feedback: string;
}

export interface UserState {
  name: string;
  avatar: string;
  points: number;
  unlockedBadges: string[];
  moduleProgress: Record<string, number>;
  completedModules: string[];
  answers: Record<string, any>;
  dilemmaHistory: DilemmaHistory[];
  hasFailedAnyCheckpoint?: boolean;
  aiConsultCount?: number;
  accessibilitySettings?: {
    highContrast: boolean;
    screenReader: boolean;
    fontSize: 'normal' | 'large' | 'extra-large';
  };
}

export const MODULES: Module[] = [
  {
    id: 'moral-blindness',
    title: 'Ceguera Moral',
    description: 'La incapacidad de ver el aspecto ético de una decisión.',
    type: 'theory',
    progress: 0,
    content: [
      'Definición: La ceguera moral ocurre cuando somos incapaces de advertir que una decisión o acción tiene dimensiones éticas, tratándola simplemente como una decisión rutinaria, técnica o de negocios.',
      'Marco Teórico: Autores como Bazerman y Tenbrunsel señalan que las inercias corporativas, los incentivos mal diseñados y la sobrecarga de información "desvanecen" la ética del campo visual del profesional.',
      'Caso Real: El desastre del Challenger. Ingenieros bajo extrema presión cambiaron su mentalidad de "ingeniería y seguridad" a una de "gestión y cronogramas", ignorando el riesgo catastrófico de las juntas tóricas.',
      'Consecuencias en Prevención: En nuestro campo, esto se traduce en normalizar la desviación. Empezamos a aceptar condiciones subestándar justificándonos en la urgencia productiva ("solo será por esta vez").',
      'Cierre Conceptual: La ceguera moral no es un acto de maldad intencional, sino una vulnerabilidad del sistema humano. Requiere ejercer un escepticismo profesional activo y una atención moral constante en terreno.'
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
      'Definición: La ética en la Industria 5.0 busca regular el impacto de la automatización avanzada y la IA, garantizando que el progreso sirva al bienestar humano y no exclusivamente a la rentabilidad.',
      'Marco Teórico: A diferencia de la Industria 4.0, enfocada ciegamente en la extrema digitalización, la Industria 5.0 propone la innovación antropocéntrica, donde la tecnología asiste al ser humano sin vulnerar su dignidad.',
      'Ejemplo Real: En líneas de ensamblaje con "cobots" (robots colaborativos) sin límites regulatorios, los humanos sufren estrés crónico y lesiones músculo-esqueléticas al verse forzados a igualar la velocidad de la máquina.',
      'Consecuencias en Prevención: Pasamos de auditar riesgos netamente físicos a gestionar riesgos algorítmicos. El prevencionista debe intervenir en el diseño de los sistemas para evitar la esclavitud digital.',
      'Cierre Conceptual: La tecnología nunca debe ser el fin, sino la herramienta. El deber ético contemporáneo es rediseñar los procesos productivos para que la máquina se adapte al humano, y no viceversa.'
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
      'Definición: El Sesgo de Deseabilidad Social es la tendencia a responder preguntas o reportar comportamientos de una manera que será vista favorablemente por los demás, ocultando errores por miedo al rechazo.',
      'Marco Teórico: La psicología organizacional demuestra que las entrevistas y auto-reportes bajo culturas corporativas punitivas o de "cero accidentes" están fuertemente condicionados por este sesgo defensivo.',
      'Situación Típica: En investigaciones de cuasi-accidentes, los trabajadores afirman que "siempre usan sus EPP correctamente", ocultando fallas logísticas de la empresa por miedo a enfrentar sanciones administrativas.',
      'Consecuencias en Prevención: Es el destructor principal de una "Cultura Justa". Si aceptamos reportes complacientes, la matriz de riesgo se vuelve una ficción y la organización queda expuesta a accidentes fatales ocultos.',
      'Cierre Conceptual: Para mitigar este sesgo, el prevencionista debe dejar el escritorio, estructurar sistemas de reporte confidenciales, y construir una verdadera relación de confianza radical con las bases operativas.'
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
      'Definición: La Contabilidad Tridimensional (T3C) es un modelo que supera la contabilidad financiera clásica, evaluando la riqueza global mediante tres dimensiones interdependientes: Económica, Socio-Cultural y Ambiental.',
      'Marco Teórico: Plantea que una empresa con números verdes en lo financiero puede estar "en quiebra biocéntrica" si destruye sus recursos naturales o desgasta a su capital humano. Propone unidades de medida cualitativas no monetarias.',
      'Ejemplo Clásico: Extracción minera a cielo abierto que genera utilidades récord en el trimestre, pero contamina los acuíferos locales y genera pasivos ambientales que las futuras generaciones pagarán con su salud.',
      'Consecuencias en Prevención: Otorga al prevencionista un marco argumentativo superior. La inversión en seguridad ya no es "un gasto que reduce la ganancia", sino la protección directa del componente social de la riqueza organizacional.',
      'Cierre Conceptual: La T3C nos recuerda que la vida no se puede calcular en dólares. Incorporarla en la ingeniería de prevención nos reconecta con una misión más profunda: defender la supervivencia holística del ecosistema y el trabajador.'
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
    id: 'simulacro-blindness',
    title: 'Simulacro: Ceguera Moral',
    description: 'Enfrenta la ceguera moral en una decisión sobre presiones de producción vs seguridad inmediata.',
    type: 'activity',
    progress: 0,
    content: []
  },
  {
    id: 'simulacro-industry',
    title: 'Simulacro: Industria 5.0',
    description: 'Dilema ético sobre la implementación de nuevos robots y su impacto en la ergonomía y dignidad laboral.',
    type: 'activity',
    progress: 0,
    content: []
  },
  {
    id: 'simulacro-desirability',
    title: 'Simulacro: Deseabilidad Social',
    description: 'Un accidente grave acaba de ocurrir y los testigos temen represalias. Modela la entrevista éticamente.',
    type: 'activity',
    progress: 0,
    content: []
  },
  {
    id: 'simulacro-t3c',
    title: 'Simulacro: Contabilidad T3C',
    description: 'Defiende un presupuesto crítico para neutralizar pasivos ambientales, contra un recorte del directorio financiero.',
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
  { id: 'ethicist', name: 'Maestro Ético', description: 'Resolviste el gran dilema profesional.', icon: 'Award', unlocked: false },
  // Secret Badges
  { id: 'whistleblower', name: 'Denunciante Ético', description: 'Elegiste la verdad sobre la comodidad corporativa en un caso crítico.', icon: 'AlertTriangle', unlocked: false, isSecret: true },
  { id: 'academic', name: 'Consultor Académico', description: 'Buscaste asesoría experta en repetidas ocasiones.', icon: 'GraduationCap', unlocked: false, isSecret: true },
  { id: 'flawless', name: 'Perfeccionista Preventivo', description: 'Completaste todos los controles de aprendizaje sin fallar ni una vez.', icon: 'Gem', unlocked: false, isSecret: true }
];
