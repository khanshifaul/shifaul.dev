import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "View the resume of Md Shifaul Islam, a full-stack web developer building production applications with Next.js, NestJS, and TypeScript.",
  alternates: { canonical: "https://www.shifaul.dev/resume" },
  openGraph: {
    title: "Resume — Md Shifaul Islam",
    description:
      "View the resume of Md Shifaul Islam, a full-stack web developer building production applications with Next.js, NestJS, and TypeScript.",
    url: "https://www.shifaul.dev/resume",
    type: "profile",
    images: ["/og-cover.jpeg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume — Md Shifaul Islam",
    description:
      "View the resume of Md Shifaul Islam, a full-stack web developer building production applications with Next.js, NestJS, and TypeScript.",
    images: ["/og-cover.jpeg"],
  },
};


export default function Resume() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-2">
      {/* Page 1 */}
      <div className="bg-white shadow-lg max-w-[8.5in] max-h-[11.5in] min-h-[11.5in] p-[0.5in]">
        <header className="">
          <h1 className="text-3xl font-bold">Md Shifaul Islam</h1>
          <h2 className="text-xl font-semibold text-gray-600">
            Full Stack Web Developer
          </h2>

          <div className="grid grid-cols-1 text-sm">
            <div>
              <span className="font-semibold">Address:</span> 405/A, West
              Shewrapara, Mirpur-1216, Dhaka
            </div>
            <div>
              <span className="font-semibold">Mobile:</span> (+88) 01701005355
              (WhatsApp)
            </div>
            <div>
              <span className="font-semibold">E-mail:</span>
              khanshifaul@gmail.com
            </div>
            <div>
              <span className="font-semibold">Portfolio:</span>
              <a
                href="https://khanshifaul.vercel.app"
                target="_blank"
                className="text-blue-600 hover:underline ml-1"
              >
                khanshifaul.vercel.app
              </a>
            </div>
            <div>
              <span className="font-semibold">GitHub:</span>
              <a
                href="https://github.com/khanshifaul"
                target="_blank"
                className="text-blue-600 hover:underline ml-1"
              >
                github.com/khanshifaul
              </a>
            </div>
            <div>
              <span className="font-semibold">LinkedIn:</span>
              <a
                href="https://linkedin.com/in/khan-shifaul"
                target="_blank"
                className="text-blue-600 hover:underline ml-1"
              >
                linkedin.com/in/khan-shifaul
              </a>
            </div>
          </div>
        </header>

        <Section title="Career Summary">
          <ul className="list-disc pl-4 text-justify">
            <li>
              Started as a Computer Operator while pursuing my Diploma, gaining
              experience in technical support, documentation, and office
              efficiency.
            </li>
            <li>
              Worked as a freelance Virtual Assistant, specializing in data
              entry, web scraping, and administrative support, enhancing my
              technical skills.
            </li>
            <li>
              Transitioned into Full Stack Web Development, building scalable,
              user-centric web applications, including CMS, e-commerce
              platforms.
            </li>
            <li>
              Currently expanding expertise in Artificial Intelligence, aiming
              to become an AI Application Developer, with a focus on building
              AI-driven solutions.
            </li>
          </ul>
        </Section>

        <Section title="Career Objective">
          <p className="text-justify">
            I am committed to building a dynamic career as a Full Stack Web
            Developer, constantly refining my technical expertise and staying
            ahead of emerging technologies. My passion for web development is
            matched by a strong interest in Artificial Intelligence, where I am
            expanding my knowledge to create cutting-edge, AI-driven
            applications. With a diverse skill set spanning web development, AI,
            and embedded systems, I aim to craft innovative, user-centric
            solutions that drive digital transformation and contribute to the
            evolution of tech.
          </p>
        </Section>

        <div className="flex flex-col gap-2">
          <Section title="Technical Skills">
            <SkillList
              items={[
                "Programming Languages: Python, JavaScript, TypeScript, PHP",
                "Frontend: React.js, Vue.js, Next.js, Nuxt.js, Tailwind CSS, Bootstrap, Redux/Vuex",
                "Backend: Node.js, Django, REST API, GraphQL, OAuth/JWT",
                "Databases & ORM: PostgreSQL, MongoDB, Prisma",
                "Design & Prototyping: Figma, Webflow, GSAP, Framer-Motion, Adobe Photoshop & Illustrator",
                "AI/ML Development: Langchain, Hugging Face, Ollama, PyTorch, TensorFlow",
                "Embedded Systems & IoT: Arduino, ESP32, MicroPython",
                "Automation & Testing: Selenium, BeautifulSoup, Jest, Cypress",
                "Version Control & CI/CD: Git, GitHub, Vercel",
                "Productivity Tools: Microsoft Office Suite (Excel, Word), Google Workspace",
              ]}
            />
          </Section>

          <Section title="Soft Skills">
            <SkillList
              items={[
                "Problem Solving, Adaptability, Collaboration",
                "Communication, Time Management, Client-Centric Mindset",
                "Continuous Learning, Attention to Detail",
                "Analytical Thinking | Resilience | Initiative",
              ]}
            />
          </Section>
        </div>
      </div>

      {/* Page 2 */}
      <div className=" bg-white shadow-lg max-w-[8.5in] max-h-[11.5in] min-h-[11.5in] p-[0.5in]">
        <Section title="Job Experience">
          <div className="">
            <div>
              <h4 className="font-semibold">Computer Operator</h4>
              <div className=" ml-4">
                <div className="">
                  <p className="font-medium">
                    Hasan Computer & Digital Studio, Bogura (Mar’19 – Jan’22 |
                    Sep’22 – Oct’23)
                  </p>
                  <ul className="list-disc pl-6 ">
                    <li>
                      Delivered customer service: document/spreadsheet typing,
                      graphics design, and troubleshooting & resolving PC/laptop
                      issues
                    </li>
                    <li>
                      Processed online applications and managed printing
                      services
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="font-medium">
                    Progress Education Family, Bogura (Feb’22 – Aug’22)
                  </p>
                  <ul className="list-disc pl-6 ">
                    <li>
                      Streamlined exam result processing and student database
                      management, enhancing accuracy and efficiency
                    </li>
                    <li>
                      Digitized administrative workflows and standardized lesson
                      documentation, ensuring consistency across subjects
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="font-medium">
                    Emon Computer, Dhaka (Feb’24 – Present)
                  </p>
                  <ul className="list-disc pl-6 ">
                    <li>
                      Delivered customer service: document/spreadsheet typing,
                      graphics design, and troubleshooting & resolving PC/laptop
                      issues
                    </li>
                    <li>
                      Processed online applications (visa, VAT/tax returns) and
                      managed printing services
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold ">Full Stack Web Developer</h4>
              <div className=" ml-4">
                <div>
                  <p className="font-medium">
                    Fixtrack [Contractual | Remote] (Dec’24 – Present)
                  </p>
                  <ul className="list-disc pl-6 ">
                    <li>
                      Built Bakers Bay: Scalable inventory/sales management
                      system for bakeries using Next.js, Node.js, Express,
                      Prisma, and role-based auth
                    </li>
                    <li>
                      Streamlined backend operations with Prisma ORM, reducing
                      data query latency by 30%, and designing responsive UI
                      using Tailwind CSS
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="font-medium">
                    MediGadget [Contractual | Remote] (Jan’25 – Feb’25)
                  </p>
                  <ul className="list-disc pl-6 ">
                    <li>
                      Built MediGadget E-Commerce: Full-stack platform with
                      Next.js, GraphQL, and Prisma, featuring role-based auth
                      (AuthJS) and Redux for centralized state management
                    </li>
                    <li>
                      Designed admin dashboards with ShadcnUI/Tailwind CSS,
                      enabling real-time product/order tracking and seamless
                      CRUD operations
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold ">Freelance Virtual Assistant</h4>
              <div className="ml-4">
                <p className="font-medium">
                  UpWork [Self-Employed | Remote] (2019 – Present)
                </p>
                <ul className="list-disc pl-6 ">
                  <li>
                    Executed lead generation, data mining, and document
                    conversion tasks with 4.7/5 avg. rating and 95% accuracy,
                    ensuring 100% on-time delivery for 10+ clients
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Academic Qualification">
          <div className="">
            <div>
              <p className="font-semibold">
                Diploma in Engineering (CGPA: 3.60/4.00)
              </p>
              <p>
                Arif Rabbi Polytechnic Institute | Technical Board | Computer
                Technology | 2024
              </p>
            </div>
            <div>
              <p className="font-semibold">
                Secondary School Certificate (GPA: 5.00/5.00)
              </p>
              <p>Guzia High School | Rajshahi Board | Science | 2015</p>
            </div>
          </div>
        </Section>

        <Section title="Training & Certification">
          <div className="">
            <div>
              <p className="font-semibold">PHP/Laravel Training</p>
              <p>Next Tech Limited | 6 Months | 2023</p>
            </div>
            <div>
              <p className="font-semibold">
                Admin Support & Virtual Assistance Training
              </p>
              <p>Cybertech | 6 Months | 2020</p>
            </div>
          </div>
        </Section>
      </div>

      {/* Page 3 */}
      <div className=" bg-white shadow-lg max-w-[8.5in] max-h-[11.5in] min-h-[11.5in] p-[0.5in]">
        <Section title="Projects">
          <div className="">
            <div>
              <p className="font-semibold">
                BakersBay: Inventory & Sales Management System
              </p>
              <p className="text-sm text-gray-600 ">
                Tech: Next.js, Node.js, Express, Prisma, Tailwind CSS
              </p>
              <ul className="list-disc pl-6 ">
                <li>
                  Built for bakeries to manage inventory, sales, and suppliers
                  with role-based access control and real-time analytics
                </li>
              </ul>
              <div className=" ">
                <a
                  href="https://github.com/khanshifaul/bakersbay"
                  target="_blank"
                  className="text-blue-600 hover:underline block"
                >
                  GitHub: https://github.com/khanshifaul/bakersbay
                </a>
                <a
                  href="https://store.bakersbay.live"
                  target="_blank"
                  className="text-blue-600 hover:underline block"
                >
                  Live: https://store.bakersbay.live
                </a>
              </div>
            </div>

            <div>
              <p className="font-semibold ">
                MediGadget: Healthcare E-Commerce Platform
              </p>
              <p className="text-sm text-gray-600 ">
                Tech: Next.js, GraphQL, Prisma, ShadcnUI, AuthJS, Redux
              </p>
              <ul className="list-disc pl-6 ">
                <li>
                  Developed a full-stack platform for medical equipment sales
                  with admin dashboards and real-time order tracking
                </li>
                <li>
                  Integrated GraphQL APIs for seamless data flow and used Redux
                  for centralized cart/order state management
                </li>
              </ul>
              <div className=" ">
                <a
                  href="https://github.com/khanshifaul/medigadget"
                  target="_blank"
                  className="text-blue-600 hover:underline block"
                >
                  GitHub: https://github.com/khanshifaul/medigadget
                </a>
                <a
                  href="https://medi-gadget-iota.vercel.app"
                  target="_blank"
                  className="text-blue-600 hover:underline block"
                >
                  Live: https://medi-gadget-iota.vercel.app
                </a>
              </div>
            </div>

            <div>
              <p className="font-semibold ">LogView: Log Visualization Tool</p>
              <p className="text-sm text-gray-600 ">
                Tech: React, Tailwind CSS, Node.js
              </p>
              <ul className="list-disc pl-6 ">
                <li>
                  Transformed raw system logs into interactive tables for easier
                  debugging and analysis
                </li>
              </ul>
              <div className=" ">
                <a
                  href="https://github.com/khanshifaul/logview"
                  target="_blank"
                  className="text-blue-600 hover:underline block"
                >
                  GitHub: https://github.com/khanshifaul/logview
                </a>
                <a
                  href="https://logview.vercel.app"
                  target="_blank"
                  className="text-blue-600 hover:underline block"
                >
                  Live: https://logview.vercel.app
                </a>
              </div>
            </div>

            <div>
              <p className="font-semibold ">
                Learnscape: School Management Platform
              </p>
              <p className="text-sm text-gray-600 ">
                Tech: Next.js, Firebase, Tailwind CSS
              </p>
              <ul className="list-disc pl-6 ">
                <li>
                  Streamlined attendance tracking and course management for NRKF
                  Digital School
                </li>
              </ul>
              <div className=" ">
                <a
                  href="https://github.com/khanshifaul/learnscape"
                  target="_blank"
                  className="text-blue-600 hover:underline block"
                >
                  GitHub: https://github.com/khanshifaul/learnscape
                </a>
                <a
                  href="https://learnscape.vercel.app"
                  target="_blank"
                  className="text-blue-600 hover:underline block"
                >
                  Live: https://learnscape.vercel.app
                </a>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Language Proficiency">
          <div className="grid grid-cols-2 gap-2">
            <div>Bengali: Native</div>
            <div>English: Fluent</div>
            <div>Hindi: Conversational</div>
            <div>Russian: Elementary</div>
          </div>
        </Section>

        <Section title="References">
          <div className="">
            <div>
              <p className="font-semibold">
                1. Uzzal Mondol, Owner, Hasan Computer & Digital Studio
              </p>
              <p>Phone: (+88) 01719-789248</p>
              <p>Email: uzzalphoto@gmail.com</p>
            </div>
            <div>
              <p className="font-semibold">
                2. Rotarian Md. Mostafizer Rohman, Founder Chairman, Progress
                Education Family
              </p>
              <p>Phone: (+88) 01717-142658</p>
            </div>
          </div>
        </Section>

        <div className="py-6 space-y-6">
          <p className="py-6 text-center">
            “I certify the accuracy of this resume and authorize verification of
            its contents.”
          </p>
          <div className="border-t-2 border-black w-32 ">
            <p className="font-semibold">Signature:</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="break-inside-avoid">
      <h3 className="text-lg font-semibold border-b-2 border-gray-300 ">
        {title}
      </h3>
      {children}
    </section>
  );
}

function SkillList({ items }: { items: string[] }) {
  return (
    <ul className="">
      {items.map((item, i) => (
        <li key={i} className="text-sm">
          {item}
        </li>
      ))}
    </ul>
  );
}
