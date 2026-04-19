export interface AIDilemma {
  id: string;
  title: string;
  scenario: string;
  options: {
    label: string;
    description: string;
    isEthical: boolean;
    feedback: string;
  }[];
}

export async function askEthicalExpert(question: string, context?: string) {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return `(Modo Offline Activo) Colega, actualmente no tengo conexión a la red de la DGM para analizar casos nuevos. Mi consejo base es: "Ante la duda, prioriza siempre la integridad física y aplica el procedimiento estándar de detención de tareas (Stop Work Authority)."`;
  }

  try {
    const res = await fetch('/api/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, context })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Gemini Backend Error:", errorData);
      return `Error del backend: ${errorData.details || res.statusText}. Por favor avisa a soporte o revisa la configuración de Vercel.`;
    }

    const data = await res.json();
    return data.text;
  } catch (error: any) {
    console.error("Connection Error:", error);
    return "Lo siento, colega. En este momento tengo problemas de conexión con la central o falta configurar la API KEY. Intenta consultarme en unos minutos.";
  }
}

export async function generateDynamicDilemma(topic?: string): Promise<AIDilemma> {
  // If explicitly offline, don't even wait for fetch timeout
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return getOfflineDilemmaFallback(topic);
  }

  try {
    const res = await fetch('/api/dilemma', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic })
    });

    if (!res.ok) {
      throw new Error(`Backend error: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Gemini Dilemma Fetch Error:", error);
    return getOfflineDilemmaFallback(topic);
  }
}

function getOfflineDilemmaFallback(topic?: string): AIDilemma {
  // Offline / Fallback Theme mapping
  const lowerTopic = (topic || '').toLowerCase();
  
  if (lowerTopic.includes('ceguera') || lowerTopic.includes('liderazgo')) {
    return {
      id: "offline-blindness",
      title: "Silencio Operativo",
      scenario: "(Modo Offline) Durante una visita de rutina, notas que un trabajador experimenta 'ceguera atencional', omitiendo usar su arnés porque 'nunca pasa nada'. El supervisor de área lo está tolerando para no retrasar la obra.",
      options: [
        { label: "Detener la Tarea de Forma Inmediata", description: "Intervenir al trabajador y al supervisor, recordando que el arnés es obligatorio sin excepciones.", isEthical: true, feedback: "Excelente. Has roto la complacencia. El liderazgo preventivo interviene antes de que ocurra el incidente." },
        { label: "Documentar y Elevar al Final del Día", description: "Tomar fotos y adjuntarlas en el informe semanal para no interrumpir el flujo actual.", isEthical: false, feedback: "Fallo preventivo crítico. Tu deber es proteger la vida hoy, no reportarla mañana." }
      ]
    };
  }

  if (lowerTopic.includes('ingeniería')) {
    return {
      id: "offline-engineering",
      title: "Presión de Inauguración",
      scenario: "(Modo Offline) Estás revisando los planos as-built vs los entregados. Falta una válvula de alivio de presión en la Fase 2, pero instalarla ahora retrasará el hito de corte de cinta.",
      options: [
        { label: "Notificar la Omisión", description: "Detener la puesta en marcha de esa línea y exigir el rediseño inmediato.", isEthical: true, feedback: "Correcto. El principio T3C (Técnico, Científico, Consecuente) exige actuar con verdad técnica." },
        { label: "Autorizar Operación Parcial", description: "Firmar la aprobación para no perder el bono por hito, dejando el arreglo para el próximo mantenimiento.", isEthical: false, feedback: "Inaceptable. La ingeniería preventiva protege activos humanos y materiales, no hitos financieros." }
      ]
    };
  }

  if (lowerTopic.includes('deseabilidad')) {
    return {
      id: "offline-desirability",
      title: "Falta de EPP en Alta Esfera",
      scenario: "(Modo Offline) El Gerente General bajará a terreno sin zapatos de seguridad. Todos los prevencionistas anteriores han ignorado esto porque él es el dueño.",
      options: [
        { label: "Aplicar el Reglamento", description: "Acercarte respetuosamente y entregarle los EPP correspondientes antes de entrar a planta.", isEthical: true, feedback: "Excelente. La deseabilidad social no debe obnubilar las normas, las cuales aplican a todos los niveles." },
        { label: "Hacer la Vista Gorda", description: "Evitar el conflicto asumiendo que al Gerente 'nada le va a pasar'.", isEthical: false, feedback: "Peligroso. Has sucumbido a la deseabilidad social, desautorizando a tu equipo completo." }
      ]
    };
  }
  
  if (lowerTopic.includes('t3c')) {
    return {
      id: "offline-t3c",
      title: "Integridad de Datos",
      scenario: "(Modo Offline) Estás auditando tasas de accidentes y notas que accidentes con tiempo perdido se tipificaron como 'primeros auxilios' para mejorar los KPIs de cierre de mes.",
      options: [
        { label: "Corregir el Registro Oficial", description: "Actualizar la verdad estadística asumiendo las multas correspondientes.", isEthical: true, feedback: "Espectacular. Ser Biocéntrico, Técnico y Consecuente implica honrar la realidad, para de verdad prevenir a futuro." },
        { label: "Mantener el Doble Libro", description: "Pasarlo por alto para proteger los bonos del equipo de este mes.", isEthical: false, feedback: "Falta grave. Mentir en estadísticas impide la mejora continua y pervierte por completo la profesión." }
      ]
    };
  }

  // Generic fallback if no specific topic match
  return {
    id: "offline-general",
    title: "Dilema de Campo",
    scenario: "(Modo Offline) Se te presenta una acción con un pequeño desvío al procedimiento seguro, permitiendo ahorrar horas de trabajo.",
    options: [
      { label: "Apegarnos al Procedimiento", description: "Hacerlo de la forma que demorará más pero asegura la mitigación de riesgos.", isEthical: true, feedback: "Bien. Los procedimientos existen porque los desvíos menores históricamente terminaron en fatalidades." },
      { label: "Aprobar el Desvío Controlado", description: "Autorizar este atajo por única vez ya que estás ahí mirando.", isEthical: false, feedback: "Mala decisión, acabas de normalizar el desvío, enseñando que la seguridad es solo 'si sobra tiempo'." }
    ]
  };
}
