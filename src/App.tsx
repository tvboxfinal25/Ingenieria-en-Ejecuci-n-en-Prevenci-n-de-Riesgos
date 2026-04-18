import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  Menu, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Trophy, 
  BookOpen, 
  Play, 
  CheckCircle2,
  Brain,
  Eye,
  Shield,
  ClipboardCheck,
  Leaf,
  FileText,
  User as UserIcon,
  LogOut,
  Volume2,
  VolumeX
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';
import { askEthicalExpert, generateDynamicDilemma, type AIDilemma } from './services/geminiService';
import { cn } from './lib/utils';
import { MODULES, BADGES, type Module, type UserState, type Badge } from './types';

// --- UI Components ---

const GET_RANK = (points: number) => {
  if (points >= 4500) return "Director de Ética y Prevención";
  if (points >= 3000) return "Consultor de Integridad";
  if (points >= 1500) return "Ingeniero de Planta";
  if (points >= 500) return "Técnico en Prevención";
  return "Asistente en Práctica";
};

const GlassCard = ({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={cn("glass-card", className)}
  >
    {children}
  </motion.div>
);

const ProgressBar = ({ progress, label }: { progress: number, label?: string }) => (
  <div className="w-full space-y-2">
    {label && (
      <div className="flex justify-between text-sm font-medium">
        <span>{label}</span>
        <span>{Math.round(progress)}%</span>
      </div>
    )}
    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-[#00f2fe] to-[#4facfe]"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
  </div>
);

const Meter = ({ value, max, label, icon: Icon }: { value: number, max: number, label: string, icon: any }) => (
  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
    <div className="p-2 bg-primary/20 rounded-lg text-primary">
      <Icon size={20} />
    </div>
    <div className="flex-1 space-y-1">
      <div className="text-xs text-white/60 flex justify-between uppercase tracking-wider">
        <span>{label}</span>
        <span>{value} / {max}</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-secondary"
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  </div>
);

const BadgeIcon = ({ id }: { id: string }) => {
  const icons: Record<string, any> = {
    Eye: <Eye size={24} />,
    Shield: <Shield size={24} />,
    ClipboardCheck: <ClipboardCheck size={24} />,
    Leaf: <Leaf size={24} />,
    Award: <Award size={24} />
  };
  return icons[id] || <Award size={24} />;
};

const QuestionCard = ({ 
  question, 
  onAnswer, 
  title = "Verifica tu comprensión" 
}: { 
  question: any, 
  onAnswer: (correct: boolean) => void,
  title?: string
}) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSelect = (idx: number) => {
    if (showFeedback) return;
    setSelected(idx);
    setShowFeedback(true);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <span className="text-accent font-mono text-[10px] tracking-[0.4em] uppercase">{title}</span>
        <h3 className="text-2xl font-bold italic">{question.q}</h3>
      </div>
      <div className="space-y-3">
        {question.a.map((ans: string, i: number) => {
          const isCorrect = i === question.correct;
          const isSelected = i === selected;
          
          let cardStyle = "border-white/5";
          if (showFeedback) {
            if (isCorrect) cardStyle = "bg-secondary/20 border-secondary/50 text-secondary";
            else if (isSelected) cardStyle = "bg-red-500/20 border-red-500/50 text-red-500";
          }

          return (
            <button 
              key={i} 
              onClick={() => handleSelect(i)}
              className={cn(
                "w-full glass-button py-4 text-left justify-start transition-all",
                cardStyle,
                !showFeedback && "hover:bg-primary/10"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-md border flex items-center justify-center text-[10px]",
                showFeedback && isCorrect ? "bg-secondary border-secondary text-white" : "bg-white/5 border-white/20 text-white/40"
              )}>
                {String.fromCharCode(65 + i)}
              </div>
              <span className="flex-1">{ans}</span>
              {showFeedback && isCorrect && <CheckCircle2 size={16} className="text-secondary" />}
              {showFeedback && isSelected && !isCorrect && <X size={16} className="text-red-500" />}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {showFeedback && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 glass rounded-2xl bg-white/5 border-white/10 space-y-3"
          >
            <div className="flex items-center gap-2">
              <Brain size={18} className={selected === question.correct ? "text-secondary" : "text-accent"} />
              <p className="font-bold text-sm uppercase tracking-wider">Análisis Profesional</p>
            </div>
            <p className="text-white/60 text-sm leading-relaxed italic">{question.explanation}</p>
            <button 
              onClick={() => onAnswer(selected === question.correct)}
              className="w-full glass-button justify-center bg-primary/20 border-primary/50 text-xs py-2 mt-2"
            >
              Continuar <ChevronRight size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- App Shell ---

export default function App() {
  const [user, setUser] = useState<UserState>(() => {
    const saved = localStorage.getItem('ingenieria_prevencion_user');
    return saved ? JSON.parse(saved) : {
      name: '',
      points: 0,
      unlockedBadges: [],
      moduleProgress: {},
      completedModules: [],
      answers: {}
    };
  });

  useEffect(() => {
    localStorage.setItem('ingenieria_prevencion_user', JSON.stringify(user));
  }, [user]);

  const playSound = (type: 'success' | 'badge' | 'click') => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(audioContext.destination);

      const now = audioContext.currentTime;

      if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'badge') {
        osc.type = 'sine';
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const time = now + (i * 0.1);
          const oscN = audioContext.createOscillator();
          const gainN = audioContext.createGain();
          oscN.connect(gainN);
          gainN.connect(audioContext.destination);
          oscN.type = 'sine';
          oscN.frequency.setValueAtTime(freq, time);
          gainN.gain.setValueAtTime(0.08, time);
          gainN.gain.exponentialRampToValueAtTime(0.01, time + 0.6);
          oscN.start(time);
          oscN.stop(time + 0.6);
        });
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    } catch (e) {
      console.warn("Audio Context not supported or blocked");
    }
  };

  const [currentModuleIndex, setCurrentModuleIndex] = useState(-1); // -1 is Intro, -2 is Dashboard
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isExpertOpen, setIsExpertOpen] = useState(false);
  const [step, setStep] = useState(0);

  const addPoints = (amount: number) => {
    setUser(prev => ({
      ...prev,
      points: prev.points + amount
    }));
  };

  const currentModule = currentModuleIndex >= 0 ? MODULES[currentModuleIndex] : null;

  const handleNext = () => {
    if (!currentModule) {
      setCurrentModuleIndex(-2); // Go to Dashboard after intro
      return;
    }

    if (currentModule.type === 'theory') {
      if (step < currentModule.content.length - 1) {
        setStep(step + 1);
        updateProgress(currentModule.id, ((step + 2) / currentModule.content.length) * 100);
      } else {
        completeModule(currentModule.id);
        setStep(0);
        setCurrentModuleIndex(-2); // Return to dashboard after completing a theory module
      }
    } else if (currentModule.type === 'quiz') {
      completeModule(currentModule.id);
      setCurrentModuleIndex(MODULES.length); // Go to Final Report directly after quiz
    } else if (currentModule.type === 'activity') {
      completeModule(currentModule.id);
      setCurrentModuleIndex(-2); // Return to dashboard
    } else {
      setCurrentModuleIndex(-2);
    }
  };

  const updateProgress = (moduleId: string, progress: number) => {
    setUser(prev => ({
      ...prev,
      moduleProgress: { ...prev.moduleProgress, [moduleId]: Math.max(prev.moduleProgress[moduleId] || 0, progress) }
    }));
  };

  const completeModule = (moduleId: string) => {
    if (!user.completedModules.includes(moduleId)) {
      playSound('success');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#f59e0b']
      });

      const bonusPoints = currentModule?.type === 'activity' ? 500 : 200;
      
      setUser(prev => {
        const newBadges = [...prev.unlockedBadges];
        const badgeId = getBadgeForModule(moduleId);
        if (badgeId && !newBadges.includes(badgeId)) {
          newBadges.push(badgeId);
          playSound('badge');
        }

        return {
          ...prev,
          points: prev.points + bonusPoints,
          completedModules: [...prev.completedModules, moduleId],
          unlockedBadges: newBadges
        };
      });
    }
  };

  const getBadgeForModule = (moduleId: string) => {
    switch (moduleId) {
      case 'moral-blindness': return 'visionary';
      case 'industry-ethics': return 'guardian';
      case 'social-desirability': return 'honest';
      case 't3c-accounting': return 'biocentric';
      case 'ethical-dilemma': return 'ethicist';
      default: return null;
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // --- Styles & Palette ---
    const colors = {
      navy: [26, 42, 108],
      cyan: [0, 242, 254],
      green: [74, 222, 128],
      orange: [253, 187, 45],
      dark: [30, 41, 59],
      gray: [100, 116, 139],
      light: [248, 250, 252]
    };

    // Header Background
    doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Accent line
    doc.setFillColor(colors.cyan[0], colors.cyan[1], colors.cyan[2]);
    doc.rect(0, 45, pageWidth, 2, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('INFORME DE INTEGRIDAD PROFESIONAL', pageWidth / 2, 22, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('BITÁCORA ÉTICA - PROYECTO PLANTA VALLENAR', pageWidth / 2, 32, { align: 'center' });

    // --- Section: User Identity ---
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('IDENTIFICACIÓN DEL PROFESIONAL', 20, 65);
    
    doc.setDrawColor(colors.cyan[0], colors.cyan[1], colors.cyan[2]);
    doc.setLineWidth(0.5);
    doc.line(20, 68, 80, 68);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
    doc.text('Nombre del Ingeniero:', 20, 80);
    doc.text('Fecha de Auditoría:', 20, 88);
    doc.text('Rango Alcanzado:', 20, 96);

    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(user.name || 'Estudiante Invitado', 70, 80);
    doc.text(new Date().toLocaleDateString('es-CL'), 70, 88);
    doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
    doc.text(GET_RANK(user.points).toUpperCase(), 70, 96);

    // --- Section: Mastery Stats ---
    doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    doc.roundedRect(20, 108, 170, 30, 3, 3, 'F');
    
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(10);
    doc.text('PUNTAJE DE MAESTRÍA', 35, 120);
    doc.text('INSIGNIAS DE COMPETENCIA', 115, 120);

    doc.setFontSize(18);
    doc.setTextColor(colors.cyan[0], colors.cyan[1], colors.cyan[2]);
    doc.text(`${user.points} pts`, 35, 130);
    doc.setTextColor(colors.orange[0], colors.orange[1], colors.orange[2]);
    doc.text(`${user.unlockedBadges.length} / ${BADGES.length}`, 115, 130);

    // --- Section: Achievement List ---
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('GABINETE DE LOGROS ÉTICOS', 20, 155);
    doc.setDrawColor(colors.orange[0], colors.orange[1], colors.orange[2]);
    doc.line(20, 158, 80, 158);

    let badgeY = 170;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    if (user.unlockedBadges.length === 0) {
      doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
      doc.text('No se han registrado insignias en esta sesión.', 25, badgeY);
    } else {
      user.unlockedBadges.forEach((bId) => {
        const b = BADGES.find(badge => badge.id === bId);
        if (b) {
          doc.setFillColor(colors.green[0], colors.green[1], colors.green[2]);
          doc.circle(25, badgeY - 1, 1.5, 'F');
          
          doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
          doc.setFont('helvetica', 'bold');
          doc.text(b.name, 35, badgeY);
          
          doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
          doc.setFont('helvetica', 'normal');
          doc.text(`: ${b.description}`, 35 + doc.getTextWidth(b.name), badgeY);
          badgeY += 8;
        }
      });
    }

    // --- Section: Conclusion ---
    const conclusionY = pageHeight - 65;
    doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
    doc.rect(20, conclusionY, 170, 0.5, 'F');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
    doc.text('SENTENCIA ÉTICA PROFESIONAL', pageWidth / 2, conclusionY + 10, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    
    const conclusionText = user.points >= 3000 
      ? "Usted ha demostrado un juicio ético excepcional, anteponiendo la vida y la integridad humana sobre las metas productivas. Su liderazgo es fundamental para la Planta Vallenar."
      : "Se recomienda fortalecer la introspección ética y la virtud de la prudencia. Recuerde que el SER profesional precede al HACER corporativo en toda ingeniería de riesgo.";
    
    const splitText = doc.splitTextToSize(conclusionText, 150);
    doc.text(splitText, pageWidth / 2, conclusionY + 18, { align: 'center' });

    // Footer
    const footerY = pageHeight - 15;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('CREADO POR: ADRIANA SÁNCHEZ, DOCENTE DE ÉTICA PROFESIONAL, UNIVERSIDAD DE ATACAMA, SEDE VALLENAR, 2026', pageWidth / 2, footerY, { align: 'center' });

    doc.save(`BITACORA_ETICA_${user.name || 'ESTUDIANTE'}.pdf`);
  };

  const totalProgress = (user.completedModules.length / MODULES.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col min-h-screen">
      {/* Header with Global Progress */}
      <header className="fixed top-0 left-0 right-0 z-40 px-4 py-3 bg-slate-950/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg shadow-lg shadow-primary/20">
              <Shield className="text-white" size={24} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold uppercase tracking-tighter">Ingeniería en Ejecución en Prevención de Riesgos</h1>
              <p className="text-[10px] text-white/50 font-mono">UDA Vallenar</p>
            </div>
          </div>

          <div className="flex-1 max-w-xs">
            <ProgressBar progress={totalProgress} label="Progreso del Curso" />
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 glass rounded-full hover:bg-white/20 transition-all"
            >
              <Award className="text-accent" size={18} />
              <span className="font-bold text-sm tracking-widest">{user.points}</span>
            </button>
            <button className="sm:hidden p-2 glass rounded-lg">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 mt-12 flex flex-col items-center justify-center py-12">
        <AnimatePresence mode="wait">
          {currentModuleIndex === -1 ? (
            <IntroSection onStart={(name) => {
              setUser(p => ({ ...p, name }));
              setCurrentModuleIndex(-2);
            }} />
          ) : currentModuleIndex === -2 ? (
            <DashboardView 
              user={user} 
              onSelectModule={(idx) => {
                setCurrentModuleIndex(idx);
                setStep(0);
              }} 
            />
          ) : currentModuleIndex < MODULES.length ? (
            <ModuleView 
              module={currentModule!} 
              step={step} 
              onNext={handleNext} 
              onPrev={() => setStep(Math.max(0, step - 1))}
              onBack={() => setCurrentModuleIndex(-2)}
              isLast={currentModuleIndex === MODULES.length - 1}
              addPoints={addPoints}
            />
          ) : (
            <FinalReport 
              user={user} 
              onRestart={() => {
                setUser({
                  name: '',
                  points: 0,
                  unlockedBadges: [],
                  moduleProgress: {},
                  completedModules: [],
                  answers: {}
                });
                setCurrentModuleIndex(-1);
              }}
              onDownload={generatePDF}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-white/10 text-center space-y-2 opacity-60">
        <p className="text-[10px] uppercase tracking-[0.2em]">
          CREADO POR: ADRIANA SÁNCHEZ, DOCENTE DE ÉTICA PROFESIONAL, UNIVERSIDAD DE ATACAMA, SEDE VALLENAR, 2026.
        </p>
      </footer>

      {/* Profile Sidebar/Overlay */}
      <AnimatePresence>
        {isProfileOpen && (
          <ProfileOverlay 
            user={user} 
            onClose={() => setIsProfileOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* AI Expert Tutor Overlay */}
      <AnimatePresence>
        {isExpertOpen && (
          <ExpertTutorOverlay 
            onClose={() => setIsExpertOpen(false)} 
            currentContext={currentModule?.title}
          />
        )}
      </AnimatePresence>

      {/* Floating AI Action */}
      {currentModuleIndex !== -1 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsExpertOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-tr from-[#00f2fe] to-[#4facfe] rounded-full shadow-2xl flex items-center justify-center text-white z-50 hover:scale-110 transition-transform glow-border"
        >
          <Brain size={28} />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-slate-950" />
        </motion.button>
      )}
    </div>
  );
}

// --- Specific Views ---

function IntroSection({ onStart }: { onStart: (name: string) => void }) {
  const [name, setName] = useState('');
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="text-center space-y-8 max-w-lg"
    >
      <div className="relative inline-block">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="relative bg-white/5 border border-white/20 p-8 rounded-full"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-[#fdbb2d] to-[#b21f1f] rounded-full flex items-center justify-center text-white shadow-2xl">
            <Shield size={48} />
          </div>
        </motion.div>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-4xl font-black uppercase tracking-tighter leading-none italic">
          MISIÓN: <br/> <span className="text-primary italic">PLANTA VALLENAR</span>
        </h2>
        <p className="text-white/60 text-lg leading-relaxed">
          Has sido asignado como <strong>Asistente en Práctica</strong> para la inauguración de la nueva planta. Tus decisiones éticas determinarán si logras ascender o si la seguridad de los trabajadores se pone en riesgo.
        </p>
      </div>

      <div className="glass p-8 rounded-3xl space-y-4">
        <input 
          type="text" 
          placeholder="Ingresa tu nombre..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-white/5 border border-white/20 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 ring-primary/50 transition-all font-bold placeholder:text-white/20"
        />
        <button 
          onClick={() => onStart(name)}
          disabled={!name.trim()}
          className="w-full glass-button py-4 justify-center bg-primary/20 border-primary/50 text-xl font-black uppercase tracking-widest disabled:opacity-50"
        >
          Aceptar Misión <ChevronRight size={24} />
        </button>
      </div>
    </motion.div>
  );
}

function DashboardView({ user, onSelectModule }: { user: UserState, onSelectModule: (idx: number) => void }) {
  const categories = [
    { title: "Manual de Operación (Teoría)", type: "theory", icon: BookOpen, color: "text-primary" },
    { title: "Simulacros de Campo", type: "activity", icon: Play, color: "text-secondary" },
    { title: "Auditoría Final", type: "quiz", icon: Award, color: "text-accent" }
  ];

  const canAccessFinalQuiz = user.completedModules.length >= 3; // Reduced requirement to unlock quiz

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl space-y-12"
    >
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black uppercase tracking-tighter italic">Bitácora: <span className="text-primary">Planta Vallenar</span></h2>
        <p className="text-white/40 uppercase tracking-[0.2em] text-xs">Rango Actual: <span className="text-primary font-bold">{GET_RANK(user.points)}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {categories.map((cat, i) => (
          <div key={i} className="space-y-6">
            <div className="flex items-center gap-3 px-4">
              <cat.icon size={18} className={cat.color} />
              <h3 className="font-bold uppercase tracking-wider text-sm">{cat.title}</h3>
            </div>

            <div className="space-y-4">
              {MODULES.map((module, mIdx) => {
                const isTypeMatch = module.type === cat.type || (cat.type === 'activity' && module.id === 'ethical-dilemma');
                if (!isTypeMatch) return null;

                const isCompleted = user.completedModules.includes(module.id);
                const isLocked = module.type === 'quiz' && !canAccessFinalQuiz;

                return (
                  <motion.button
                    key={module.id}
                    whileHover={!isLocked ? { scale: 1.02, x: 5 } : {}}
                    whileTap={!isLocked ? { scale: 0.98 } : {}}
                    onClick={() => !isLocked && onSelectModule(mIdx)}
                    className={cn(
                      "w-full glass-card text-left relative overflow-hidden group border-l-4",
                      isCompleted ? "border-l-secondary" : isLocked ? "border-l-white/5 opacity-50 grayscale" : "border-l-primary"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-bold uppercase tracking-tight text-sm leading-tight">{module.title}</h4>
                        <p className="text-[10px] text-white/40 line-clamp-2 uppercase tracking-tighter leading-none">{module.description}</p>
                      </div>
                      {isCompleted ? (
                        <CheckCircle2 size={16} className="text-secondary shrink-0" />
                      ) : isLocked ? (
                        <Shield size={16} className="text-white/20 shrink-0" />
                      ) : (
                        <ChevronRight size={16} className="text-primary shrink-0 group-hover:translate-x-1 transition-transform" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ModuleView({ module, step, onNext, onPrev, onBack, isLast, addPoints }: { 
  module: Module, 
  step: number, 
  onNext: () => void, 
  onPrev: () => void,
  onBack: () => void,
  isLast: boolean,
  addPoints: (pts: number) => void
}) {
  const [isCheckpoint, setIsCheckpoint] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const text = module.content[step];
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-CL';
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleNextStep = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    if (module.type === 'theory' && !isCheckpoint && step === module.content.length - 1) {
      if (module.checkpoint) {
        setIsCheckpoint(true);
      } else {
        onNext();
      }
    } else {
      onNext();
    }
  };

  return (
    <motion.div
      key={module.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-2xl space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-primary">
            {module.type === 'theory' ? 'Módulo Teoría' : module.type === 'activity' ? 'Actividad Práctica' : 'Evaluación'}
          </span>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">{module.title}</h2>
          <div className="flex items-center gap-3">
            <p className="text-white font-medium italic">{module.description}</p>
            {module.type === 'theory' && !isCheckpoint && (
              <button 
                onClick={toggleSpeech}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  isSpeaking ? "bg-primary text-slate-950" : "glass hover:bg-white/10"
                )}
                title="Lectura en voz alta"
              >
                {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            )}
          </div>
        </div>
        <button onClick={onBack} className="glass p-3 rounded-xl hover:bg-white/10 transition-colors">
          <Menu size={20} />
        </button>
      </div>

      {module.type === 'theory' && (
        <GlassCard className="min-h-[350px] flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-3xl rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/10 blur-3xl rounded-full" />
          
          <AnimatePresence mode="wait">
            {!isCheckpoint ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative z-10 space-y-6"
              >
                <p className="text-xl md:text-2xl font-bold leading-relaxed text-white drop-shadow-sm">
                  {module.content[step]}
                </p>
                <div className="mt-12 flex items-center justify-between">
                  <div className="flex gap-2">
                    {module.content.map((_, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "h-1 rounded-full transition-all duration-500",
                          i <= step ? "w-8 bg-primary" : "w-4 bg-white/10"
                        )} 
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="checkpoint"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10"
              >
                <QuestionCard 
                  question={module.checkpoint} 
                  onAnswer={() => {
                    setIsCheckpoint(false);
                    onNext();
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      )}

      {module.type === 'activity' && <DilemmaActivity onComplete={onNext} />}
      {module.type === 'quiz' && <FinalQuiz onComplete={onNext} addPoints={addPoints} />}

      {module.type === 'theory' && !isCheckpoint && (
        <div className="flex gap-4">
          <button 
            onClick={onPrev}
            disabled={step === 0}
            className="glass-button w-full justify-center disabled:opacity-20"
          >
            <ChevronLeft size={20} /> Anterior
          </button>
          <button 
            onClick={handleNextStep}
            className="glass-button w-full justify-center bg-primary/20 border-primary/50 font-bold"
          >
            {step === module.content.length - 1 ? 'Verificar Aprendizaje' : 'Siguiente'} <ChevronRight size={20} />
          </button>
        </div>
      )}
    </motion.div>
  );
}

function DilemmaActivity({ onComplete }: { onComplete: () => void }) {
  const [aiDilemma, setAiDilemma] = useState<AIDilemma | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResolved, setIsResolved] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    loadDilemma();
  }, []);

  const loadDilemma = async () => {
    setIsLoading(true);
    const data = await generateDynamicDilemma();
    setAiDilemma(data);
    setIsLoading(false);
  };

  const steps = [
    "Identificar el hecho",
    "Identificar el problema ético",
    "Analizar los valores en juego",
    "Considerar las alternativas",
    "Evaluar consecuencias",
    "Tomar una decisión"
  ];
  const [currentStep, setCurrentStep] = useState(0);

  if (isLoading) {
    return (
      <GlassCard className="h-[400px] flex flex-col items-center justify-center space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Brain size={48} className="text-primary opacity-50" />
        </motion.div>
        <p className="text-white/40 animate-pulse text-sm uppercase tracking-widest">Generando Escenario por IA...</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="space-y-8">
      <div className="flex justify-between items-center overflow-x-auto pb-4 gap-4 no-scrollbar">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2 shrink-0">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
              i === currentStep ? "bg-primary border-primary text-white" : 
              i < currentStep ? "bg-secondary border-secondary text-white" : "border-white/10 text-white/30"
            )}>
              {i < currentStep ? <CheckCircle2 size={16} /> : i + 1}
            </div>
            <span className={cn(
              "text-[10px] uppercase font-bold tracking-widest hidden sm:block",
              i === currentStep ? "text-white" : "text-white/20"
            )}>{s}</span>
          </div>
        ))}
      </div>

      <div className="space-y-4 text-center py-6">
        {currentStep < 5 ? (
          <>
            <h3 className="text-2xl font-bold uppercase tracking-tighter">
              Paso {currentStep + 1}: {steps[currentStep]}
            </h3>
            <p className="text-white/60 italic leading-relaxed">
              {aiDilemma?.scenario}
            </p>
            <button 
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="glass-button bg-primary/10 border-primary/20 mt-4 mx-auto"
            >
              Analizar siguiente etapa <ChevronRight size={16} />
            </button>
          </>
        ) : !isResolved ? (
          <>
            <h4 className="text-xl font-bold text-accent uppercase tracking-widest">¿Qué decisión tomarás, colega?</h4>
            <div className="grid grid-cols-1 gap-4 mt-8">
              {aiDilemma?.options.map((opt, i) => (
                <button 
                  key={i}
                  onClick={() => {
                    setIsResolved(true);
                    setFeedback(opt.feedback);
                  }}
                  className="glass-button bg-white/5 border-white/10 py-6 text-left group"
                >
                  <div className="space-y-1">
                    <p className="font-bold underline group-hover:text-primary transition-colors">{opt.label}</p>
                    <p className="text-xs text-white/40 italic">{opt.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <div className="p-6 glass rounded-2xl bg-white/5 border-secondary/30">
              <p className="text-secondary font-black uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                <CheckCircle2 size={20} /> Análisis Final del Experto
              </p>
              <p className="text-white/80 italic leading-relaxed">{feedback}</p>
            </div>
            <button onClick={onComplete} className="glass-button w-full justify-center bg-secondary/20 border-secondary/50 uppercase font-black">
              Recibir Reconocimiento <ChevronRight />
            </button>
          </motion.div>
        )}
      </div>
    </GlassCard>
  );
}

function FinalQuiz({ onComplete, addPoints }: { onComplete: () => void, addPoints: (pts: number) => void }) {
  const [qIndex, setQIndex] = useState(0);
  const [assessmentPoints, setAssessmentPoints] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const scenario = {
    title: "El Dilema del Informe de Seguridad",
    context: "Un gerente de planta solicita omitir un riesgo ergonómico mayor en el informe anual de seguridad para evitar la cancelación de un lucrativo bono económico colectivo que beneficia a todas las familias de los trabajadores de la planta.",
  };

  const assessmentQuestions = [
    {
      id: 1,
      q: "1. Prioridad de Gestión",
      a: [
        "A. Priorizar lo urgente (el bono económico inmediato) sobre lo importante (la dignidad y salud biomecánica futura).",
        "B. Aplicar la percepción afectiva: comprender que el daño ergonómico es dolor humano real, no solo una estadística aceptable."
      ],
      points: [0, 2]
    },
    {
      id: 2,
      q: "2. Manejo de la Presión",
      a: [
        "A. Sufrir de ceguera ante los valores, impulsada por el interés personal colectivo.",
        "B. Ejercer la virtud de la Prudencia frente a la inmensa presión ejecutiva y social."
      ],
      points: [0, 2]
    },
    {
      id: 3,
      q: "3. Valoración del Trabajador",
      a: [
        "A. Tratar al trabajador afectado por el riesgo ergonómico como un simple \"medio\" para asegurar la recompensa.",
        "B. Mantener el orden estructural: preferir SER honesto antes que HACER lo corporativamente conveniente."
      ],
      points: [0, 2]
    },
    {
      id: 4,
      q: "4. Propósito del Liderazgo",
      a: [
        "A. Operar desde la capa externa del DECIR y HACER, traicionando el SER.",
        "B. Proteger el fin supremo de la empresa: la vida lograda."
      ],
      points: [0, 2]
    }
  ];

  const handleSelection = (optionIdx: number) => {
    const earned = assessmentQuestions[qIndex].points[optionIdx];
    setAssessmentPoints(prev => prev + earned);

    if (qIndex < assessmentQuestions.length - 1) {
      setQIndex(qIndex + 1);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    const isIntegrity = assessmentPoints >= 6;
    return (
      <GlassCard className="space-y-8 p-10 text-center animate-in fade-in zoom-in duration-500">
        <div className="space-y-4">
          <div className="mx-auto w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center text-accent">
            <Award size={40} />
          </div>
          <h3 className="text-3xl font-black uppercase tracking-tighter italic">Resultado: {assessmentPoints} Pts</h3>
        </div>

        <div className="p-6 glass rounded-3xl bg-white/5 border-primary/20">
          {isIntegrity ? (
            <div className="space-y-4">
              <h4 className="text-secondary font-bold uppercase tracking-widest text-xl">Ingeniero Íntegro y Fiel</h4>
              <p className="text-white/80 leading-relaxed italic">
                Usted es un ingeniero en prevención Íntegro y Fiel a sus valores. Su postura aligera la «pesadumbre de vivir» a largo plazo y evita la autodestrucción moral del profesional.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="text-accent font-bold uppercase tracking-widest text-xl">Ética de la Obediencia</h4>
              <p className="text-white/80 leading-relaxed italic">
                Usted mantiene una ética en tercera persona de la Obediencia y la conveniencia utilitarista. Esta postura prioriza el beneficio inmediato y el cumplimiento externo sobre la integridad del SER.
              </p>
            </div>
          )}
        </div>

        <button 
          onClick={() => {
            addPoints(assessmentPoints * 100); // Scale points for global score
            onComplete();
          }}
          className="w-full glass-button py-6 justify-center bg-primary text-slate-950 font-black uppercase tracking-widest text-xl shadow-lg shadow-primary/20"
        >
          Finalizar Auditoría <ChevronRight />
        </button>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="space-y-4 text-center">
        <h2 className="text-3xl font-black uppercase tracking-tighter italic text-accent">{scenario.title}</h2>
        <div className="glass p-6 rounded-3xl border-primary/20 bg-primary/5 space-y-3">
          <p className="text-white/70 text-sm leading-relaxed italic font-medium">"{scenario.context}"</p>
          <div className="pt-3 border-t border-white/5">
            <p className="text-[10px] text-primary/80 uppercase tracking-widest font-black">Instrucciones</p>
            <p className="text-xs text-white/50 italic">Para cada una de las siguientes cuatro situaciones, elija la postura (A o B) que mejor represente su decisión o visión profesional.</p>
          </div>
        </div>
      </div>

      <GlassCard className="space-y-8 border-white/10">
        <div className="space-y-2 text-center">
          <span className="text-[10px] uppercase font-mono tracking-[0.5em] text-white/40">Fase de Evaluación Professional</span>
          <h3 className="text-2xl font-bold italic">{assessmentQuestions[qIndex].q}</h3>
          <p className="text-[10px] text-white/30 italic">Elija la postura que mejor represente su decisión o visión profesional.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {assessmentQuestions[qIndex].a.map((ans, i) => (
            <button 
              key={i}
              onClick={() => handleSelection(i)}
              className="glass-button p-6 text-left group hover:bg-primary/10 border-white/10 hover:border-primary/30 transition-all h-auto block"
            >
              <p className="text-lg font-medium leading-normal group-hover:text-primary transition-colors italic">{ans}</p>
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-2">
          {assessmentQuestions.map((_, i) => (
            <div 
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i === qIndex ? "w-12 bg-primary" : i < qIndex ? "w-4 bg-secondary" : "w-4 bg-white/10"
              )}
            />
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function FinalReport({ user, onRestart, onDownload }: { user: UserState, onRestart: () => void, onDownload: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl w-full text-center space-y-8"
    >
      <div className="space-y-2">
        <Trophy className="mx-auto text-accent mb-4 animate-float" size={80} />
        <h2 className="text-5xl font-black uppercase tracking-tighter italic">¡Ascenso <br/> <span className="text-primary italic">Confirmado!</span></h2>
        <p className="text-white/60">Has alcanzado el rango de <strong>{GET_RANK(user.points)}</strong> en el Proyecto Planta Vallenar.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-4 space-y-1">
          <p className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Puntaje Final</p>
          <p className="text-3xl font-black text-primary italic">{user.points}</p>
        </GlassCard>
        <GlassCard className="p-4 space-y-1">
          <p className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Insignias</p>
          <p className="text-3xl font-black text-accent italic">{user.unlockedBadges.length}</p>
        </GlassCard>
      </div>

      <div className="space-y-4 pt-8">
        <button 
          onClick={onDownload}
          className="w-full glass-button py-4 justify-center bg-secondary/20 border-secondary/50 text-xl font-bold"
        >
          <FileText size={20} /> Generar Informe PDF
        </button>
        <button 
          onClick={onRestart}
          className="w-full glass-button py-4 justify-center opacity-60 hover:opacity-100"
        >
          <LogOut size={20} /> Salir y Reiniciar
        </button>
      </div>
    </motion.div>
  );
}

function ProfileOverlay({ user, onClose }: { user: UserState, onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[40px] p-8 space-y-8 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -z-10" />
        
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-white glow-border bg-gradient-to-br from-[#fdbb2d] to-[#b21f1f]">
              <UserIcon size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic">{user.name || 'Estudiante'}</h3>
              <p className="text-xs text-white/40 font-mono tracking-widest uppercase">{GET_RANK(user.points)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 glass rounded-full hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <Meter value={user.points} max={5000} label="Rango de Maestría" icon={Trophy} />
          <Meter value={user.unlockedBadges.length} max={BADGES.length} label="Logros Obtenidos" icon={Award} />
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-white/40">Gabinete de Insignias</h4>
          <div className="grid grid-cols-4 gap-3">
            {BADGES.map(badge => {
              const isUnlocked = user.unlockedBadges.includes(badge.id);
              return (
                <div 
                  key={badge.id}
                  className={cn(
                    "aspect-square rounded-2xl flex items-center justify-center transition-all group relative",
                    isUnlocked ? "glass bg-white/10 text-accent glow-border" : "bg-white/2"
                  )}
                >
                  <BadgeIcon id={badge.icon} />
                  {!isUnlocked && <div className="absolute inset-0 bg-slate-950/40 rounded-2xl flex items-center justify-center"><X size={12} className="text-white/20" /></div>}
                  
                  {/* Tooltip simple */}
                  <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-32 bg-slate-950 border border-white/10 p-2 rounded-lg text-[8px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                    <p className="font-bold uppercase tracking-widest text-white/90 mb-1">{badge.name}</p>
                    <p className="text-white/40 leading-tight">{badge.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ExpertTutorOverlay({ onClose, currentContext }: { onClose: () => void, currentContext?: string }) {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const handleConsult = async () => {
    if (!query.trim()) return;
    setIsThinking(true);
    setResponse("");
    const result = await askEthicalExpert(query, currentContext);
    setResponse(result || "");
    setIsThinking(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, x: 100 }}
        animate={{ scale: 1, opacity: 1, x: 0 }}
        exit={{ scale: 0.9, opacity: 0, x: 100 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[40px] p-8 space-y-6 overflow-hidden relative shadow-2xl"
      >
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full" />
        
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary glow-border">
              <Brain size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter italic">Consultar al Experto</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Tutor IA Senior (20 años exp.)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 glass rounded-full hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 relative z-10">
          <p className="text-xs text-white/60 italic leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5">
            "Colega, la ética no es blanco o negro, es el gris que protege vidas. ¿En qué dilema puedo asesorarte hoy?"
          </p>
          
          <div className="max-h-[300px] overflow-y-auto space-y-4 no-scrollbar">
            {isThinking && (
              <div className="flex items-center gap-2 text-primary">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <Brain size={16} />
                </motion.div>
                <span className="text-[10px] uppercase font-bold tracking-widest animate-pulse">Analizando impacto ético...</span>
              </div>
            )}
            {response && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="text-sm border-l-2 border-primary pl-4 py-2 text-white/90 leading-relaxed italic"
              >
                {response}
              </motion.div>
            )}
          </div>

          <div className="flex gap-2">
            <textarea 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej: ¿Qué hago si mi jefe ignora una falla leve?"
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:ring-1 ring-primary transition-all resize-none h-24 font-medium"
            />
          </div>
          <button 
            onClick={handleConsult}
            disabled={isThinking || !query.trim()}
            className="w-full glass-button py-4 justify-center bg-primary/20 border-primary/50 uppercase font-black tracking-widest disabled:opacity-50"
          >
            Obtener Asesoría <ChevronRight size={18} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
