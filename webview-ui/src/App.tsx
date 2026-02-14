import { useEffect, useState, useRef } from 'react';
import './App.css';

// Declare the global variable we just created in the backend
declare global {
  interface Window {
    spriteRoot: string;
  }
}

function App() {
  // 1. Get the base path (or fallback to empty if missing)
  const base = window.spriteRoot || '';

  // 2. DYNAMIC MAPPING: Combine Base Path + Filename
  const getAnimationPath = (filename: string) => `${base}/${filename}`;

  const ANIMATIONS = {
    idle: getAnimationPath('idle.gif'),
    typing: getAnimationPath('run.gif'),
    save: getAnimationPath('jump.gif'),
    error: getAnimationPath('hurt.gif'),
    git: getAnimationPath('attack.gif'),
    copilot: getAnimationPath('cast.gif'),
  };

  const [currentAction, setCurrentAction] = useState<keyof typeof ANIMATIONS>('idle');
  const [debugMsg, setDebugMsg] = useState("Pixel Pal Online 🟢");
  const [xp, setXp] = useState(0);
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerAction = (action: keyof typeof ANIMATIONS, duration = 2000, msg: string) => {
    if (currentAction === action && action !== 'typing') return;

    setCurrentAction(action);
    setDebugMsg(msg);
    if (action !== 'idle') setXp(prev => prev + 15);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (action !== 'typing') {
      timerRef.current = setTimeout(() => {
        setCurrentAction('idle');
        setDebugMsg("Awaiting Command...");
      }, duration);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data;
      if (msg.type === 'status') {
        switch (msg.value) {
          case 'typing':
            if (currentAction !== 'typing') {
              setCurrentAction('typing');
              setDebugMsg("Writing Code...");
            }
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
              setCurrentAction('idle');
              setDebugMsg("Ready.");
            }, 800);
            break;

          case 'save': triggerAction('save', 1500, "File Saved! 💾"); break;
          case 'error': triggerAction('error', 3000, "Bug Detected! 🐛"); break;
          case 'git-push': triggerAction('git', 4000, "Code Pushed! 🚀"); break;
          case 'copilot': triggerAction('copilot', 3000, "AI Spell Cast! 🧙‍♂️"); break;
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentAction]);

  return (
    <main style={{ 
      height: '100vh', width: '100vw', 
      display: 'flex', flexDirection: 'column', 
      justifyContent: 'center', alignItems: 'center',
      background: 'radial-gradient(circle at center, #2a2d3e 0%, #1e1e1e 100%)',
      color: 'white',
      fontFamily: '"Courier New", Courier, monospace',
      overflow: 'hidden'
    }}>
      
      {/* HUD */}
      <div style={{ 
        position: 'absolute', top: 20, 
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '5px', width: '90%'
      }}>
        <div style={{ 
          background: 'rgba(0,0,0,0.5)', 
          padding: '8px 15px', borderRadius: '8px',
          border: '2px solid #4caf50',
          boxShadow: '0 0 10px rgba(76, 175, 80, 0.4)',
          width: '100%', textAlign: 'center'
        }}>
          <span style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '14px' }}>LVL 1</span>
          <span style={{ marginLeft: '10px', fontSize: '14px' }}>XP: {xp}</span>
        </div>
        <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '5px', textTransform: 'uppercase' }}>
          {debugMsg}
        </div>
      </div>

      {/* THE PET */}
      <div style={{
        position: 'relative', width: '280px', height: '280px',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.6))'
      }}>
        <img 
          src={ANIMATIONS[currentAction]} 
          alt="Pixel Pal"
          style={{ width: '100%', imageRendering: 'pixelated' }} 
        />
      </div>
    </main>
  );
}

export default App;