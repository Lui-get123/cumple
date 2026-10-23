"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Sparkles,
  Star,
  Balloon,
  Heart,
  Cake,
  Gift,
  X,
  PartyPopper,
  Flower2,
  Ribbon,
} from "lucide-react";

type CardState = "closed" | "opening" | "open";

type Spark = {
  id: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  color: string;
  size: number;
  delay: number;
};

type ClickHeart = {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  hx: number;
  hr: number;
  delay: number;
};

type Ripple = {
  id: number;
  x: number;
  y: number;
  size: number;
};

const SPARK_COLORS = [
  "#ff6b9d",
  "#ffd700",
  "#b19cd9",
  "#ff8fab",
  "#ffc3a0",
  "#87ceeb",
  "#ffb6c1",
  "#ff69b4",
  "#ffd1dc",
  "#7ec8e3",
];

export default function BirthdayCard() {
  const [state, setState] = useState<CardState>("closed");
  const [secretWord, setSecretWord] = useState("");
  const [hearts, setHearts] = useState<
    Array<{ id: number; left: number; delay: number; size: number }>
  >([]);
  const [confetti, setConfetti] = useState<
    Array<{
      id: number;
      left: number;
      delay: number;
      color: string;
      size: number;
      rot: number;
    }>
  >([]);

  // Click effects state
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [clickHearts, setClickHearts] = useState<ClickHeart[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const stageRef = useRef<HTMLDivElement>(null);
  const nextIdRef = useRef<number>(1_000_000);

  const isClosed = state === "closed";
  const isOpening = state === "opening";
  const isOpen = state === "open";

  const spawnEffects = useCallback(() => {
    const newHearts = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      left: 15 + Math.random() * 70,
      delay: Math.random() * 1.2,
      size: Math.random() * 10 + 8,
    }));
    setHearts(newHearts);

    const newConfetti = Array.from({ length: 40 }, (_, i) => ({
      id: Date.now() + 100 + i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
      size: Math.random() * 9 + 5,
      rot: Math.random() * 360,
    }));
    setConfetti(newConfetti);

    setTimeout(() => {
      setHearts([]);
      setConfetti([]);
    }, 4500);
  }, []);

  // ======= Click fireworks effect =======
  const spawnClickEffects = useCallback((clientX: number, clientY: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    const baseId = nextIdRef.current;
    nextIdRef.current += 200;

    // --- Ripple (onda expansiva) ---
    const rippleId = baseId;
    setRipples((prev) => [
      ...prev,
      { id: rippleId, x: relX, y: relY, size: 70 + Math.random() * 40 },
    ]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== rippleId));
    }, 950);

    // --- Sparks (chispas radial tipo fuego artificial) ---
    const sparkCount = 22;
    const newSparks: Spark[] = [];
    for (let i = 0; i < sparkCount; i++) {
      const angle = (i / sparkCount) * Math.PI * 2 + Math.random() * 0.35;
      const distance = 55 + Math.random() * 85;
      newSparks.push({
        id: baseId + 1 + i,
        x: relX,
        y: relY,
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance,
        color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
        size: 3 + Math.random() * 4.5,
        delay: Math.random() * 0.05,
      });
    }
    setSparks((prev) => [...prev, ...newSparks]);
    setTimeout(() => {
      const ids = new Set(newSparks.map((s) => s.id));
      setSparks((prev) => prev.filter((s) => !ids.has(s.id)));
    }, 1000);

    // --- Click Hearts (corazones flotando) ---
    const heartsCount = 2 + Math.floor(Math.random() * 2);
    const newClickHearts: ClickHeart[] = [];
    const heartColors = ["#ff6b9d", "#ff4d8d", "#ff8fab", "#d63384", "#ee0979"];
    for (let i = 0; i < heartsCount; i++) {
      newClickHearts.push({
        id: baseId + 80 + i,
        x: relX + (Math.random() - 0.5) * 30,
        y: relY - Math.random() * 10,
        size: 18 + Math.random() * 16,
        color: heartColors[Math.floor(Math.random() * heartColors.length)],
        hx: (Math.random() - 0.5) * 80,
        hr: (Math.random() - 0.5) * 45,
        delay: i * 0.08,
      });
    }
    setClickHearts((prev) => [...prev, ...newClickHearts]);
    setTimeout(() => {
      const ids = new Set(newClickHearts.map((h) => h.id));
      setClickHearts((prev) => prev.filter((h) => !ids.has(h.id)));
    }, 1900);
  }, []);

  // Click anywhere on the background/stage => effects
  const handleStageMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only trigger for LEFT button
      if (e.button !== 0) return;
      spawnClickEffects(e.clientX, e.clientY);
    },
    [spawnClickEffects]
  );

  const handleCardClick = useCallback(() => {
    if (isClosed) {
      setState("opening");
      spawnEffects();
      setTimeout(() => setState("open"), 850);
    }
  }, [isClosed, spawnEffects]);

  const handleClose = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setState("closed");
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isClosed) {
        setState("closed");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isClosed]);

  // ======= Render helpers =======
  const renderStars = () =>
    Array.from({ length: 8 }).map((_, i) => {
      const Icon = i % 2 === 0 ? Sparkles : Star;
      return (
        <Icon
          key={`star-${i}`}
          className="absolute lucide-twinkle select-none"
          style={{
            left: `${5 + i * 12}%`,
            top: `${8 + (i % 4) * 22}%`,
            animationDelay: `${i * 0.25}s`,
            width: `${18 + (i % 3) * 8}px`,
            height: `${18 + (i % 3) * 8}px`,
            color: "#FFD700",
          }}
          strokeWidth={2}
        />
      );
    });

  const renderBalloons = () =>
    Array.from({ length: 4 }).map((_, i) => {
      const balloonColors = ["#ff4d8d", "#ff6b9d", "#b19cd9", "#ffb6c1"];
      return (
        <div
          key={`balloon-wrap-${i}`}
          className="absolute lucide-float select-none"
          style={{
            left: `${8 + i * 28}%`,
            bottom: `${6 + (i % 2) * 8}%`,
            animationDelay: `${i * 0.6}s`,
          }}
        >
          <Balloon
            style={{
              width: `${34 + (i % 2) * 8}px`,
              height: `${34 + (i % 2) * 8}px`,
              color: balloonColors[i % balloonColors.length],
            }}
            strokeWidth={2}
            fill={balloonColors[i % balloonColors.length] + "40"}
          />
          {/* Balloon string */}
          <svg
            viewBox="0 0 8 30"
            className="mx-auto block"
            style={{ width: "4px", height: "22px", marginTop: "-2px" }}
          >
            <path
              d="M4 0 C 1 8, 7 16, 4 30"
              stroke="#b30059"
              strokeWidth="1"
              fill="none"
              strokeLinecap="round"
              opacity="0.5"
            />
          </svg>
        </div>
      );
    });

  const renderFlowers = (color: string, opacity = 0.7) => (
    <Flower2
      style={{
        width: "22px",
        height: "22px",
        color,
        opacity,
      }}
      strokeWidth={1.8}
    />
  );

  return (
    <div
      ref={stageRef}
      onMouseDown={handleStageMouseDown}
      className="relative w-full h-full flex items-center justify-center p-4 sm:p-8 overflow-hidden"
    >
      {/* ======= Background decorations ======= */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {renderStars()}
        {renderBalloons()}
      </div>

      {/* ======= Hearts & Confetti (from open animation) ======= */}
      {hearts.map((h) => (
        <div
          key={h.id}
          className="heart pointer-events-none"
          style={{
            left: `${h.left}%`,
            bottom: "35%",
            animationDelay: `${h.delay}s`,
            width: `${h.size}px`,
            height: `${h.size}px`,
          }}
        />
      ))}
      {confetti.map((c) => (
        <div
          key={c.id}
          className="confetti pointer-events-none"
          style={{
            left: `${c.left}%`,
            top: "8%",
            backgroundColor: c.color,
            animationDelay: `${c.delay}s`,
            width: `${c.size}px`,
            height: `${c.size}px`,
            borderRadius: c.id % 3 === 0 ? "50%" : c.id % 3 === 1 ? "2px" : "0",
            transform: `rotate(${c.rot}deg)`,
          }}
        />
      ))}

      {/* ======= CLICK EFFECTS: SPARKS, HEARTS, RIPPLES ======= */}
      {ripples.map((r) => (
        <div
          key={r.id}
          className="click-ripple pointer-events-none"
          style={{
            left: r.x,
            top: r.y,
            width: r.size,
            height: r.size,
          }}
        />
      ))}
      {sparks.map((s) => (
        <div
          key={s.id}
          className="spark pointer-events-none"
          style={
            {
              left: s.x,
              top: s.y,
              width: s.size,
              height: s.size,
              backgroundColor: s.color,
              boxShadow: `0 0 8px ${s.color}, 0 0 14px ${s.color}80`,
              ["--tx" as any]: `${s.tx}px`,
              ["--ty" as any]: `${s.ty}px`,
              animationDelay: `${s.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
      {clickHearts.map((h) => (
        <Heart
          key={h.id}
          className="click-heart pointer-events-none select-none"
          fill={h.color}
          stroke={h.color}
          strokeWidth={1.8}
          style={
            {
              left: h.x,
              top: h.y,
              width: h.size,
              height: h.size,
              color: h.color,
              animationDelay: `${h.delay}s`,
              ["--hx" as any]: `${h.hx}px`,
              ["--hr" as any]: `${h.hr}deg`,
            } as React.CSSProperties
          }
        />
      ))}

      {/* ======= Main Stage (the clickable envelope stage) ======= */}
      <div
        onClick={handleCardClick}
        className="relative cursor-pointer select-none"
        style={{
          perspective: "1500px",
          width: isOpen ? "min(92vw, 520px)" : "min(86vw, 420px)",
          height: isOpen ? "min(82vh, 680px)" : "min(62vh, 300px)",
          transition:
            "width 1s cubic-bezier(0.68,-0.55,0.265,1.55), height 1s cubic-bezier(0.68,-0.55,0.265,1.55)",
        }}
      >
        {/* Ground shadow */}
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full bg-black/25 blur-xl pointer-events-none"
          style={{
            bottom: isOpen ? "-28px" : "-22px",
            width: isOpen ? "65%" : "78%",
            height: isOpen ? "14px" : "20px",
            opacity: isOpen ? 0.12 : 0.35,
            transition: "all 1s cubic-bezier(0.68,-0.55,0.265,1.55)",
          }}
        />

        {/* ========== ENVELOPE ========== */}
        <div
          className="absolute inset-0 rounded-2xl overflow-visible"
          style={{
            transformStyle: "preserve-3d",
            transition: "opacity 0.8s ease",
            opacity: isOpen ? 0.45 : 1,
          }}
        >
          {/* Envelope back face */}
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background:
                "linear-gradient(145deg, #ffe4ec 0%, #ffc2d4 60%, #ffa5c0 100%)",
              boxShadow:
                "0 22px 60px rgba(255,105,180,0.35), inset 0 1px 0 rgba(255,255,255,0.9)",
              border: "2px solid rgba(255, 105, 180, 0.35)",
            }}
          />

          {/* Inner V pocket */}
          <div
            className="absolute bottom-0 left-0 right-0 w-full pointer-events-none"
            style={{
              height: isOpen ? "52%" : "55%",
              clipPath: "polygon(0 100%, 50% 0, 100% 100%)",
              background: "linear-gradient(180deg, #ff8cb5 0%, #ff6b9d 100%)",
              borderTop: "2px solid rgba(255,255,255,0.15)",
              opacity: 0.55,
            }}
          />

          {/* Side edges overlay */}
          <div
            className="absolute top-0 bottom-0 left-0 w-1/2 pointer-events-none rounded-l-2xl"
            style={{
              background:
                "linear-gradient(100deg, rgba(255,120,160,0.25) 0%, rgba(255,255,255,0) 100%)",
            }}
          />
          <div
            className="absolute top-0 bottom-0 right-0 w-1/2 pointer-events-none rounded-r-2xl"
            style={{
              background:
                "linear-gradient(260deg, rgba(255,120,160,0.25) 0%, rgba(255,255,255,0) 100%)",
            }}
          />

          {/* Decorative corner flowers */}
          <div className="absolute top-3 left-3 pointer-events-none">
            {renderFlowers("#f9a8c8", 0.8)}
          </div>
          <div className="absolute top-3 right-3 pointer-events-none">
            {renderFlowers("#f9a8c8", 0.8)}
          </div>
          <div className="absolute bottom-3 left-3 pointer-events-none">
            {renderFlowers("#f9a8c8", 0.8)}
          </div>
          <div className="absolute bottom-3 right-3 pointer-events-none">
            {renderFlowers("#f9a8c8", 0.8)}
          </div>
        </div>

        {/* ========== ENVELOPE FLAP ========== */}
        <div
          className="absolute left-0 right-0 overflow-hidden rounded-t-2xl pointer-events-none"
          style={{
            top: 0,
            height: "55%",
            transformOrigin: "top center",
            transformStyle: "preserve-3d",
            transform: isClosed ? "rotateX(0deg)" : "rotateX(180deg)",
            transition: "transform 0.85s cubic-bezier(0.68,-0.55,0.265,1.55)",
            zIndex: isClosed ? 30 : 2,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              background:
                "linear-gradient(180deg, #ffa0be 0%, #ff6b9d 45%, #ff4a8a 100%)",
              boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.08)",
            }}
          />
          <div
            className="absolute top-0 left-0 right-0 h-0.5 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
            }}
          />
          {/* Ribbon icon on flap */}
          <div className="absolute top-9 left-1/2 -translate-x-1/2 opacity-30 pointer-events-none select-none">
            <Ribbon
              style={{ width: "44px", height: "44px", color: "#ffffff" }}
              strokeWidth={1.8}
            />
          </div>
        </div>

        {/* ========== THE LETTER ========== */}
        <div
          className="absolute left-1/2 rounded-xl overflow-hidden"
          onClick={(e) => {
            if (isOpen) e.stopPropagation();
          }}
          style={{
            bottom: isClosed ? "2%" : isOpen ? "0%" : "-10%",
            width: isClosed ? "86%" : isOpen ? "96%" : "92%",
            height: isClosed ? "46%" : isOpen ? "100%" : "88%",
            transform: `translateX(-50%) ${
              isClosed
                ? "translateY(4%) scale(0.94)"
                : isOpen
                ? "translateY(-2%) scale(1.06)"
                : "translateY(-85%) scale(1.02)"
            }`,
            transformOrigin: "bottom center",
            transformStyle: "preserve-3d",
            zIndex: isClosed ? 15 : isOpen ? 50 : 35,
            opacity: isClosed ? 0 : 1,
            transition:
              "all 1.05s cubic-bezier(0.68,-0.55,0.265,1.55), opacity 0.3s ease-in-out",
            background:
              "linear-gradient(180deg, #fffbf2 0%, #fff0f6 45%, #ffe4ef 100%)",
            boxShadow: isOpen
              ? "0 40px 90px rgba(255,107,157,0.45), 0 0 0 1px rgba(255,107,157,0.25)"
              : "0 16px 40px rgba(0,0,0,0.18)",
          }}
        >
          {/* Decorative dashed border */}
          <div
            className="absolute inset-2.5 rounded-lg pointer-events-none"
            style={{ border: "2px dashed rgba(255, 107, 157, 0.35)" }}
          />

          {/* Letter content */}
          <div className="relative h-full flex flex-col items-center justify-between p-5 sm:p-8 overflow-y-auto">
            {/* Header */}
            <div className="text-center space-y-2 w-full pt-1">
              <div className="flex items-center justify-center gap-3 mb-1">
                <Balloon
                  className="animate-float-fast select-none"
                  style={{ width: "28px", height: "28px", color: "#ff4d8d" }}
                  fill="#ff8fab50"
                  strokeWidth={2}
                />
                <PartyPopper
                  className="animate-float-medium select-none"
                  style={{
                    width: "30px",
                    height: "30px",
                    color: "#b19cd9",
                    animationDelay: "0.2s",
                  }}
                  fill="#b19cd940"
                  strokeWidth={2}
                />
                <Sparkles
                  className="animate-float-fast select-none"
                  style={{
                    width: "28px",
                    height: "28px",
                    color: "#FFB347",
                    animationDelay: "0.4s",
                  }}
                  strokeWidth={2}
                />
              </div>
              <h1
                className="font-display font-bold bg-clip-text text-transparent leading-tight"
                style={{
                  fontSize: isOpen ? "clamp(2.2rem, 6vw, 3.4rem)" : "1.5rem",
                  backgroundImage:
                    "linear-gradient(135deg, #ff4d8d 0%, #d3006b 45%, #7a1cbf 100%)",
                  filter: "drop-shadow(0 2px 6px rgba(255,107,157,0.35))",
                }}
              >
                ¡Feliz Cumpleaños!
              </h1>
              <div
                className={`flex items-center justify-center gap-2 ${
                  isOpen ? "" : "hidden"
                }`}
              >
                <Cake
                  style={{ width: "22px", height: "22px", color: "#c47a3a" }}
                  fill="#ffd70050"
                  strokeWidth={2}
                />
                <span
                  className="text-pink-500 font-medium"
                  style={{ fontSize: isOpen ? "1rem" : "0.75rem" }}
                >
                  <Sparkles
                    className="inline mr-1"
                    style={{
                      width: "1em",
                      height: "1em",
                      color: "#ffcf4a",
                      verticalAlign: "-0.15em",
                    }}
                    strokeWidth={2.2}
                  />
                  Que tu día sea lleno de magia
                  <Sparkles
                    className="inline ml-1"
                    style={{
                      width: "1em",
                      height: "1em",
                      color: "#ffcf4a",
                      verticalAlign: "-0.15em",
                    }}
                    strokeWidth={2.2}
                  />
                </span>
                <Cake
                  style={{ width: "22px", height: "22px", color: "#c47a3a" }}
                  fill="#ffd70050"
                  strokeWidth={2}
                />
              </div>
            </div>

            {/* Body Message */}
            <div
              className={`flex-1 w-full flex flex-col items-center justify-start transition-all duration-700 ease-out ${
                isOpen
                  ? "opacity-100 translate-y-0 py-4"
                  : "opacity-0 translate-y-4 py-0"
              }`}
              style={{
                visibility: isOpen ? "visible" : "hidden",
                height: isOpen ? "auto" : "0px",
              }}
            >
              <div
                className="text-left space-y-8 text-gray-700 leading-relaxed w-full font-body pb-6"
                style={{ fontSize: isOpen ? "0.95rem" : "0.75rem" }}
              >
                <p className="first-letter:font-display first-letter:text-5xl first-letter:text-pink-500 first-letter:float-left first-letter:mr-2 first-letter:leading-none first-letter:mt-1 italic text-center text-pink-700 mb-6">
                  &ldquo;He estado escribiendo esto durante 25 días, para ti, pensando en ti...&rdquo;
                </p>

                <div className="space-y-6 px-2">

                  <div className="border-l-[3px] border-pink-300 pl-4 py-1 relative">
                    <div className="absolute -left-[10px] top-1.5 w-4 h-4 bg-[#fff0f6] border-2 border-pink-400 rounded-full" />
                    <h3 className="font-display font-bold text-pink-600 text-lg mb-1">1/10/2026</h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      Esto solo lo hice para alguien que una vez amé, lo duro fue que no lo valoró, la verdad le escri<span className="font-black text-pink-600 text-[1.15rem]">B</span>í un libro (no digital como ahora), una pequeña libretica de esas chiquitas…. Se lo di y me lo devolvió, y pues termino en la basura ¿por qué no hacerlo por alguien que ha estado conmigo desde hace años?<br/><br/>
                      Si, lo sé, se ve cursi (lo digo por mí, hace mucho que no soy cursi o algo por el estilo. O sentimental……. Y si te incomoda perdóname. en fin), pero es por tu cumpleaños que es dentro de 24 días. Tal vez te escribiera, pero estas trabajando y estas con tus cosas y no quiero molestar con eso, amada amiga mía. Ya nos veremos en el ensayo del martes. <strong className="text-pink-600 font-bold underline">¡Presta atención!......</strong>
                    </p>
                  </div>

                  <div className="border-l-[3px] border-pink-300 pl-4 py-1 relative">
                    <div className="absolute -left-[10px] top-1.5 w-4 h-4 bg-[#fff0f6] border-2 border-pink-400 rounded-full" />
                    <h3 className="font-display font-bold text-pink-600 text-lg mb-1">2/10/2026</h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      Mmmm, algo inesperado tu mensaje, la verdad no espero mensajes de nadie. Solo estaba viendo una película cuando me llego tu mensaje y me contaste: “Hoy cogí rabia y lloré mucho (no me preguntes por qué cogí rabia porque f<span className="font-black text-pink-600 text-[1.15rem]">u</span>e algo familiar) pero me duele mucho la cabeza y empecé a sentir hasta fiebre “veo que estas cargando con muchas emociones ahora mismo. “Quisiera no sentir tanto” no creo que desees eso, eso es lo que te hace Katalina (que quizás duela, pues dolerá. Pero eso eres tú) no tengo mucho que decir la verdad, menos si no sé qué te pasa, igual sé que no me vas a contar y está bien. <strong className="text-pink-600 font-bold underline">¿Prestaste atención?</strong>
                    </p>
                  </div>

                  <div className="border-l-[3px] border-pink-300 pl-4 py-1 relative">
                    <div className="absolute -left-[10px] top-1.5 w-4 h-4 bg-[#fff0f6] border-2 border-pink-400 rounded-full" />
                    <h3 className="font-display font-bold text-pink-600 text-lg mb-1">3/10/2026</h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      Hoy <span className="font-black text-pink-600 text-[1.15rem]">s</span>ábado no pensé en nada ni hice la gran cosa, pero ya es un día menos para que llegue tu cumpleaños, blanquita corazón de pollito.
                    </p>
                  </div>

                  <div className="border-l-[3px] border-pink-300 pl-4 py-1 relative">
                    <div className="absolute -left-[10px] top-1.5 w-4 h-4 bg-[#fff0f6] border-2 border-pink-400 rounded-full" />
                    <h3 className="font-display font-bold text-pink-600 text-lg mb-1">4/10/2026</h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      Lo que me paso hoy domingo ya lo sabes, me impresiona <span className="font-black text-pink-600 text-[1.15rem]">c</span>ómo justo sabes cómo me siento o que tengo, vaya don que tienes de mujer. Es por esas cosas que considero que eres mucho más mujer que cualquiera, jamás cambies eso, creo que es de las otras cosas que te hacen ser tú, Brey´s Katalina Castillo Arias. Quise saber cómo te fue anoche con tus amigos o como estabas tú, pero ya sabes porque no lo hice. <strong className="text-pink-600 font-bold underline">¿Te diste cuenta de los detalles?</strong>
                    </p>
                  </div>

                  <div className="border-l-[3px] border-pink-300 pl-4 py-1 relative">
                    <div className="absolute -left-[10px] top-1.5 w-4 h-4 bg-[#fff0f6] border-2 border-pink-400 rounded-full" />
                    <h3 className="font-display font-bold text-pink-600 text-lg mb-1">5/10/2026</h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      Ya sabes que es <span className="font-black text-pink-600 text-[1.15rem]">a</span>lgo raro para mí que me preguntes todo eso que me preguntaste hoy en la mañana, pero me dio calma y lo sentí gratificante, solo que preguntes por mi o como estoy. Pero quiero saber de ti, a penas inicia el día háblame cuando puedas, igual mañana te vere en el ensayo para los ayunos. Lástima no poder hablar en privado, espero que antes de irme podamos hacerlo, sino, espero que del otro lado pueda tener algo de memoria sobre ti y recordar todo lo que has hecho por tu pequeño amigo.
                    </p>
                  </div>

                  <div className="border-l-[3px] border-pink-300 pl-4 py-1 relative">
                    <div className="absolute -left-[10px] top-1.5 w-4 h-4 bg-[#fff0f6] border-2 border-pink-400 rounded-full" />
                    <h3 className="font-display font-bold text-pink-600 text-lg mb-1">6/10/2026</h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      Hoy tuvimos el ensayo y pudimos estar co<span className="font-black text-pink-600 text-[1.15rem]">n</span> nuestro grupo para prepararnos para los ayunos, nos fue bien gracias a Dios. Aunque pase algo de pena porque estaba sacando mal la cuenta de los días para tu cumple JAJAJAJAA. Pero si ya faltan 19 días para ese día. Lo mejor del ensayo fue que me regalaste una sonrisa y eso me agrada de ti, que puedas darme paz no solo con tus palabras o tu presencia, sino con una mirada y una sonrisa. Espero lo vuelvas a hacer. Me has dicho que vas mucho mejor, me alegra saber eso. Pero sé que aun vas poco a poco con ese proceso. Es algo larguito y doloroso pero necesario, o no lo sé, desearía que me contaras más……. Bueno también sé que vas a tener tu cirugía, Dios te ayude con eso.
                    </p>
                  </div>

                  <div className="border-l-[3px] border-pink-300 pl-4 py-1 relative">
                    <div className="absolute -left-[10px] top-1.5 w-4 h-4 bg-[#fff0f6] border-2 border-pink-400 rounded-full" />
                    <h3 className="font-display font-bold text-pink-600 text-lg mb-1">7/10/2026</h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      Me alegra saber que hoy en la mañana estas bien y estas en mo<span className="font-black text-pink-600 text-[1.15rem]">d</span>o descanso, aunque con dolores de cabeza, así ando yo también.<br/><br/>
                      JAJAJAJA odio cuando dices que te da pena algo conmigo, ya sabes…. tu parcial de inglés, espero poder hacerlo bien, obvio usare la IA jajajjaja, pero igual……… por ti lo hare.<br/><br/>
                      El dolor de cabeza me está matando, hace rato no tenía uno así…espero se me pase. Mientras he estado escribiendo aquí para ti y pensando en cómo estas, a veces no sé qué escribir ya que no tengo mucha imaginación, supongo. Pero lo hago por ti también.
                    </p>
                  </div>

                  <div className="border-l-[3px] border-pink-300 pl-4 py-1 relative">
                    <div className="absolute -left-[10px] top-1.5 w-4 h-4 bg-[#fff0f6] border-2 border-pink-400 rounded-full" />
                    <h3 className="font-display font-bold text-pink-600 text-lg mb-1">8/10/2026</h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      Mira est<span className="font-black text-pink-600 text-[1.15rem]">o</span>: <a href="https://www.facebook.com/share/v/1TcjC9ssKd/" target="_blank" rel="noopener noreferrer" className="text-pink-600 underline hover:text-pink-700">https://www.facebook.com/share/v/1TcjC9ssKd/</a>. Spiderman jamás atacaría a un villano así tan violentamente, lo que le sucede es que a raíz de todo lo que le ha pasado sus genes arácnidos están mutando más que los genes humanos y es cuando se pone violento y actúa más como araña y menos como humano, haciendo que pierda el control, llegando al punto de casi matar a un policía, Spiderman no es así. Yo…pues no era así como me has visto que he actuado que incluso me has dicho mis verdades. Solo me he puesto mucho a la defensiva por todo lo que me han hecho y no me agrada ser así, a raíz de eso me he vuelto muy arrogante y tengo los genes arácnidos muy desarrollados. Todo por unas traiciones y heridas que me han hecho volverme así para que nadie me vea la cara o se burle de mí. Pero no soy así, solo me he vuelto así. Spiderman desarrollo un inhibidor para poder controlar sus genes arácnidos, pero a la final los logra controlar por su propia voluntad, tú eres mi inhibidor, tu mirada y tu sonrisa y obviamente tus palabras, pero sé que debo hacerlo por propia voluntad. Perdón si es algo infantil, pero si, mi Superhéroe favorito es Spiderman.<br/><br/>
                      No me gusto que dijeras “Quisiera no sentir tanto”, créeme cuando es así te proteges demasiado y bueno, puedes actuar mal a veces. En mi caso pues te tengo a ti que me haces calmar y llevar las cosas como son y actuar como es. Creo que he actuado mejor en los ensayos ¿No? Espero que sí, intento ser mejor con los demás luego que me dijiste todo eso, más contigo y para ti.
                    </p>
                  </div>

                  <div className="border-l-[3px] border-pink-300 pl-4 py-1 relative">
                    <div className="absolute -left-[10px] top-1.5 w-4 h-4 bg-[#fff0f6] border-2 border-pink-400 rounded-full" />
                    <h3 className="font-display font-bold text-pink-600 text-lg mb-1">9/10/2026</h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      No pensé nada en escribir, pe<span className="font-black text-pink-600 text-[1.15rem]">r</span>o pensé en como seguías tú. Espero estes mejor.
                    </p>
                  </div>

                  <div className="border-l-[3px] border-pink-300 pl-4 py-1 relative">
                    <div className="absolute -left-[10px] top-1.5 w-4 h-4 bg-[#fff0f6] border-2 border-pink-400 rounded-full" />
                    <h3 className="font-display font-bold text-pink-600 text-lg mb-1">10/10/2026</h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      Creo que <span className="font-black text-pink-600 text-[1.15rem]">e</span>s la primera vez que estoy abajo y te veo cantar con otro grupo, pero amo ver como Dios te use y aun así yo estoy acá abajo, y más volver a ver a tu mamá cantar. <strong className="text-pink-600 font-bold underline">¿Sigues prestando atención?</strong>
                    </p>
                  </div>

                  <div className="border-l-[3px] border-pink-300 pl-4 py-1 relative">
                    <div className="absolute -left-[10px] top-1.5 w-4 h-4 bg-[#fff0f6] border-2 border-pink-400 rounded-full" />
                    <h3 className="font-display font-bold text-pink-600 text-lg mb-1">11/10/2026</h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      Hoy me toco a mí y bueno estaba nervioso, pero verte venir donde mi a saludarme y a saber cómo estaba me dio calma y ver tu sonrisa, gracias por venir donde mi a verme y preguntar cómo estaba. Aunque no hablamos casi, ojalá pudiera sentarme a hablar contigo, ya nos toca mañana tocar en el último día de ayuno, nos vemos blanquita.
                    </p>
                  </div>

                  <div className="border-l-[3px] border-pink-300 pl-4 py-1 relative">
                    <div className="absolute -left-[10px] top-1.5 w-4 h-4 bg-[#fff0f6] border-2 border-pink-400 rounded-full" />
                    <h3 className="font-display font-bold text-pink-600 text-lg mb-1">12/10/2026</h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      Bien, hoy ya cerramos los ayunos gracias a Dios y nos <span className="font-black text-pink-600 text-[1.15rem]">f</span>ue bien en las adoraciones y alabanzas y en la ministración, espero volver a tocar contigo pronto. Me gusta el grupo, contigo como cabeza de voz y con Elizabeth quien se ha añadido y le ha ido muy bien. No mes es complicado acoplarme a ella ya que con ella tocaba en los primeros cultos de jóvenes, incluso le di clases de piano cuando eso ajaja. en cuanto a Gaby, tiene potencial para aprender y dejarse llevar por nosotros, la ayudare en lo que pueda y hasta que pueda, con Alfonso me es más sencillo puesto que sé de batería también y entiendo todo lo que hace en la batería, casi siempre me va bien con él, pocas son las veces que hace algo nuevo que no entiendo y cuando lo hace le digo que lo repita para entender y tenerlo en cuenta. Ya nos veremos de nuevo…….
                    </p>
                  </div>

                  <div className="border-l-[3px] border-pink-300 pl-4 py-1 relative">
                    <div className="absolute -left-[10px] top-1.5 w-4 h-4 bg-[#fff0f6] border-2 border-pink-400 rounded-full" />
                    <h3 className="font-display font-bold text-pink-600 text-lg mb-1">13/10/2026</h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      Bien anoche me dijiste q<span className="font-black text-pink-600 text-[1.15rem]">u</span>e tenías dolor en la garganta y cólicos, hoy estas mejor, en casa descansado y ya mañana tienes la cirugía. Acá te estaré esperando.
                    </p>
                  </div>

                  <div className="border-l-[3px] border-pink-300 pl-4 py-1 relative">
                    <div className="absolute -left-[10px] top-1.5 w-4 h-4 bg-[#fff0f6] border-2 border-pink-400 rounded-full" />
                    <h3 className="font-display font-bold text-pink-600 text-lg mb-1">14/10/2026</h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      Ya hoy vas a ciru<span className="font-black text-pink-600 text-[1.15rem]">g</span>ía, me escribiste desde la mañana bien temprano avisándome que ya ibas camino a la clínica, no sabes cuánto vale eso para mí. Espero que todo salga bien y que sea Dios como principal en esa cirugía, recuerdo que me dijiste que estabas nerviosa, espero que Dios haya podido calmar tu corazón de pollito y hayas podido ir en calma a la cirugía. Te estaré esperando.<br/><br/>
                      En cuanto a tu examen, ¡odio a tu profesor! ¿Quién carajo hace un examen de 62 preguntas? Jajajaja esto no es el ICFES, pero lo hice por ti, entre a mi clase y tenía las dos ventanas abiertas, la de tu examen y mi clase, aunque mi clase no es tan interesante, es de Talento Humano (sin despreciar eso ajajaja) pero ya sabes, es como materia de relleno.<br/><br/>
                      ¡Al fin me llego tu mensaje! Te estaba esperando, justo me llego cuando estaba despejando la mente jugando a GTA5 siendo policía, si lo sé, es algo friki o nerd jajajaj, pero soy de sistemas y los de sistemas amamos la tecnología y el Gaming jajaja. Mientras jugaba dejaba el juego en pausa o me estacionaba con la patrulla (friki jajaja) para saber cómo estabas postcirugía, era importante saber cómo estabas y que me contaras que te sentías, me dijiste que tenías dos sondas una sangre y la otra no recuerdo, perdón jajajja. Pero me alegra saber de ti, espero puedas descansar y pases del dolor que tienes ahora luego de la cirugía, ya te dije que intentes no moverte, haga caso hermana jajajaj.
                    </p>
                  </div>

                  <div className="border-l-[3px] border-pink-300 pl-4 py-1 relative">
                    <div className="absolute -left-[10px] top-1.5 w-4 h-4 bg-[#fff0f6] border-2 border-pink-400 rounded-full" />
                    <h3 className="font-display font-bold text-pink-600 text-lg mb-1">15/10/2026</h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      Espero tu mensaje para saber cómo amaneciste hoy, espero que te den desayuno allá y que te cuiden esos doctores, ya que anoche no te d<span className="font-black text-pink-600 text-[1.15rem]">i</span>eron almohada. Yo hoy tengo clase en la noche en la U vuelvo algo tarde a casa, pero espero tu mensaje, saludos a tu mamá que me dijiste que esta allá contigo, ya nos veremos, blanquita.<br/><br/>
                      Al fin supe de ti, tenías la voz tierna, estas cansadita y con dolor, espero que esto pase pronto para ti, es feo estar con dolor. Yo hoy fui a la U y volví temprano porque se fue la luz en la U. ahora estoy en clase virtual aquí en casa, pero pienso en ti y espero saber de ti hoy, o mejor que puedas descansar, te espero Blanquita.
                    </p>
                  </div>

                  <div className="border-l-[3px] border-pink-300 pl-4 py-1 relative">
                    <div className="absolute -left-[10px] top-1.5 w-4 h-4 bg-[#fff0f6] border-2 border-pink-400 rounded-full" />
                    <h3 className="font-display font-bold text-pink-600 text-lg mb-1">16/10/2026</h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      N<span className="font-black text-pink-600 text-[1.15rem]">o</span> he podido sacarte de mi cabeza desde que estas en la clínica, ayer me volviste a decir que tenías mucho dolor y fiebre y que te iban a dar salida, pero así no te podían dar salida.<br/><br/>
                      Supongo que has seguido pasando mal con el dolor y la fiebre, pude verte en una foto que subió tu mamá a su estado donde estas tu acostada viendo a la ventana, espero verte recuperada pronto. <strong className="text-pink-600 font-bold underline">¿Te fijas bien en cada detalle?</strong>
                    </p>
                  </div>

                  <div className="border-l-[3px] border-pink-300 pl-4 py-1 relative">
                    <div className="absolute -left-[10px] top-1.5 w-4 h-4 bg-[#fff0f6] border-2 border-pink-400 rounded-full" />
                    <h3 className="font-display font-bold text-pink-600 text-lg mb-1">17/10/2026</h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      Aun no sé nada de ti, te espero………. No hablamos tanto, no recuero. Pero me pediste que te mandara unas fotos del culto de jóvenes.
                    </p>
                  </div>

                  <div className="border-l-[3px] border-pink-300 pl-4 py-1 relative">
                    <div className="absolute -left-[10px] top-1.5 w-4 h-4 bg-[#fff0f6] border-2 border-pink-400 rounded-full" />
                    <h3 className="font-display font-bold text-pink-600 text-lg mb-1">18/10/2026</h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      Domingo en casa de nuestro Padre, y fue cuando me dijiste que ya ibas para tu casa.
                    </p>
                  </div>

                  <div className="border-l-[3px] border-pink-300 pl-4 py-1 relative">
                    <div className="absolute -left-[10px] top-1.5 w-4 h-4 bg-[#fff0f6] border-2 border-pink-400 rounded-full" />
                    <h3 className="font-display font-bold text-pink-600 text-lg mb-1">19/10/2026</h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      Ayer tuve un accidente con mi perro, tiene una herida en el costado izquierdo y sin querer lo lastimé cuando lo iba a cargar para bañarlo y me mordió el dedo pulgar de la mano derecha la herida es como de unos 2cm por ahí, no tanto, es un poco profunda, pero nada grave, ando fui al médico y me mandaron pastillas y limpiarme, debo volver dentro de 7 días para que me revisen cómo va la herida.
                    </p>
                  </div>

                  <div className="border-l-[3px] border-pink-300 pl-4 py-1 relative">
                    <div className="absolute -left-[10px] top-1.5 w-4 h-4 bg-[#fff0f6] border-2 border-pink-400 rounded-full" />
                    <h3 className="font-display font-bold text-pink-600 text-lg mb-1">20/10/2026</h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      El dolor de la cintura me volvió y me tiene mal hoy, ya mañana voy a cita.<br/><br/>
                      Ahora creo que estarías molesta conmigo, el dolor esta insoportable y camino con dificultad, me dio algo de escalofríos y empecé a sudar, ahora estoy acostado haciendo tareas y escribiendo esto, ya hablé con Alfonso………mañana tengo la cita temprano y me toca ir solo, pero estoy caminando sobre mi pie derecho ya que con el izquierdo no consigo apoyarme bien.
                    </p>
                  </div>

                  <div className="border-l-[3px] border-pink-300 pl-4 py-1 relative">
                    <div className="absolute -left-[10px] top-1.5 w-4 h-4 bg-[#fff0f6] border-2 border-pink-400 rounded-full" />
                    <h3 className="font-display font-bold text-pink-600 text-lg mb-1">21/10/2026</h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      Bueno anoche me fui de urgencias, ya no aguantaba el dolor… así que cancelé la cita de hoy miércoles porque ya anoche me atendieron en urgencias y me dejaron allá internado hasta media noche con suero, me dieron Tramadol. Según la enfermera es fuerte así que tenía la gota del suero lenta, me sirvió me calmo el dolor y ya puedo caminar, antes caminaba, pero con mucha dificultad. No te niego que aún tengo el dolor, pero más leve, me compre los medicamentos que me mandaron estoy caminando suave. Espero que tu estes mejorando…. <strong className="text-pink-600 font-bold underline">¿Descubriste lo que esconden las letras?</strong>
                    </p>
                  </div>

                  <div className="border-l-[3px] border-pink-300 pl-4 py-1 relative">
                    <div className="absolute -left-[10px] top-1.5 w-4 h-4 bg-[#fff0f6] border-2 border-pink-400 rounded-full" />
                    <h3 className="font-display font-bold text-pink-600 text-lg mb-1">22/10/2026</h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      Bueno ya sabes cómo estoy ya hemos hablado y sabes cómo estoy, no pensé a estar así pero bueno, ahí vamos poco a poco. Lo bueno es que falta poco para tu cumple……. No tengo mucho que escribir ahora……….
                    </p>
                  </div>

                  <div className="border-l-[3px] border-pink-300 pl-4 py-1 relative">
                    <div className="absolute -left-[10px] top-1.5 w-4 h-4 bg-[#fff0f6] border-2 border-pink-400 rounded-full" />
                    <h3 className="font-display font-bold text-pink-600 text-lg mb-1">23/10/2026</h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      2 días menos para tu cumpleaños, recién despierto. Son las 7am y bueno ya desayune y estoy aquí solo en casa, debo hacer tareas pero antes estuve pensando en ti y quise escribir aquí, perdón por haber dicho que me fastidiaba el dolor y todo eso y justo me dijiste que otras personas no pueden caminar, sip tienes razón y te pido perdón, solo que nunca pensé estar así de mal, no taaaaaaaaaaaan mal pero si algo limitado y con dolor, pero voy mejorando gracias a Dios, no he visto tu sonrisa pero que me hables también me calma, he estado hablando con Alfonso y también está pendiente, también hable con nuestra doctora, ya sabes quién.
                    </p>
                  </div>

                  <div className="border-l-[3px] border-pink-300 pl-4 py-1 relative">
                    <div className="absolute -left-[10px] top-1.5 w-4 h-4 bg-[#fff0f6] border-2 border-pink-400 rounded-full" />
                    <h3 className="font-display font-bold text-pink-600 text-lg mb-1">24/10/2026</h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      Sin nada que decir, guardo palabras para el 25…..
                    </p>
                  </div>

                  <div className="border-l-[3px] border-pink-300 pl-4 py-1 relative">
                    <div className="absolute -left-[10px] top-1.5 w-4 h-4 bg-[#fff0f6] border-2 border-pink-400 rounded-full" />
                    <h3 className="font-display font-bold text-pink-600 text-lg mb-1">25/10/2026</h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      No recuerdo hace cuanto naciste jajajajaja creo que vas para 23. Pero hace 11-10 años estoy de amistad contigo y nunca pensé que te vería como te veo ahora, mucho mas madura y como siempre te lo digo mucha mas mujer que cualquiera, amo esa energía de toda una mujer, recíbelo como halago de mi parte, no voy a limitarme a echarte flores, pero tampoco a faltarte el respeto, mírate al espejo lo bella que te ves, lo vales todo, por eso te he dicho que si consigo a alguien, que sea como tú mínimo, sino pues ya vere como me las arreglo estando solo, igual no es malo ( lo dice alguien que sabe que no es así en el fondo ).<br/><br/>
                      Mis recuerdos contigo los tengo en mi corazón, lo que odio es que nunca hemos estado fuera de la iglesia, siempre nos vemos ahí, no es por critica ni nada de eso, pero me gusta ver a las personas fuera de la iglesia también. Como te lo dije, espero algún día podamos tener un día privado y hablar de todo o nada, de otro modo espero que cuando me vaya pueda tener algo de memoria de ti en mi y todo lo que has hecho por mí. Ojalá pudiera abrazarte, a veces me hace falta, pero no puedo hacerlo.<br/><br/>
                      Jamás entendí porque has sido así conmigo, como eres, tú sabes cómo. Nunca lo entendí, ni menos que me dieran tal confianza de dejarme en su casa durante 4 días, o que te guste cantar conmigo en el piano, bueno eso creo.<br/><br/>
                      Voy a hablarte de algo de lo cual yo no soy quien para hacerlo porque no soy figura de autoridad ni nada de eso, solo soy yo. ¿por qué te enamoraste de alguien fuera de tu iglesia? si lo sé, tienes tus razones y es válido, además que nuestros pastores te dieron el aval, pero es algo difícil ¿no? Ya sabes distintas iglesias y todo eso, de este mismo tema hable con Andrea…. Ja si, con ella. Y me conto que hablan de ella solo por tener como novio a alguien del mundo, y yo con ganas de decirle toda su verdad en la cara, pero no podía por mi historia con ella y quizás lo vería como que estoy buscando estar con ella, pero si ella me conto sobre él, contigo tampoco podría hacerlo porque ya sabes que en cierto tiempo me atrajiste pero creo que eres mucho mas madura que ella, que bueno tu misma terminaste con eso ( si perdón si traigo recuerdos de Vietnam ) pero créeme que tu no mereces vivir así, en discusiones y todo eso, no soy quien para decir quien merece qué pero una relación no es así ¿no? No se que es tener una relación, pero no creo que sea vivir así. Perdón una vez más, no debería decirte esto, supongo.<br/><br/>
                      Creo que casi te pierdo cuando me dijiste todo eso cuando paso lo de Gaby, espero lo recuerdes, no puedo creer la manera en que te respondí cuando tú siempre has buscado lo mejor para mí, te pido que me perdones. Trato de mejorar para ti espero lograrlo algún día, y que puedas tener mas recuerdos buenos conmigo que los malos. Creo que voy mejorando, así como Spider-Man, por eso el día del ayuno (dudo que lo recuerdes) cuando estaba colocando tus in-ears y me preguntaste si te podías ir, te dije que sí, pero quisiera que no jajaja, tú y Arley se echaron a reír.<br/><br/>
                      Espero algún día verte con todo lo que sueñas, no se tus sueños y anhelos, pero espero verte con todo eso, así sea de lejos y poder decir que esa mujer me ayudo a ser quien soy y siempre me regaño por mi bien (si mi muje me pega es por mi bien JAJAJAJAJAJAJAJA)<br/><br/>
                      Pondría una foto nuestra aquí, pero creo que no tenemos, menos actual, una vez te pedí una foto y me la rechazaste, igual no soy muy fotogénico y vivo con los recuerdos en mí, creo que eso basta.<br/><br/>
                      Ya hoy es tu cumpleaños, aun estoy pensando como hacerte llegar esto, si por correo o por WhatsApp, debo terminarlo y subirlo a producción para que lo puedas ver, es algo sencillo pero bueno lo hago por ti y pensando en ti. Es chiquito, pero espero te guste, mas la parla que estoy tirando aquí ajajaja.<br/><br/>
                      Feliz Cumpleaños, Blanquita. Dios te de mas años de vida, salud y fuerzas para su servicio pero que sobre todo te llene de su Espíritu Santo, sigue adelante por favor, no me dejes solo. Espero también que se te haya quitado la idea de irte a otra iglesia por lo que has vivido allá en la playa, que estoy seguro que lo sigues viviendo. Pero descansa y ya sabes por donde pasártelo jajajajaja.<br/><br/>
                      Estoy pensando en hacerme el idiota y no felicitarte en todo el día para que te llegue esto en la noche del 25, aunque dudo que lo notes, tienes muchas personas que te van a estar felicitando que dudo que pienses en mi pensando que no te he felicitado. Pero lo hare, en la noche, despues de que vivas tu día con los tuyos, que espero lo pases bien, esto lo estoy terminando antes porque debo terminarlo para unirlo a la carta y subirlo y hacer pruebas para que lo puedas ver bien en tu teléfono, los IPhone son lo peor a la hora de programar para ellos jajaja.<br/><br/>
                      Espero que estes mejor de tu salud, yo ahí voy. “Lento es seguro, seguro es veloz “es una frase de una película llamada “F1 “.<br/><br/>
                      Sin más, deseo lo mejor de lo mejor para ti, Blanquita. Espero verte pronto y que podemos volver a servir juntos tocando un merengazo sabroso o un songo sabrosongo ajajajaja, ya nos veremos Blanquita, Dios te bendiga, vive la vida y ama y nunca te olvides de Dios.
                    </p>
                  </div>

                </div>

                {/* Secret Word Section */}
                <div className="mt-12 p-6 bg-white/40 backdrop-blur-sm rounded-2xl border border-pink-200 shadow-sm flex flex-col items-center gap-4">
                  <p className="text-center text-pink-700 font-medium">
                    Ingresa la palabra clave para descubrir una sorpresa:
                  </p>
                  <input
                    type="text"
                    value={secretWord}
                    onChange={(e) => setSecretWord(e.target.value)}
                    className="px-5 py-2.5 rounded-full border-2 border-pink-300 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-center w-full max-w-[280px] bg-white font-medium tracking-widest text-gray-700 transition-all shadow-inner"
                    placeholder="******** *******"
                  />
                  {secretWord.trim().toLowerCase() === "buscando refugio" && (
                    <div className="w-full mt-4 rounded-xl overflow-hidden shadow-lg border-4 border-white animate-in fade-in zoom-in duration-700">
                      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                        <iframe
                          className="absolute top-0 left-0 w-full h-full"
                          src="https://www.youtube.com/embed/QQZ-FQRGmGM" 
                          title="YouTube video"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <p className="font-display text-center text-pink-600 font-semibold text-lg sm:text-xl mt-5 mb-2 drop-shadow-sm italic">Esto es lo que tu y yo necesitamos</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className={`text-center space-y-2 w-full pb-1 transition-all duration-700 ${
                isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
              style={{ visibility: isOpen ? "visible" : "hidden" }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <div
                  className="h-px flex-1 max-w-[60px]"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, transparent, #f9a8c8, transparent)",
                  }}
                />
                <Cake
                  style={{
                    width: "26px",
                    height: "26px",
                    color: "#c47a3a",
                  }}
                  fill="#ffd70040"
                  strokeWidth={2}
                />
                <div
                  className="h-px flex-1 max-w-[60px]"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, transparent, #f9a8c8, transparent)",
                  }}
                />
              </div>
              <p
                className="font-display font-semibold"
                style={{
                  fontSize: isOpen ? "clamp(1.4rem, 4vw, 2.2rem)" : "1rem",
                  color: "#ff3d83",
                }}
              >
                ¡Que cumplas muchos más!
              </p>
              <p className="text-sm text-gray-500 italic flex items-center justify-center gap-1.5">
                Con mucho cariño
                <Heart
                  style={{
                    width: "1em",
                    height: "1em",
                    color: "#ff3d83",
                    display: "inline-block",
                    verticalAlign: "-0.15em",
                  }}
                  fill="#ff6b9d"
                  strokeWidth={2}
                  className="animate-bounce-gentle"
                />
              </p>
            </div>

            {/* Close button */}
            {isOpen && (
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 rounded-full backdrop-blur-md flex items-center justify-center font-bold shadow-lg transition-all duration-300 hover:scale-110 hover:bg-pink-500 hover:text-white z-50"
                style={{
                  width: "38px",
                  height: "38px",
                  background: "rgba(255,255,255,0.85)",
                  border: "1.5px solid #f9a8c8",
                  color: "#ff3d83",
                }}
                aria-label="Cerrar carta"
              >
                <X style={{ width: "20px", height: "20px" }} strokeWidth={2.8} />
              </button>
            )}
          </div>
        </div>

        
      </div>
    </div>
  );
}
