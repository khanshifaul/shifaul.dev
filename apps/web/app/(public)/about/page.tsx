"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";
import { Backgrounds } from "@/components/common/Backgrounds";
import { Globe } from "@/components/common/Globe";

import {
  FaFilePdf,
  FaTerminal,
  FaHandPointer,
  FaAnglesDown
} from "react-icons/fa6";
import Link from "next/link";
import Image from "next/image";
import { RadarSweep } from "@/components/common/RadarSweep";

const Typewriter = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [currentText, setCurrentText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (index < text.length) {
        setCurrentText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }
    }, 20 + Math.random() * 30);
    return () => clearTimeout(timeout);
  }, [index, text]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="text-zinc-950 dark:text-white"
    >
      {currentText}
      {index < text.length && <span className="animate-pulse">|</span>}
    </motion.span>
  );
};

const SectionHeader = ({ command, filename }: { command: string; filename: string }) => (
  <div className="flex items-start gap-3 md:gap-4 mb-6 md:mb-8">
    <span className="text-green-500 font-bold mt-1 md:mt-1.5 text-[10px] md:text-base">$</span>
    <h2 className="text-sm sm:text-lg md:text-3xl font-black text-zinc-950 dark:text-white tracking-tighter sm:tracking-tight break-all sm:break-normal flex flex-wrap">
      <span className="text-green-500/80 mr-2">{command}</span>
      <Typewriter text={filename} />
    </h2>
  </div>
);

