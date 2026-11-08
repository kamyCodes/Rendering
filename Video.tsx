import React, {PropsWithChildren} from 'react';
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {ThreeCanvas} from '@remotion/three';

// ---------- Edit these ----------
const FONT = '"Segoe UI", Inter, system-ui, -apple-system, sans-serif';
const C = {
  bg: '#070a14',
  cyan: '#22d3ee',
  indigo: '#6366f1',
  amber: '#fbbf24',
  red: '#f43f5e',
  green: '#34d399',
  text: '#f8fafc',
  muted: '#94a3b8',
};

// ---------- Timing (30 fps) ----------
const D = {intro: 90, f1: 180, f2: 180, f3: 180, f4: 150, outro: 120};
export const TOTAL_FRAMES = D.intro + D.f1 + D.f2 + D.f3 + D.f4 + D.outro; // 900 = 30s

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------- Shared pieces ----------
const Scene: React.FC<PropsWithChildren<{dur: number}>> = ({dur, children}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8, dur - 8, dur], [0, 1, 1, 0], clamp);
  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};

const Backdrop: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(circle at 50% 28%, #14224a 0%, ${C.bg} 70%)`,
    }}
  />
);

const Drift: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({length: 16}).map((_, i) => {
        const x = (random(`x${i}`) - 0.5) * 5;
        const z = -2 - random(`z${i}`) * 4;
        const speed = 0.012 + random(`s${i}`) * 0.02;
        const y = ((random(`y${i}`) * 12 + frame * speed) % 12) - 6;
        const s = 0.14 + random(`b${i}`) * 0.22;
        return (
          <mesh
            key={i}
            position={[x, y, z]}
            rotation={[frame * 0.02 * ((i % 3) + 1), frame * 0.015 * ((i % 2) + 1), 0]}
          >
            <boxGeometry args={[s, s, s]} />
            <meshStandardMaterial
              color={i % 2 ? C.cyan : C.indigo}
              transparent
              opacity={0.45}
            />
          </mesh>
        );
      })}
    </>
  );
};

const Stage: React.FC<PropsWithChildren> = ({children}) => {
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{position: [0, 0, 9], fov: 45}}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[4, 8, 6]} intensity={1.8} />
        <pointLight position={[-4, 2, 4]} intensity={20} color={C.cyan} />
        <Drift />
        {children}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

const useEnter = (delay = 0) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping: 14, stiffness: 120}});
};

