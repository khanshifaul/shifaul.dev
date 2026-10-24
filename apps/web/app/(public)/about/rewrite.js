const fs = require('fs');

const path = '/run/media/khan/Studio/Projects/MyLab/frontend.shifaul.dev/app/(public)/about/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Inject state
const stateReplacement = `export default function AboutPage() {
  const [frontImage, setFrontImage] = useState(avatars[0]);
  const [backImage, setBackImage] = useState(avatars[1]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentAvatarIndex, setCurrentAvatarIndex] = useState(0);
  const [animType, setAnimType] = useState("flip-h");
  const [quote, setQuote] = useState("");

  const bioRef = useRef(null);
  const expRef = useRef(null);
  const skillsRef = useRef(null);
  const eduRef = useRef(null);
  const promptRef = useRef(null);

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
  }, [bioInView, expInView, skillsInView, eduInView, promptInView]);`;

content = content.replace(/export default function AboutPage\(\) \{\n[\s\S]*?const \[quote, setQuote\] = useState\(""\);/, stateReplacement);

// Remove getAnimate from AboutPage
content = content.replace(/  const getAnimate = \(\) => \{\n[\s\S]*?  \};\n\n/, '');

// Replace the sections manually
content = content.replace(
  `<section className="snap-start min-h-[90vh] flex flex-col justify-center py-12 lg:py-0 lg:min-h-[calc(100vh-8rem)]">`,
  `<section ref={bioRef} className="snap-start min-h-[90vh] flex flex-col lg:flex-row gap-12 lg:gap-16 justify-center py-12 lg:py-0 lg:min-h-[calc(100vh-8rem)]">
              <div className="w-full lg:w-[300px] shrink-0 z-20 flex flex-col items-center justify-start lg:mt-32">
                <div className="block lg:hidden">
                   <MainAvatar layoutId="mobile-avatar" frontImage={frontImage} backImage={backImage} isFlipped={isFlipped} currentAvatarIndex={currentAvatarIndex} animType={animType} avatars={avatars} />
                </div>
                <div className="hidden lg:block w-full flex justify-center">
                   {activeSection === 0 && <MainAvatar layoutId="desktop-avatar" frontImage={frontImage} backImage={backImage} isFlipped={isFlipped} currentAvatarIndex={currentAvatarIndex} animType={animType} avatars={avatars} />}
                </div>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center lg:pt-16">`
);

content = content.replace(
  `<section className="snap-start min-h-[90vh] flex flex-col justify-center py-12 lg:py-24">`,
  `  </div>\n            </section>\n            <section ref={expRef} className="snap-start min-h-[90vh] flex flex-col lg:flex-row gap-12 lg:gap-16 justify-center py-12 lg:py-24">
              <div className="w-full lg:w-[300px] shrink-0 z-20 flex flex-col items-center justify-start hidden lg:flex">
                {activeSection === 1 && <MainAvatar layoutId="desktop-avatar" frontImage={frontImage} backImage={backImage} isFlipped={isFlipped} currentAvatarIndex={currentAvatarIndex} animType={animType} avatars={avatars} />}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">`
);

content = content.replace(
  `<section className="snap-start min-h-[90vh] flex flex-col justify-center py-12 lg:py-24">`,
  `  </div>\n            </section>\n            <section ref={skillsRef} className="snap-start min-h-[90vh] flex flex-col lg:flex-row gap-12 lg:gap-16 justify-center py-12 lg:py-24">
              <div className="w-full lg:w-[300px] shrink-0 z-20 flex flex-col items-center justify-start hidden lg:flex">
                {activeSection === 2 && <MainAvatar layoutId="desktop-avatar" frontImage={frontImage} backImage={backImage} isFlipped={isFlipped} currentAvatarIndex={currentAvatarIndex} animType={animType} avatars={avatars} />}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">`
);

content = content.replace(
  `<section className="snap-start min-h-[90vh] flex flex-col justify-center py-12 lg:py-24">`,
  `  </div>\n            </section>\n            <section ref={eduRef} className="snap-start min-h-[90vh] flex flex-col lg:flex-row gap-12 lg:gap-16 justify-center py-12 lg:py-24">
              <div className="w-full lg:w-[300px] shrink-0 z-20 flex flex-col items-center justify-start hidden lg:flex">
                {activeSection === 3 && <MainAvatar layoutId="desktop-avatar" frontImage={frontImage} backImage={backImage} isFlipped={isFlipped} currentAvatarIndex={currentAvatarIndex} animType={animType} avatars={avatars} />}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">`
);

content = content.replace(
  `<section className="snap-start min-h-[50vh] flex flex-col justify-center py-12 lg:py-24 items-center">`,
  `  </div>\n            </section>\n            <section ref={promptRef} className="snap-start min-h-[50vh] flex flex-col lg:flex-row gap-12 lg:gap-16 justify-center py-12 lg:py-24 items-center">
              <div className="w-full lg:w-[300px] shrink-0 z-20 flex flex-col items-center justify-start hidden lg:flex">
                {activeSection === 4 && <MainAvatar layoutId="desktop-avatar" frontImage={frontImage} backImage={backImage} isFlipped={isFlipped} currentAvatarIndex={currentAvatarIndex} animType={animType} avatars={avatars} />}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center items-center">`
);

// Remove the old sticky sidebar
content = content.replace(/          \{\/\* Left Sidebar: Sticky Image \*\/\}[\s\S]*?          \{\/\* Right Scrolling Content \*\/\}[\s\S]*?          <div className="flex-1 w-full flex flex-col min-w-0">/, `          <div className="flex flex-col min-w-0 w-full">`);

// Replace the last section's closing tags.
content = content.replace(
  `                </motion.p>\n              </div>\n            </section>\n          </div>\n        </div>`,
  `                </motion.p>\n              </div>\n            </section>\n          </div>\n        </div>`
);

fs.writeFileSync(path, content, 'utf8');