const SkillGroup = ({ title, skills, color = "green" }: { title: string; skills: string[]; color?: "green" | "cyan" | "orange" | "yellow" }) => {
  const colorMap = {
    green: "text-green-500",
    cyan: "text-cyan-500",
    orange: "text-orange-500",
    yellow: "text-yellow-500"
  };
  const dotColor = {
    green: "text-green-500/40",
    cyan: "text-cyan-500/40",
    orange: "text-orange-500/40",
    yellow: "text-yellow-500/40",
  };

  return (
    <div className="space-y-4">
      <h3 className={`${colorMap[color]} text-[10px] font-bold tracking-[0.2em] uppercase border-b border-zinc-800 pb-2`}>
        /{title}
      </h3>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
        {skills.map((skill, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 text-xs md:text-sm"
          >
            <span className={dotColor[color]}>{color === 'yellow' ? '*' : `[${i}]`}</span> {skill}
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

const hireTemplate = `I am interested in collaborating with you on a new project.

Project Type: [e.g. SaaS, E-commerce, AI Integration]
Timeline: [e.g. ASAP, 3 Months]
Budget Range: [Optional]
Brief Description: [Your project vision...]

Looking forward to your response!`;

const encodedTemplate = encodeURIComponent(hireTemplate);

const avatars = [
  "/images/anime_avatar.png",
  "/images/coder_avatar.png",
  "/images/cyberpunk_terminal_avatar.png",
  "/images/matrix_avatar.png",
  "/images/matrix_code_avatar.png",
  "/images/neural_network_avatar.png",
];

const realImages = [
  "/images/shifaul-0.png",
  "/images/shifaul-1.png"
];

const animationTypes = ["flip-h", "glitch", "slide", "crt-blink"];
// const animationTypes = ["crt-blink"];

const quotes = [
  "Building the future, one neural signal at a time.",
  "Bridging the gap between human thought and digital action.",
  "Architecting robust systems for the decentralized web.",
  "Dreaming in binary, building in reality.",
  "Simplicity is the soul of efficiency.",
  "The best way to predict the future is to build it.",
  "Automating the present to engineer the future.",
  "Code is the language of modern creation.",
  "Code is poetry in a digital world.",
  "Debugging: being a detective in your own movie.",
  "Keep calm and trust the Next.js.",
  "Ship code, stay humble.",
  "Clean code is a love letter to your future self.",
  "Localhost is where the magic happens.",
  "Docker: because 'it works on my machine' fails.",
  "Build systems that outlast the hype.",
  "Web dev: turning coffee into components.",
  "Scalability is not an afterthought.",
  "Problems are just puzzles in disguise.",
  "Think twice, code once.",
  "Systems run businesses; people run systems."
];

const RobotChatBlob = () => {
  const [chatState, setChatState] = useState({
    text: "INIT_ROBOT.sh...",
    pos: {
      posClass: "absolute -top-20 left-1/2 -translate-x-1/2",
      tailClass: "absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-950/90 border-b border-r border-green-500/50 transform rotate-45"
    },
    angle: "rotate-0"
  });

  useEffect(() => {
    const messages = [
      "010110010...",
      "SYSTEM_ERROR...",
      "ANALYZING_VISITOR...",
      "BZZZT...HELLO?",
      "UNDEFINED_BEHAVIOR",
      "FETCHING_COFFEE...",
      "SEGMENTATION_FAULT",
      "GIBBERISH_OUTPUT...",
      "404_BRAIN_NOT_FOUND",
      "WHY_ARE_WE_HERE?",
      "LOADING_HUMAN_EMOTION...",
      "HELLO_WORLD.exe"
    ];

    const positions = [
      { posClass: "absolute -top-20 left-1/2 -translate-x-1/2", tailClass: "absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-950/90 border-b border-r border-green-500/50 transform rotate-45" },
      { posClass: "absolute -bottom-20 left-1/2 -translate-x-1/2", tailClass: "absolute -top-[9px] left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-950/90 border-t border-l border-green-500/50 transform rotate-45" },
      { posClass: "absolute top-1/2 -left-[180px] -translate-y-1/2", tailClass: "absolute top-1/2 -right-[9px] -translate-y-1/2 w-4 h-4 bg-zinc-950/90 border-t border-r border-green-500/50 transform rotate-45" },
      { posClass: "absolute -top-12 -left-32", tailClass: "absolute -bottom-[9px] right-8 w-4 h-4 bg-zinc-950/90 border-b border-r border-green-500/50 transform rotate-45" },
      { posClass: "absolute -bottom-12 -left-32", tailClass: "absolute -top-[9px] right-8 w-4 h-4 bg-zinc-950/90 border-t border-l border-green-500/50 transform rotate-45" }
    ];

    const angles = ["rotate-0", "-rotate-2", "rotate-2", "-rotate-6", "rotate-6", "-rotate-12", "rotate-12"];

    const interval = setInterval(() => {
      setChatState({
        text: messages[Math.floor(Math.random() * messages.length)],
        pos: positions[Math.floor(Math.random() * positions.length)],
        angle: angles[Math.floor(Math.random() * angles.length)]
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${chatState.pos.posClass} ${chatState.angle} z-50 hidden lg:flex flex-col bg-zinc-950/90 backdrop-blur-md border border-green-500/50 px-4 py-3 rounded-xl text-green-500 font-mono text-[11px] shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all duration-700 ease-in-out w-max`}
    >
      <div className="flex items-start text-green-400 leading-relaxed">
        <span className="text-green-500/50 mr-2 mt-[1px]">›</span>
        <div className="relative whitespace-nowrap">
          <span className="invisible">{chatState.text}</span>
          <span className="absolute top-0 left-0">
            <Typewriter key={chatState.text} text={chatState.text} />
          </span>
        </div>
      </div>
      <div className={`${chatState.pos.tailClass} transition-all duration-700 ease-in-out`} />
    </motion.div>
  );
};

const MainAvatar = ({ layoutId, frontImage, backImage, isFlipped, currentAvatarIndex, animType, avatars }: any) => {
  const getAnimate = () => {
    switch (animType) {
      case "flip-h": return { rotateY: isFlipped ? 180 : 0 };
      case "flip-v": return { rotateX: isFlipped ? 180 : 0 };
      case "pulse": return { scale: isFlipped ? 1.05 : 1, opacity: isFlipped ? 0.8 : 1 };
      case "glitch": return {
        x: isFlipped ? [0, -5, 5, -2, 2, 0] : 0,
        opacity: [1, 0.4, 0.8, 1]
      };
      case "slide": return { rotate: isFlipped ? [0, 2, 0] : [0, -2, 0] };
      case "crt-blink": return {
        scaleY: [1, 0.02, 0.02, 0.02, 1],
        scaleX: [1, 1, 0, 1, 1],
        opacity: [1, 1, 0, 1, 1],
        filter: [
          "brightness(1) contrast(1)",
          "brightness(2) contrast(2)",
          "brightness(10) contrast(5)",
          "brightness(2) contrast(2)",
          "brightness(1) contrast(1)"
        ]
      };
      default: return { rotateY: isFlipped ? 180 : 0 };
    }
  };

  return (
    <motion.div
      layoutId={layoutId}
      className="relative shrink-0 w-48 h-48 md:w-64 md:h-64 [perspective:1000px]"
      transition={{ type: "spring", stiffness: 40, damping: 20 }}
    >
      <div className="absolute -inset-4 bg-green-500/5 blur-3xl rounded-full shadow-[0_0_20px_10px_rgba(34,247,90)] shadow-green-500" />
      <motion.div animate={getAnimate()} transition={{ duration: 0.8, ease: "easeInOut" }} className="relative w-full h-full [transform-style:preserve-3d] rounded-full overflow-hidden">
        <motion.div animate={animType === 'slide' ? { x: isFlipped ? '100%' : '0%', opacity: isFlipped ? 0 : 1 } : {}} transition={{ duration: 0.8, ease: "easeInOut" }} className={`absolute rounded-full inset-0 [backface-visibility:hidden] ${isFlipped && animType !== 'slide' ? 'pointer-events-none' : ''}`}>
          <Image src={frontImage} alt="Front Profile" fill className={`w-full h-full ${animType === 'slide' ? 'rounded-none border-none' : 'rounded-full border-2'} object-cover transition-all duration-700 ${frontImage.includes('shifaul') ? 'border-white/20' : 'border-green-500/40  grayscale'}`} />
          {!frontImage.includes('shifaul') && <div className={`absolute inset-0 ${animType === 'slide' ? 'rounded-none' : 'rounded-full'} bg-linear-to-t from-green-500/20 to-transparent pointer-events-none`} />}
        </motion.div>
        <motion.div animate={animType === 'slide' ? { x: isFlipped ? '0%' : '-100%', opacity: isFlipped ? 1 : 0 } : { rotateY: 180 }} transition={{ duration: 0.8, ease: "easeInOut" }} className={`absolute rounded-full inset-0 [backface-visibility:hidden] ${!isFlipped && animType !== 'slide' ? 'pointer-events-none' : ''}`}>
          <Image src={backImage} alt="Back Profile" fill className={`w-full h-full ${animType === 'slide' ? 'rounded-none border-none' : 'rounded-full border-2'} object-cover transition-all duration-700 ${backImage.includes('shifaul') ? 'border-white/20' : 'border-green-500/40  grayscale'}`} />
          {!backImage.includes('shifaul') && <div className={`absolute inset-0 ${animType === 'slide' ? 'rounded-none' : 'rounded-full'} bg-linear-to-t from-green-500/20 to-transparent pointer-events-none`} />}
        </motion.div>
      </motion.div>
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
        {avatars.map((_: any, i: number) => <div key={i} className={`h-1 rounded-full transition-all duration-700 ${i === currentAvatarIndex ? 'w-2 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'w-1 bg-zinc-800'}`} />)}
      </div>
      <RobotChatBlob />
    </motion.div>
  );
};

export default function AboutPage() {
  const [frontImage, setFrontImage] = useState(avatars[0]);
  const [backImage, setBackImage] = useState(avatars[1]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentAvatarIndex, setCurrentAvatarIndex] = useState(0);
  const [animType, setAnimType] = useState("flip-h");
  const [quote, setQuote] = useState("");

  const bioRef = useRef<HTMLElement>(null);
  const expRef = useRef<HTMLElement>(null);
  const skillsRef = useRef<HTMLElement>(null);
  const eduRef = useRef<HTMLElement>(null);
  const promptRef = useRef<HTMLElement>(null);

  const bioInView = useInView(bioRef, { margin: "-50% 0px -50% 0px" });
  const expInView = useInView(expRef, { margin: "-50% 0px -50% 0px" });
  const skillsInView = useInView(skillsRef, { margin: "-50% 0px -50% 0px" });
  const eduInView = useInView(eduRef, { margin: "-50% 0px -50% 0px" });
  const promptInView = useInView(promptRef, { margin: "-50% 0px -50% 0px" });

  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    if (bioInView) setActiveSection(0);
    else if (expInView) setActiveSection(1);
    else if (skillsInView) setActiveSection(2);
    else if (eduInView) setActiveSection(3);
    else if (promptInView) setActiveSection(4);
  }, [bioInView, expInView, skillsInView, eduInView, promptInView]);

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextAnim = animationTypes[Math.floor(Math.random() * animationTypes.length)];
      setAnimType(nextAnim);
      setIsFlipped((prev) => !prev);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const sideToUpdate = isFlipped ? "front" : "back";

    const updateHiddenSide = () => {
      const visibleImage = isFlipped ? backImage : frontImage;
      const isRealChance = Math.random() > 0.7; // 30% chance for real portrait
      let nextImage = "";

      // Keep picking until we get a different image
      while (true) {
        if (isRealChance) {
          const nextRealIdx = Math.floor(Math.random() * realImages.length);
          const pickedReal = realImages[nextRealIdx];
          if (pickedReal !== visibleImage) {
            nextImage = pickedReal;
            break;
          }
        } else {
          const nextIdx = Math.floor(Math.random() * avatars.length);
          const pickedAvatar = avatars[nextIdx];
          if (pickedAvatar !== visibleImage) {
            nextImage = pickedAvatar;
            setCurrentAvatarIndex(nextIdx);
            break;
          }
        }

        // Safety break if we get stuck (e.g. only one image exists)
        if (realImages.length + avatars.length <= 1) break;

        // If we picked Real but it's the same, or only one real exists and it's visible, 
        // try an avatar instead for variety
        if (isRealChance && visibleImage.includes('shifaul')) {
          const nextIdx = Math.floor(Math.random() * avatars.length);
          nextImage = avatars[nextIdx];
          setCurrentAvatarIndex(nextIdx);
          break;
        }
      }

      if (sideToUpdate === "front") setFrontImage(nextImage);
      else setBackImage(nextImage);
    };

    const timeout = setTimeout(updateHiddenSide, 400); // Update when flipped away
    return () => clearTimeout(timeout);
  }, [isFlipped, frontImage, backImage]);

  return (
    <div className="relative font-mono text-zinc-800 dark:text-zinc-400 selection:bg-green-500/30">
      <div className="fixed inset-0 pointer-events-none">
        <Backgrounds />
        <Globe />
        <RadarSweep />

      </div>

      <div className="relative z-10 w-full pb-32 max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start relative pt-12 md:pt-24">

          {/* Left Sidebar: Sticky Image (Desktop Only) */}
          <div className="hidden lg:flex w-[300px] shrink-0 sticky top-32 z-20 flex-col items-center">
            <MainAvatar layoutId="desktop-avatar" frontImage={frontImage} backImage={backImage} isFlipped={isFlipped} currentAvatarIndex={currentAvatarIndex} animType={animType} avatars={avatars} />

            {/* Arrow to next section */}
            {activeSection < 4 && (
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="mt-48 cursor-pointer flex flex-col items-center gap-2 text-green-500/70 hover:text-green-500 transition-colors group"
                onClick={() => {
                  const sections = [bioRef, expRef, skillsRef, eduRef, promptRef];
                  const nextIndex = activeSection + 1;
                  if (nextIndex < sections.length) {
                    sections[nextIndex].current?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <span className="text-[10px] font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">Scroll Down</span>
                <FaAnglesDown className="text-3xl drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              </motion.div>
            )}
          </div>

          {/* Right Content */}
          <div className="flex-1 min-w-0 flex flex-col w-full">
            {/* Bio Section */}
            <section ref={bioRef} className="snap-start min-h-[90vh] flex flex-col justify-center py-12 lg:py-0 lg:min-h-[calc(100vh-8rem)]">
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                {/* Mobile-only avatar inside Bio Section */}
                <div className="w-full flex justify-center lg:hidden mb-8 mt-8">
                  <MainAvatar layoutId="mobile-avatar" frontImage={frontImage} backImage={backImage} isFlipped={isFlipped} currentAvatarIndex={currentAvatarIndex} animType={animType} avatars={avatars} />
                </div>
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-2 text-zinc-600 text-[10px] md:text-xs font-bold tracking-widest">
                    <div className="flex gap-1.5 mr-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
                    </div>
                    <span>guest@shifaul.dev: ~ (zsh)</span>
                  </div>
                  <SectionHeader command="cat" filename="professional_summary.md" />
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-4 text-sm md:text-lg leading-relaxed"
                  >
                    <p>
                      I’m <span className="text-zinc-950 dark:text-white font-bold underline decoration-green-500/30 underline-offset-4 decoration-2">Md Shifaul Islam</span>, a dedicated Full Stack Web Developer with <span className="text-green-600 dark:text-green-500 font-bold">3+ years</span> of experience building user-centric applications.
                    </p>
                    <p className="text-zinc-700 dark:text-zinc-400 text-sm md:text-base">
                      Specializing in the <span className="text-zinc-950 dark:text-white font-bold">Next.js</span> and <span className="text-zinc-950 dark:text-white font-bold">NestJS</span> ecosystem, I excel at architecting robust, high-performance systems—from SaaS commerce platforms to secure enterprise solutions.
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-500 text-sm md:text-base border-l-2 border-green-600/30 dark:border-zinc-800 pl-4 py-1">
                      My vision is to bridge the gap between human thought and digital action through AI/ML and Brain-Computer Interfaces.
                    </p>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-4 pt-4 border-t border-zinc-900">
                      <div className="flex items-center gap-3">
                        <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest whitespace-nowrap">Current Status</div>
                        <div className="text-[10px] md:text-xs text-green-500 font-bold px-2 py-0.5 border border-green-500/20 bg-green-500/5 rounded animate-pulse whitespace-nowrap">
                          OPEN_FOR_HIRE
                        </div>
                      </div>

                      <div className="hidden sm:block h-3 w-[1px] bg-zinc-800" />

                      <Link
                        href={`/contact?message=${encodedTemplate}`}
                        className="flex items-center gap-2 text-xs text-green-500/80 hover:text-green-500 transition-colors group animate-flicker"
                      >
                        <FaTerminal className="text-[10px]" />
                        <span className="font-bold underline decoration-green-500/30 underline-offset-4 decoration-dashed group-hover:decoration-solid transition-all">
                          INIT_HIRE_REQUEST.sh
                        </span>
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* Experience Section */}
            <section ref={expRef} className="snap-start min-h-[90vh] flex flex-col justify-center py-12 lg:py-24">
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="w-full">
                  <SectionHeader command="ls" filename="~/work_history" />
                  <div className="space-y-12 pl-8 border-l border-zinc-900">
                    {[
                      {
                        role: "Full Stack Web Developer",
                        company: "ExpressITbd",
                        type: "Full-time",
                        period: "Oct'25 – Apr'26",
                        points: [
                          "Architected SaaS Platforms (CalQuick/PixlyOne)",
                          "Optimized production infrastructure & pipelines"
                        ]
                      },
                      {
                        role: "Frontend Developer",
                        company: "ExpressITbd",
                        type: "Full-time",
                        period: "Mar'25 – Oct'25",
                        points: [
                          "Built responsive Next.js storefronts & dashboards",
                          "Integrated tracking & analytics (sGTM/GTM)"
                        ]
                      },
                      {
                        role: "Full Stack Web Developer",
                        company: "Rufaida EnterPrise",
                        type: "Contractual | Remote",
                        period: "May'25 – July'25",
                        points: [
                          "Optimized WordPress production frontend & UI/UX"
                        ]
                      },
                      {
                        role: "Full Stack Web Developer",
                        company: "Fixtrack",
                        type: "Contractual | Remote",
                        period: "Dec'24 – Feb'25",
                        points: [
                          "Bakers Bay: Next.js & Prisma inventory system"
                        ]
                      },
                      {
                        role: "Full Stack Web Developer",
                        company: "MediGadget",
                        type: "Contractual | Remote",
                        period: "Jan'25 – Feb'25",
                        points: [
                          "E-commerce platform with GraphQL & AuthJS"
                        ]
                      },
                      {
                        role: "Freelance Virtual Assistant",
                        company: "UpWork",
                        type: "Self-Employed | Remote",
                        period: "2019 – 2021",
                        points: [
                          "Lead generation & Data mining for global clients",
                          "4.7/5 Rating | 95% Accuracy"
                        ]
                      },
                      {
                        role: "Computer Operator",
                        company: "Emon Computer, Dhaka",
                        type: "Full-time",
                        period: "Sep'24 – Feb'25",
                        points: [
                          "Graphic design & system troubleshooting"
                        ]
                      },
                      {
                        role: "Computer Operator",
                        company: "Hasan Computer & Studio",
                        type: "Full-time",
                        period: "2019 – 2023",
                        points: [
                          "Document processing & VAT/Tax applications"
                        ]
                      },
                      {
                        role: "Computer Operator",
                        company: "Progress Education Family",
                        type: "Full-time",
                        period: "Feb'22 – Aug'22",
                        points: [
                          "Exam processing & workflow digitization"
                        ]
                      }
                    ].map((job, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative"
                      >
                        <div className="absolute -left-10 top-2 w-4 h-4 bg-zinc-950 dark:bg-black border border-green-500/30 rounded-full" />
                        <div className="flex flex-col md:flex-row md:items-baseline gap-2 mb-2">
                          <span className="text-zinc-950 dark:text-white font-black text-sm md:text-lg uppercase tracking-tight">{job.role}</span>
                          <span className="text-green-500 font-bold text-xs">@{job.company} [{job.type}]</span>
                          <span className="text-[9px] text-zinc-500 font-black ml-auto uppercase tracking-widest">{job.period}</span>
                        </div>
                        <ul className="grid gap-1 opacity-60">
                          {job.points.map((p, j) => (
                            <li key={j} className="text-xs flex items-start gap-2">
                              <span className="text-green-500/40 font-bold">»</span> {p}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Skills Section */}
            <section ref={skillsRef} className="snap-start min-h-[90vh] flex flex-col justify-center py-12 lg:py-24">
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="w-full">
                  <SectionHeader command="grep" filename="--all-capabilities" />
                  <div className="grid grid-cols-1 gap-x-16 gap-y-6 pl-8">
                    <SkillGroup
                      title="Core Protocols"
                      skills={["Python", "JavaScript (ES6+)", "TypeScript", "PHP", "C++ / MicroPython", "Rust"]}
                    />
                    <SkillGroup
                      title="Frontend Systems"
                      skills={["React.js / Next.js", "Vue.js / Nuxt.js", "Tailwind CSS / Bootstrap", "Redux / Vuex", "Framer Motion / GSAP"]}
                      color="cyan"
                    />
                    <SkillGroup
                      title="Backend Architectures"
                      skills={["Node.js / NestJS", "REST API / GraphQL", "OAuth / JWT", "WebSockets / Socket.io", "Microservices"]}
                      color="orange"
                    />
                    <SkillGroup
                      title="Data Persistence"
                      skills={["PostgreSQL / Prisma", "MongoDB / Mongoose", "Redis Cache", "Supabase / Firebase", "Vector Databases"]}
                    />
                    <SkillGroup
                      title="DevOps & QA"
                      skills={["Git / GitHub", "Docker / Nginx", "CI/CD (Vercel)", "Selenium / BeautifulSoup", "Jest / Playwright / Cypress"]}
                      color="cyan"
                    />
                    <SkillGroup
                      title="Neural Networks & AI"
                      skills={["Langchain / Ollama", "Hugging Face Hub", "PyTorch / TensorFlow", "OpenAI API Integration", "Computer Vision"]}
                      color="orange"
                    />
                    <SkillGroup
                      title="Cyber-Physical Systems"
                      skills={["Arduino / ESP32", "IoT Architectures", "MQTT Protocol", "Raspberry Pi", "Firmware Development"]}
                      color="yellow"
                    />
                    <SkillGroup
                      title="Creative & Tools"
                      skills={["Figma / Webflow", "Adobe PS / Illustrator", "After Effects", "MS Office / Google Workspace"]}
                      color="yellow"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Education & Languages */}
            <section ref={eduRef} className="snap-start min-h-[90vh] flex flex-col justify-center py-12 lg:py-24">
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-16">
                  <div>
                    <SectionHeader command="cat" filename="education_certs.md" />
                    <div className="space-y-8 pl-8">
                      <div>
                        <div className="text-zinc-950 dark:text-white font-bold tracking-tight">Diploma in Engineering</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-600 font-bold mb-2">Technical Board | Computer Technology | 2024</div>
                        <div className="text-green-500 font-black text-sm tracking-widest">CGPA: 3.60/4.00</div>
                      </div>
                      <div>
                        <div className="text-zinc-950 dark:text-white font-bold tracking-tight">Secondary School Certificate</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-600 font-bold mb-2">Rajshahi Board | Science | 2015</div>
                        <div className="text-green-500 font-black text-sm tracking-widest">GPA: 5.00/5.00</div>
                      </div>
                      <div className="pt-4 space-y-2">
                        <h3 className="text-[10px] text-zinc-400 dark:text-zinc-800 font-bold uppercase tracking-[0.3em]">Certifications & Specialized Training</h3>
                        {[
                          "Scalable NestJS Architectures",
                          "TypeScript 5 for Large-Scale Enterprise Systems",
                          "Clean Code & SOLID Principles (Clean Coders Series)",
                          "Advanced React Design Patterns & SSR Mastery",
                          "Modern API Architectures (REST, GraphQL, gRPC)",
                          "Brain-Computer Interface (BCI) Research Summary",
                          "Vue 3 & Laravel Enterprise Integration",
                          "Advanced MERN Stack Development",
                          "Ethical Hacking & Web Penetration Testing"
                        ].map(c => (
                          <div key={c} className="text-sm opacity-60 flex items-center gap-2">
                            <span className="text-green-500/40 font-bold">»</span> {c}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <SectionHeader command="locale" filename="-a" />
                    <div className="space-y-4 pl-8">
                      {[
                        { lang: "Bengali", level: "Native" },
                        { lang: "English", level: "Fluent" },
                        { lang: "Hindi", level: "Conversational" },
                        { lang: "Russian", level: "Elementary" },
                      ].map((l, i) => (
                        <div key={i} className="flex justify-between items-end border-b border-zinc-900 pb-2">
                          <span className="text-white font-bold text-zinc-950 dark:text-white">{l.lang}</span>
                          <span className="text-xs text-zinc-600 italic">{l.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Final Prompt */}
            <section ref={promptRef} className="snap-start min-h-[50vh] py-12 lg:py-24 flex items-center">
              <div className="w-full max-w-2xl text-center space-y-8 mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="relative mb-12 inline-block"
                >
                  <Link
                    href="https://drive.google.com/file/d/1CQANMdMg4F62qqAmTx-6m0BrvrfFnhIh/view?usp=sharing"
                    className="inline-flex relative items-center gap-2 px-6 py-2 border border-green-500/30 bg-green-500/5 hover:bg-green-500/20 text-green-500 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 group"
                  >
                    <FaFilePdf className="text-sm group-hover:scale-110 transition-transform" />
                    Fetch_Resume.sh
                  </Link>
                  <motion.div
                    animate={{ y: [0, 8, 0], scale: [1, 0.9, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -right-1 -bottom-4 text-green-400 group-hover:text-green-300 pointer-events-none drop-shadow-[0_0_8px_rgba(34,197,94,0.8)] z-10"
                  >
                    <FaHandPointer className="text-2xl" />
                  </motion.div>
                </motion.div>

                <motion.div
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-green-500 text-xl md:text-3xl font-black tracking-tighter"
                >
                  guest@shifaul.dev: ~ $ EXIT_
                </motion.div>
                <motion.p
                  key={quote}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-zinc-700 text-[10px] md:text-xs tracking-widest uppercase font-bold min-h-[1em]"
                >
                  "{quote}"
                </motion.p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