const Badge: React.FC<{n: number}> = ({n}) => {
  const p = useEnter(0);
  return (
    <div
      style={{
        position: 'absolute',
        top: 110,
        left: 70,
        width: 120,
        height: 120,
        borderRadius: 60,
        background: C.cyan,
        color: C.bg,
        fontSize: 72,
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${p})`,
      }}
    >
      {n}
    </div>
  );
};

const Caption: React.FC<{title: string; sub: string; delay?: number}> = ({
  title,
  sub,
  delay = 18,
}) => {
  const p = useEnter(delay);
  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        right: 70,
        top: 1420,
        textAlign: 'center',
        opacity: p,
        transform: `translateY(${(1 - p) * 40}px)`,
      }}
    >
      <div style={{fontSize: 72, fontWeight: 800, color: C.text, lineHeight: 1.1}}>
        {title}
      </div>
      <div style={{fontSize: 40, color: C.muted, marginTop: 24, lineHeight: 1.25}}>
        {sub}
      </div>
    </div>
  );
};

const Card: React.FC<PropsWithChildren<{delay?: number}>> = ({delay = 6, children}) => {
  const p = useEnter(delay);
  return (
    <div
      style={{
        position: 'absolute',
        left: 90,
        right: 90,
        top: 640,
        height: 680,
        borderRadius: 40,
        background: 'rgba(255,255,255,0.06)',
        border: '2px solid rgba(255,255,255,0.12)',
        overflow: 'hidden',
        transform: `perspective(1400px) rotateX(${(1 - p) * 35}deg) scale(${0.85 + 0.15 * p})`,
        opacity: p,
      }}
    >
      {children}
    </div>
  );
};

// ---------- Scene 1: hook ----------
const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const title = useEnter(0);
  const stamp = spring({frame: frame - 28, fps, config: {damping: 9, stiffness: 220}});
  const real = spring({frame: frame - 58, fps, config: {damping: 9, stiffness: 220}});
  const isReal = frame >= 58;
  return (
    <Scene dur={D.intro}>
      <Backdrop />
      <Stage>
        <mesh position={[0, 1.4, 0]} rotation={[frame * 0.01, frame * 0.025, 0]} scale={title}>
          <icosahedronGeometry args={[1.0, 1]} />
          <meshStandardMaterial color={C.cyan} wireframe />
        </mesh>
      </Stage>
      <div
        style={{
          position: 'absolute',
          left: 70,
          right: 70,
          top: 640,
          textAlign: 'center',
          fontSize: 92,
          fontWeight: 800,
          color: C.text,
          lineHeight: 1.1,
          opacity: title,
          transform: `translateY(${(1 - title) * 50}px)`,
        }}
      >
        These 4 internet facts sound fake
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 1050,
          textAlign: 'center',
          fontSize: 190,
          fontWeight: 900,
          letterSpacing: 4,
          color: isReal ? C.green : C.red,
          opacity: frame >= 28 ? 1 : 0,
          transform: `rotate(${isReal ? 0 : -6}deg) scale(${
            isReal ? interpolate(real, [0, 1], [2.6, 1]) : interpolate(stamp, [0, 1], [3, 1])
          })`,
        }}
      >
        {isReal ? 'REAL.' : 'FAKE?'}
      </div>
    </Scene>
  );
};

// ---------- Scene 2: first website ----------
const Fact1: React.FC = () => {
  const frame = useCurrentFrame();
  const url = 'info.cern.ch';
  const typed = url.slice(0, Math.floor(interpolate(frame, [30, 70], [0, url.length], clamp)));
  const links = ['What is this?', 'Browse the web', 'Help'];
  return (
    <Scene dur={D.f1}>
      <Backdrop />
      <Stage>
        <group position={[0, 1.5, 0]} rotation={[0.3, frame * 0.02, 0]}>
          <mesh>
            <sphereGeometry args={[0.9, 20, 14]} />
            <meshStandardMaterial color={C.indigo} wireframe />
          </mesh>
          {[0, 1, 2].map((i) => {
            const a = frame * 0.05 + (i * Math.PI * 2) / 3;
            return (
              <mesh key={i} position={[Math.cos(a) * 1.5, Math.sin(a * 0.7) * 0.5, Math.sin(a) * 1.5]}>
                <boxGeometry args={[0.25, 0.25, 0.25]} />
                <meshStandardMaterial color={C.cyan} />
              </mesh>
            );
          })}
        </group>
      </Stage>
      <Badge n={1} />
      <Card>
        <div style={{height: 90, background: '#1e293b', display: 'flex', alignItems: 'center', padding: '0 30px', gap: 16}}>
          {['#f43f5e', '#fbbf24', '#34d399'].map((c) => (
            <div key={c} style={{width: 22, height: 22, borderRadius: 11, background: c}} />
          ))}
          <div style={{flex: 1, marginLeft: 20, height: 52, borderRadius: 26, background: '#0f172a', color: C.text, fontSize: 32, display: 'flex', alignItems: 'center', padding: '0 26px'}}>
            {typed}
            <span style={{opacity: Math.floor(frame / 8) % 2 ? 0 : 1}}>|</span>
          </div>
        </div>
        <div style={{background: '#f8fafc', height: '100%', padding: '50px 60px', fontFamily: 'Georgia, "Times New Roman", serif'}}>
          <div style={{fontSize: 64, fontWeight: 700, color: '#0f172a', opacity: interpolate(frame, [70, 85], [0, 1], clamp)}}>
            World Wide Web
          </div>
          {links.map((l, i) => (
            <div
              key={l}
              style={{
                fontSize: 44,
                color: '#1d4ed8',
                textDecoration: 'underline',
                marginTop: 34,
                opacity: interpolate(frame, [85 + i * 8, 95 + i * 8], [0, 1], clamp),
              }}
            >
              {l}
            </div>
          ))}
        </div>
      </Card>
      <Caption title="The first website is still online." sub="A restored copy lives at info.cern.ch" />
    </Scene>
  );
};

// ---------- Scene 3: first domain ----------
const Fact2: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const year = Math.round(
    interpolate(frame, [12, 70], [2026, 1985], {...clamp, easing: Easing.out(Easing.cubic)}),
  );
  const lock = spring({frame: frame - 70, fps, config: {damping: 12, stiffness: 200}});
  const tag = useEnter(72);
  return (
    <Scene dur={D.f2}>
      <Backdrop />
      <Stage>
        <group position={[0, 1.5, 0]} rotation={[0, Math.sin(frame * 0.04) * 0.6, 0]} scale={1.1}>
          <mesh>
            <boxGeometry args={[1.4, 1.1, 0.5]} />
            <meshStandardMaterial color={C.amber} metalness={0.4} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.55 + (1 - lock) * 0.35, 0]}>
            <torusGeometry args={[0.42, 0.09, 16, 32, Math.PI]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.25} />
          </mesh>
        </group>
      </Stage>
      <Badge n={2} />
      <Card>
        <div style={{height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 50}}>
          <div style={{fontSize: 230, fontWeight: 900, color: C.text, fontVariantNumeric: 'tabular-nums'}}>
            {year}
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: C.bg,
              background: C.amber,
              borderRadius: 24,
              padding: '22px 44px',
              opacity: tag,
              transform: `translateY(${(1 - tag) * -80}px)`,
            }}
          >
            symbolics.com
          </div>
        </div>
      </Card>
      <Caption title="The first domain ever registered is still registered." sub="symbolics.com, bought in 1985" />
    </Scene>
  );
};

// ---------- Scene 4: coffee pot webcam ----------
const Fact3: React.FC = () => {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [20, 120], [0.05, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const blink = Math.floor(frame / 10) % 2 === 0;
  const h = 1.3 * fill;
  return (
    <Scene dur={D.f3}>
      <Backdrop />
      <Stage>
        <group position={[0, 1.5, 0]} rotation={[0.15, 0.5 + frame * 0.015, 0]} scale={1.05}>
          <mesh position={[0, -0.85, 0]}>
            <boxGeometry args={[1.8, 0.25, 1.4]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.7, 0.7, 1.4, 32]} />
            <meshStandardMaterial color="#e2e8f0" transparent opacity={0.3} />
          </mesh>
          <mesh position={[0, -0.7 + h / 2, 0]}>
            <cylinderGeometry args={[0.66, 0.66, Math.max(h, 0.01), 32]} />
            <meshStandardMaterial color="#7c4a21" />
          </mesh>
          <mesh position={[0.75, 0, 0]}>
            <torusGeometry args={[0.4, 0.07, 12, 24, Math.PI]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <group position={[-1.7, 0.7, 0]}>
            <mesh>
              <boxGeometry args={[0.5, 0.35, 0.35]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            <mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
              <meshStandardMaterial color={C.cyan} />
            </mesh>
          </group>
        </group>
      </Stage>
      <Badge n={3} />
      <Card>
        <div style={{height: '100%', padding: 60, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 40}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 20, fontSize: 40, fontWeight: 700, color: C.text}}>
            <div style={{width: 28, height: 28, borderRadius: 14, background: C.red, opacity: blink ? 1 : 0.2}} />
            LIVE: Trojan Room
          </div>
          <div style={{height: 60, borderRadius: 30, background: 'rgba(255,255,255,0.1)', overflow: 'hidden'}}>
            <div style={{width: `${fill * 100}%`, height: '100%', background: C.amber}} />
          </div>
          <div style={{fontSize: 120, fontWeight: 900, color: fill > 0.8 ? C.green : C.red}}>
            {fill > 0.8 ? 'Coffee: YES' : 'Coffee: NO'}
          </div>
        </div>
      </Card>
      <Caption title="The first webcam watched a coffee pot." sub="Cambridge researchers built it to check if there was coffee" />
    </Scene>
  );
};

// ---------- Scene 5: BackRub ----------
const Fact4: React.FC = () => {
  const frame = useCurrentFrame();
  const A = 'Google';
  const B = 'BackRub';
  const gColors = ['#60a5fa', '#f43f5e', '#fbbf24', '#60a5fa', '#34d399', '#f43f5e', '#fbbf24'];
  return (
    <Scene dur={D.f4}>
      <Backdrop />
      <Stage>
        <mesh position={[0, 1.5, 0]} rotation={[frame * 0.015, frame * 0.025, 0]}>
          <torusKnotGeometry args={[0.7, 0.22, 100, 14]} />
          <meshStandardMaterial color={C.indigo} metalness={0.5} roughness={0.3} />
        </mesh>
      </Stage>
      <Badge n={4} />
      <Card>
        <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          {B.split('').map((_, i) => {
            const p = interpolate(frame, [40 + i * 4, 54 + i * 4], [0, 1], clamp);
            const ch = p < 0.5 ? A[i] ?? '' : B[i];
            const scaleY = Math.abs(Math.cos(p * Math.PI));
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  fontSize: 150,
                  fontWeight: 800,
                  color: p < 0.5 ? gColors[i] : C.text,
                  transform: `scaleY(${p === 0 || p === 1 ? 1 : scaleY})`,
                  minWidth: 20,
                }}
              >
                {ch}
              </span>
            );
          })}
        </div>
      </Card>
      <Caption title="Google was originally called BackRub." sub="Named after the way it analyzed backlinks" />
    </Scene>
  );
};

// ---------- Scene 6: outro ----------
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const a = useEnter(0);
  const b = interpolate(frame, [50, 65], [0, 1], clamp);
  const c = useEnter(60);
  return (
    <Scene dur={D.outro}>
      <Backdrop />
      <Stage>{null}</Stage>
      <div
        style={{
          position: 'absolute',
          left: 70,
          right: 70,
          top: 560,
          textAlign: 'center',
          fontSize: 80,
          fontWeight: 800,
          color: C.text,
          lineHeight: 1.15,
          opacity: a * (1 - b),
        }}
      >
        And you thought your first project was embarrassing.
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 720,
          textAlign: 'center',
          opacity: b,
          transform: `scale(${0.8 + 0.2 * c})`,
        }}
      >
        <div style={{fontSize: 130, fontWeight: 900, color: C.cyan}}>Part 2 tomorrow.</div>
        <div style={{fontSize: 52, color: C.muted, marginTop: 36}}>Follow for more</div>
      </div>
    </Scene>
  );
};

// ---------- Main ----------
export const InternetFacts: React.FC = () => {
  let t = 0;
  const seq = (dur: number, node: React.ReactNode) => {
    const el = (
      <Sequence key={t} from={t} durationInFrames={dur}>
        {node}
      </Sequence>
    );
    t += dur;
    return el;
  };
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT}}>
      {seq(D.intro, <Intro />)}
      {seq(D.f1, <Fact1 />)}
      {seq(D.f2, <Fact2 />)}
      {seq(D.f3, <Fact3 />)}
      {seq(D.f4, <Fact4 />)}
      {seq(D.outro, <Outro />)}
    </AbsoluteFill>
  );
};
