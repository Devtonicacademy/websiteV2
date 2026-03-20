
"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import "./showcase.css";

interface Course {
    title: string;
    learn: string[];
    benefits: string[];
    outcomes: Record<string, string>;
    pricing: string;
    schedule: string;
}

export default function Showcase() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [showCheckout, setShowCheckout] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [typingText, setTypingText] = useState("");
    const typingPhrases = ["Master Power Apps", "Build Scalable Web Apps", "Level up your Video Editing skills", "Become a Data Scientist"];
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const form = e.currentTarget;
        const formData = new FormData(form);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const message = formData.get("message") as string;

        try {
            await addDoc(collection(db, "messages"), {
                name,
                email,
                message,
                createdAt: serverTimestamp(),
            });
            form.reset();
            toast.success("Message sent successfully! We will get back to you soon.");
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const courseDetails: Record<string, Course> = {
        "Agentic AI Mastery & Prompt Engineering": {
            title: "Agentic AI Mastery & Prompt Engineering",
            learn: [
                "Build autonomous AI agents using LangChain, AutoGen, and CrewAI frameworks",
                "Master advanced prompt engineering techniques, chain-of-thought reasoning, and RAG pipelines",
                "Deploy AI-powered workflows that automate complex, multi-step business processes"
            ],
            benefits: [
                "Position yourself as a highly sought-after AI engineer in the fastest-growing field",
                "Build intelligent automation tools that generate real business value",
                "Access the most in-demand skills companies are hiring for right now"
            ],
            outcomes: { "All Levels": "Design and deploy production-ready AI agents and automated pipelines" },
            pricing: "Contact Us for Pricing",
            schedule: "Flexible Cohorts"
        },
        "Cybersecurity Essentials & Ethical Hacking": {
            title: "Cybersecurity Essentials & Ethical Hacking",
            learn: [
                "Master network security, cryptography, and threat intelligence fundamentals",
                "Perform ethical penetration testing using Kali Linux, Metasploit, and Burp Suite",
                "Understand OWASP Top 10 vulnerabilities, SOC operations, and incident response"
            ],
            benefits: [
                "Qualify for high-paying roles as a Penetration Tester, SOC Analyst, or Security Engineer",
                "Protect organizations from real-world cyberattacks and data breaches",
                "Build the expertise needed to pass CEH, CompTIA Security+, or OSCP certifications"
            ],
            outcomes: { "All Levels": "Identify, exploit, and remediate security vulnerabilities in real environments" },
            pricing: "Contact Us for Pricing",
            schedule: "Flexible Cohorts"
        },
        "Cloud Computing": {
            title: "Cloud Computing",
            learn: [
                "Master AWS, Azure, and Google Cloud core services including compute, storage, and networking",
                "Deploy scalable, highly available architectures using cloud-native principles",
                "Infrastructure-as-Code with Terraform and CI/CD pipelines on the cloud"
            ],
            benefits: [
                "Unlock high-demand cloud careers with globally recognized cloud skills",
                "Reduce infrastructure costs and increase reliability for any business",
                "Prepare for AWS, Azure, or GCP associate/professional certifications"
            ],
            outcomes: { "All Levels": "Design, deploy, and manage scalable cloud infrastructure across major providers" },
            pricing: "Contact Us for Pricing",
            schedule: "Flexible Cohorts"
        },
        "Data Science & Machine Learning with Python": {
            title: "Data Science & Machine Learning with Python",
            learn: [
                "Python for data analysis using Pandas, NumPy, Matplotlib, and Seaborn",
                "Build and fine-tune machine learning models with Scikit-Learn, TensorFlow, and PyTorch",
                "Data cleaning, feature engineering, SQL mastery, and end-to-end ML pipelines"
            ],
            benefits: [
                "Land roles as a Data Scientist, ML Engineer, or AI Analyst",
                "Make powerful, data-driven decisions that save businesses millions",
                "Build and deploy models that power real products and intelligent systems"
            ],
            outcomes: { "All Levels": "Extract actionable intelligence and build predictive models from complex datasets" },
            pricing: "Contact Us for Pricing",
            schedule: "Flexible Cohorts"
        },
        "Full-Stack Web Development": {
            title: "Full-Stack Web Development",
            learn: [
                "Build modern front-ends with React, Next.js, TypeScript, and Tailwind CSS",
                "Develop robust back-ends with Node.js, Express, and REST/GraphQL APIs",
                "Database design (SQL & NoSQL), authentication, and cloud deployment on Vercel/AWS"
            ],
            benefits: [
                "Land a high-paying role as a Full-Stack or Software Engineer",
                "Build and launch your own SaaS products, portfolios, and web apps",
                "Gain end-to-end ownership of products from concept to production"
            ],
            outcomes: { "All Levels": "Build, deploy, and scale production-ready full-stack web applications" },
            pricing: "Contact Us for Pricing",
            schedule: "Flexible Cohorts"
        },
        "Microsoft Office Suite": {
            title: "Microsoft Office Suite",
            learn: [
                "Master MS Word, Excel (with advanced formulas & pivot tables), PowerPoint, and Outlook",
                "Create professional reports, interactive dashboards, and compelling presentations",
                "Automate repetitive tasks using Excel Macros, VBA, and built-in workflow tools"
            ],
            benefits: [
                "Become indispensable in any modern office, corporate, or administrative role",
                "Save hours of manual work through automation and formula mastery",
                "Gain certifications respected by employers in every industry globally"
            ],
            outcomes: { "All Levels": "Complete proficiency in enterprise-standard productivity tools" },
            pricing: "Contact Us for Pricing",
            schedule: "Flexible Cohorts"
        },
        "Professional Graphic Design & Video Editing": {
            title: "Professional Graphic Design & Video Editing",
            learn: [
                "Master Adobe Premiere Pro, After Effects, Photoshop, Illustrator, and Canva Pro",
                "Color grading, motion graphics, audio sync, and cinematic storytelling techniques",
                "Brand identity creation, social media design, and content strategy for digital platforms"
            ],
            benefits: [
                "Build a high-paying freelance creative business serving global clients",
                "Produce viral, engaging content for YouTube, Instagram, and brand campaigns",
                "Develop a stunning portfolio that attracts premium clients and agencies"
            ],
            outcomes: { "All Levels": "Produce cinema-quality videos and agency-level graphic designs" },
            pricing: "Contact Us for Pricing",
            schedule: "Flexible Cohorts"
        },
        "VFX, 3D Modeling & Animation for Gaming & Media": {
            title: "VFX, 3D Modeling & Animation for Gaming & Media",
            learn: [
                "Navigate industry-standard tools including Blender, Maya, Cinema 4D, and Unreal Engine",
                "Master polygon modeling, UV mapping, texturing, rigging, and lighting workflows",
                "Create VFX compositing, character animation, and physics simulations for film and games"
            ],
            benefits: [
                "Enter the lucrative gaming, film, VR/AR, and architectural visualization industries",
                "Bring your imagination to life as fully rendered, interactive 3D experiences",
                "Build a portfolio that qualifies you for AAA game studios and film production houses"
            ],
            outcomes: { "All Levels": "Create production-ready VFX, 3D assets, and animations for games and media" },
            pricing: "Contact Us for Pricing",
            schedule: "Flexible Cohorts"
        },
        "AI-Powered Digital Marketing & Automation": {
            title: "AI-Powered Digital Marketing & Automation",
            learn: [
                "Master SEO, SEM, social media marketing, email campaigns, and paid ad strategies",
                "Leverage AI tools like ChatGPT, Jasper, and Canva AI for content creation and automation",
                "Analyze campaign performance with Google Analytics, Meta Ads Manager, and CRM integrations"
            ],
            benefits: [
                "Launch and scale profitable digital marketing campaigns for businesses or your own brand",
                "Automate lead generation, nurturing, and sales funnels with AI-driven tools",
                "Position yourself as a modern performance marketer in the booming digital economy"
            ],
            outcomes: { "All Levels": "Plan, execute, and automate full-funnel digital marketing strategies with AI" },
            pricing: "Contact Us for Pricing",
            schedule: "Flexible Cohorts"
        },
        "DevOps & Automation for Modern Developers": {
            title: "DevOps & Automation for Modern Developers",
            learn: [
                "Master CI/CD pipelines with GitHub Actions, Jenkins, and Azure DevOps",
                "Containerize and orchestrate applications using Docker and Kubernetes",
                "Implement Infrastructure-as-Code with Terraform and monitoring with Prometheus/Grafana"
            ],
            benefits: [
                "Eliminate deployment bottlenecks and ship software faster with automated pipelines",
                "Command premium salaries as a DevOps or Platform Engineer",
                "Enable engineering teams to build, test, and deploy with confidence and speed"
            ],
            outcomes: { "All Levels": "Build and operate automated CI/CD pipelines and cloud-native infrastructure" },
            pricing: "Contact Us for Pricing",
            schedule: "Flexible Cohorts"
        },
        "UI/UX Design: Create User-Centered Apps & Websites": {
            title: "UI/UX Design: Create User-Centered Apps & Websites",
            learn: [
                "Master Figma, Adobe XD, and Framer to design intuitive user interfaces and prototypes",
                "Conduct user research, create user personas, journey maps, and wireframes",
                "Apply design systems, accessibility principles, and usability testing best practices"
            ],
            benefits: [
                "Land roles as a UX Designer, Product Designer, or Design Lead at top tech companies",
                "Design digital products that users love and that drive business growth",
                "Bridge the gap between design and development with handoff-ready specifications"
            ],
            outcomes: { "All Levels": "Design and prototype beautiful, user-centered digital products ready for development" },
            pricing: "Contact Us for Pricing",
            schedule: "Flexible Cohorts"
        },
        "Powerplatform": {
            title: "Powerplatform (PowerApps, D365, PowerBI, AI Agents)",
            learn: [
                "Build enterprise-grade low-code apps with Power Apps",
                "Automate complex workflows with Power Automate",
                "Visualize business intelligence with Power BI and integrate AI Agents"
            ],
            benefits: [
                "Automate tedious manual processes in weeks, not months",
                "Become a high-value Microsoft ecosystem consultant",
                "Integrate directly with Azure, SharePoint, and Office 365"
            ],
            outcomes: { "All Levels": "Deliver scalable enterprise solutions with zero/low code" },
            pricing: "Contact Us for Pricing",
            schedule: "Flexible Cohorts"
        }
    };

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }, [isDarkMode]);

    useEffect(() => {
        if (typeof window !== "undefined" && (window as Window & typeof globalThis & { THREE?: unknown }).THREE) {
            // 3D Scene Initialization
            // ... (Implementation of Scene3D goes here)
        }

        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);

        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingTimeout: NodeJS.Timeout;

        const type = () => {
            const currentPhrase = typingPhrases[phraseIndex];

            if (isDeleting) {
                setTypingText(currentPhrase.substring(0, charIndex - 1));
                charIndex--;
            } else {
                setTypingText(currentPhrase.substring(0, charIndex + 1));
                charIndex++;
            }

            let typeSpeed = isDeleting ? 50 : 100;

            if (!isDeleting && charIndex === currentPhrase.length) {
                typeSpeed = 2000; // Pause at end of phrase
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % typingPhrases.length;
                typeSpeed = 500; // Pause before typing next phrase
            }

            typingTimeout = setTimeout(type, typeSpeed);
        };

        typingTimeout = setTimeout(type, 1000); // Start typing after 1s

        return () => {
            window.removeEventListener("scroll", handleScroll);
            clearTimeout(typingTimeout);
        };
    }, []);

    return (
        <>
            <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
            <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" strategy="beforeInteractive" />
            <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.7.1/gsap.min.js" strategy="lazyOnload" />
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap" rel="stylesheet" />

            <div className="animated-bg"></div>

            <header className={`header fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-4'}`}>
                <nav className="container mx-auto flex justify-between items-center px-4">
                    <div className="logo-container flex items-center gap-2 group cursor-pointer">
                        <img src="https://firebasestorage.googleapis.com/v0/b/devtonic-lms-2.firebasestorage.app/o/Logo_no%20bg.png?alt=media&token=af4099c8-048a-4f73-88ab-7c160a23048b" alt="Devtonic Logo" className="h-10 group-hover:scale-110 transition-transform" />
                        <span className="text-2xl font-black text-[#FF8A3D] tracking-tighter hidden sm:block" style={{ fontFamily: "'Outfit', sans-serif", filter: "drop-shadow(0 0 10px rgba(255, 138, 61, 0.3))" }}>Devtonic</span>
                    </div>

                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-white p-2 focus:outline-none">
                        <i className="fas fa-bars text-2xl"></i>
                    </button>

                    <div className={`fixed inset-0 z-[100] bg-gray-900/95 backdrop-blur-md ${isMobileMenuOpen ? "flex" : "hidden"} md:bg-transparent md:backdrop-blur-none md:static md:flex items-center justify-center md:justify-end transition-all`}>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6 md:hidden text-white p-2 focus:outline-none hover:text-gray-300">
                            <i className="fas fa-times text-3xl"></i>
                        </button>
                        <div className="flex flex-col md:flex-row items-center justify-center h-full space-y-8 md:space-y-0 md:space-x-6 w-full">
                            <a href="#courses" className="nav-link text-xl md:text-base text-gray-100 md:text-inherit" onClick={() => setIsMobileMenuOpen(false)}>Courses</a>
                            <a href="#why-us" className="nav-link text-xl md:text-base text-gray-100 md:text-inherit" onClick={() => setIsMobileMenuOpen(false)}>Why Us</a>
                            <a href="#courses" className="nav-link text-xl md:text-base text-gray-100 md:text-inherit" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
                            <a href="#contact" className="nav-link text-[#FF8A3D] font-bold text-xl md:text-base" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
                            {/* <a href="#contact" className="nav-link text-xl md:text-base text-gray-100 md:text-inherit" onClick={() => setIsMobileMenuOpen(false)}>Contact</a> */}

                            {/* ADD LMS LINK HERE */}
                            <Link href="/portal" className="nav-link text-[#FF8A3D] font-bold text-xl md:text-base" onClick={() => setIsMobileMenuOpen(false)}>LMS Portal</Link>

                            <button onClick={() => setIsDarkMode(!isDarkMode)} className="relative inline-flex items-center justify-center p-2 rounded-full transition-colors duration-300 focus:outline-none hover:bg-white/10">
                                {isDarkMode ? <i className="fas fa-moon text-purple-200 text-xl md:text-lg"></i> : <i className="fas fa-sun text-yellow-400 text-xl md:text-lg"></i>}
                            </button>
                        </div>
                    </div>
                </nav>
            </header>

            <section className="relative h-screen overflow-hidden">
                <canvas id="hero3D"></canvas>
                <div className="absolute inset-0 w-full h-full z-0">
                    <video
                        className="w-full h-full object-cover relative z-0"
                        autoPlay
                        muted
                        loop
                        playsInline>
                        <source src="/Devtonic Intro 2.mp4" type="video/mp4" />
                        {/* <source src="/TEACHING GRAPHICS TIPS.mp4" type="video/mp4" /> */}
                    </video>
                    <div className="absolute inset-0 bg-black/60 z-10"></div>
                </div>

                <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-300 drop-shadow-lg">
                        Transform Your Future with Tech
                    </h1>
                    <p className="text-xl md:text-3xl mb-8 text-purple-200 h-10 font-mono drop-shadow">
                        <span className="border-r-2 border-purple-200 pr-1 animate-pulse">{typingText}</span>
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mx-auto">
                        <a href="#courses" className="cta-button px-8 py-4 rounded-full text-white font-bold relative z-10 w-full sm:w-auto shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                            Explore Courses
                        </a>
                        <Link href="/portal" className="px-8 py-4 rounded-full text-white font-bold border-2 border-[#FF8A3D] bg-[#FF8A3D]/20 hover:bg-[#FF8A3D]/40 relative z-10 w-full sm:w-auto backdrop-blur-sm transition-all hover:scale-105">
                            Enter LMS
                        </Link>
                    </div>
                </div>
            </section>

            <main className="max-w-7xl mx-auto p-4 md:p-6" style={{ position: "relative", zIndex: 10 }}>
                {/* Why Us / Academy & Agency Sections */}
                <section id="why-us" className="my-16 md:my-24 scroll-mt-24">
                    <h2 className="text-3xl md:text-5xl font-extrabold mb-12 text-center text-[#FF8A3D] drop-shadow-sm">Why Choose Devtonic?</h2>

                    {/* Intro Video */}
                    <div className="max-w-4xl mx-auto mb-16 fade-in rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50">
                        <div className="relative pb-[56.25%] h-0">
                            <iframe
                                src="https://www.youtube.com/embed/7Jagg5cy24U"
                                title="Devtonic Intro Video"
                                className="absolute top-0 left-0 w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen>
                            </iframe>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center mb-16 fade-in">
                        <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-[#FF8A3D]">
                            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <i className="fas fa-graduation-cap text-[#FF8A3D]"></i>
                                Devtonic Academy
                            </h3>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                We teach tech courses Mentoring individuals and teams to level up their skills and processes at different levels. Our offerings are suitable for beginners to advanced.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-[#FF8A3D] fade-in">
                            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <i className="fas fa-rocket text-[#FF8A3D]"></i>
                                Devtonic Agency
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                We craft high-quality web apps and Power Platform solutions that scale from startups to global enterprises—empowering your business to thrive.
                            </p>
                        </div>
                    </div>

                    {/* Completed Projects */}
                    <div className="my-16 fade-in">
                        <h3 className="text-3xl font-bold mb-8 text-center text-gray-800">Our Impact & Projects</h3>
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Project 1 */}
                            <div className="group relative overflow-hidden rounded-xl shadow-lg bg-gray-50 border border-gray-100 transition-all hover:-translate-y-1">
                                <img src="https://firebasestorage.googleapis.com/v0/b/studio-1523050100-2a1a4.firebasestorage.app/o/Elvis%20Portfolio%20Files%2FProjects%2FContact%20Manager%2FContact%20Manager_process%20flow.png?alt=media&token=14762b64-2500-4319-9b3a-42bf899aa5a1" alt="Project 1" className="w-full h-48 object-cover group-hover:scale-105 transition duration-500" />
                                <div className="p-6">
                                    <h4 className="font-bold text-xl mb-2">IFPMA Contact Distribution App</h4>
                                    <p className="text-sm text-gray-600 mb-4">Developed a Power App managing 8,000+ AAD contacts.</p>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        <span className="px-2 py-1 bg-purple-100 text-[#FF8A3D] rounded-md">Power Apps</span>
                                        <span className="px-2 py-1 bg-purple-100 text-[#FF8A3D] rounded-md">Azure AD</span>
                                    </div>
                                </div>
                            </div>

                            {/* Project 2 */}
                            <div className="group relative overflow-hidden rounded-xl shadow-lg bg-gray-50 border border-gray-100 transition-all hover:-translate-y-1">
                                <img src="https://firebasestorage.googleapis.com/v0/b/studio-1523050100-2a1a4.firebasestorage.app/o/Elvis%20Portfolio%20Files%2FProjects%2FVendor%20Management%20System%2FVMS-Home%20Page.jpeg?alt=media&token=78bf6715-0866-45df-b78d-a84874b98d4b" alt="Project 2" className="w-full h-48 object-cover group-hover:scale-105 transition duration-500" />
                                <div className="p-6">
                                    <h4 className="font-bold text-xl mb-2">ZoomTan Vendor Management</h4>
                                    <p className="text-sm text-gray-600 mb-4">Automated vendor lifecycle and multi-level approval workflows.</p>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        <span className="px-2 py-1 bg-purple-100 text-[#FF8A3D] rounded-md">Power Automate</span>
                                        <span className="px-2 py-1 bg-purple-100 text-[#FF8A3D] rounded-md">SharePoint</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Live Webinars Highlight */}
                    <div className="my-24 fade-in max-w-5xl mx-auto bg-gradient-to-br from-[#FF8A3D] to-purple-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-[#FF8A3D] opacity-20 blur-3xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                            <div className="flex-1 text-center md:text-left">
                                <div className="inline-block bg-white text-[#FF8A3D] px-4 py-1 rounded-full text-sm font-bold mb-4 shadow-md">
                                    <i className="fas fa-video mr-2"></i> Monthly Live Webinars
                                </div>
                                <h3 className="text-3xl md:text-4xl font-bold mb-4">Connect With Industry Experts</h3>
                                <p className="text-lg text-purple-100 mb-6 max-w-xl mx-auto md:mx-0">
                                    Join our <strong className="text-white text-xl">Monthly Live Webinars</strong> where we dive into the latest tech trends, showcase real-world projects, and host interactive Q&A sessions to help you level up your career!
                                </p>
                                <ul className="flex flex-wrap gap-4 text-sm font-medium mb-8 justify-center md:justify-start">
                                    <li className="bg-black/20 px-4 py-2 rounded-lg flex items-center"><i className="far fa-calendar-check text-green-400 mr-2"></i> Monthly Sessions</li>
                                    <li className="bg-black/20 px-4 py-2 rounded-lg flex items-center"><i className="fas fa-comments text-blue-400 mr-2"></i> Interactive Q&A</li>
                                </ul>
                                <a href="https://zoom.us" target="_blank" rel="noopener noreferrer" className="inline-block bg-white text-[#FF8A3D] px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform shadow-lg">
                                    Register for Next Webinar
                                </a>
                            </div>
                            <div className="w-full md:w-1/3 flex justify-center perspective-1000">
                                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl transform rotate-y-n12 hover:rotate-y-0 transition-all duration-500">
                                    <img src="https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=500&q=80" alt="Live Webinar Presentation" className="rounded-xl w-64 md:w-full object-cover shadow-inner" />
                                </div>
                            </div>
                        </div>
                    </div>

                </section>

                <section className="my-16 md:my-24 scroll-mt-24" id="courses">
                    <h2 className="text-3xl font-semibold mb-4 gradient-heading">Course Offerings</h2>
                    <p className="text-gray-600 mb-6">Master the latest tech skills with Devtonic Systems Hub Solution Ltd. Our courses cater to kids, teens, adults, business professionals, IT/non-IT personnel, and tech beginners. All software tools are provided at no extra cost!</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.keys(courseDetails).map((title) => {
                            const course = courseDetails[title];
                            const courseImages: Record<string, string> = {
                                "Agentic AI Mastery & Prompt Engineering": "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
                                "Cybersecurity Essentials & Ethical Hacking": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
                                "Cloud Computing": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
                                "Data Science & Machine Learning with Python": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
                                "Full-Stack Web Development": "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?auto=format&fit=crop&w=800&q=80",
                                "Microsoft Office Suite": "https://images.unsplash.com/photo-1661956602116-aa6865609028?auto=format&fit=crop&w=800&q=80",
                                "Professional Graphic Design & Video Editing": "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80",
                                "VFX, 3D Modeling & Animation for Gaming & Media": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
                                "AI-Powered Digital Marketing & Automation": "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80",
                                "DevOps & Automation for Modern Developers": "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80",
                                "UI/UX Design: Create User-Centered Apps & Websites": "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80",
                                "Powerplatform": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
                            };
                            const imgSrc = courseImages[title] ?? "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80";

                            return (
                                <div key={title} className="course-card bg-white p-6 rounded-lg shadow-md fade-in">
                                    <div className="mb-4">
                                        <img src={imgSrc} alt={title} className="rounded-lg w-full h-40 object-cover" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">{title}</h3>
                                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">{course.learn[0]}</p>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#FF8A3D] font-bold text-sm">{course.pricing.split(" for ")[0]}</span>
                                            <button
                                                onClick={() => setSelectedCourse(course)}
                                                className="bg-[#FF8A3D] text-white px-4 py-2 rounded-full hover:bg-[#E67A2E] transition relative z-10 text-sm">
                                                See Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>

                {/* Learn with Devtonic (YouTube) */}
                <section className="my-16 scroll-mt-24" id="tutorials">
                    <h2 className="text-3xl font-bold mb-4 gradient-heading">Learn with Devtonic</h2>
                    <p className="text-gray-600 mb-10 max-w-2xl">Explore our free YouTube tutorials to kickstart your journey in Power Apps, SharePoint, and more.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Tutorial 1 */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full fade-in cursor-pointer group" onClick={() => window.open('https://www.youtube.com/watch?v=jRSmmbH2hJQ', '_blank')}>
                            <div className="relative h-48 w-full overflow-hidden">
                                <img src="https://i.ytimg.com/an_webp/jRSmmbH2hJQ/mqdefault_6s.webp?du=3000&sqp=CIy19cwG&rs=AOn4CLDJziNGWsNZQZA3fgc98RmaJ84ioA" alt="Vibe Coding Future" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                    <i className="fab fa-youtube text-4xl text-white opacity-80 group-hover:opacity-100 group-hover:text-red-500 transition-all scale-90 group-hover:scale-110"></i>
                                </div>
                                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded">45:32</div>
                            </div>
                            <div className="p-4 flex flex-col flex-grow">
                                <h4 className="font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-[#FF8A3D] transition-colors">Is "Vibe Coding" the Future of Power Apps? 🤯 Build Professional Apps in Minutes with AI.</h4>
                                <p className="text-sm text-gray-600 line-clamp-2 flex-grow">I’ll be demonstrating how to go from a blank canvas to a fully animated, AI-generated Power App.</p>
                            </div>
                        </div>

                        {/* Tutorial 2 */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full fade-in cursor-pointer group" onClick={() => window.open('https://www.youtube.com/watch?v=iqc4kKRBHwE', '_blank')}>
                            <div className="relative h-48 w-full overflow-hidden">
                                <img src="https://i.ytimg.com/vi/iqc4kKRBHwE/maxresdefault.jpg" alt="Sharepoint Setup" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                    <i className="fab fa-youtube text-4xl text-white opacity-80 group-hover:opacity-100 group-hover:text-red-500 transition-all scale-90 group-hover:scale-110"></i>
                                </div>
                                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded">45:32</div>
                            </div>
                            <div className="p-4 flex flex-col flex-grow">
                                <h4 className="font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-[#FF8A3D] transition-colors">Easy SharePoint Setup: Create Sites & Lists + PowerApps Made Simple</h4>
                                <p className="text-sm text-gray-600 line-clamp-2 flex-grow">Supercharge Your Workflow with SharePoint + PowerApps! Hands-on tutorial.</p>
                            </div>
                        </div>

                        {/* Tutorial 3 */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full fade-in cursor-pointer group" onClick={() => window.open('https://www.youtube.com/watch?v=meEFY3-hff8&t=40s', '_blank')}>
                            <div className="relative h-48 w-full overflow-hidden">
                                <img src="https://i.ytimg.com/vi/meEFY3-hff8/maxresdefault.jpg" alt="PowerApps Sorting" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                    <i className="fab fa-youtube text-4xl text-white opacity-80 group-hover:opacity-100 group-hover:text-red-500 transition-all scale-90 group-hover:scale-110"></i>
                                </div>
                                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded">52:48</div>
                            </div>
                            <div className="p-4 flex flex-col flex-grow">
                                <h4 className="font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-[#FF8A3D] transition-colors">PowerApps Sorting Hack: Build Custom Reordering Logic in Minutes!</h4>
                                <p className="text-sm text-gray-600 line-clamp-2 flex-grow">Struggling with Realtime sorting and item reordering in PowerApps?</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-center mt-10">
                        <a href="https://www.youtube.com/@Devtonic" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white bg-red-600 px-8 py-4 rounded-full font-bold hover:bg-red-700 hover:scale-105 transition-all shadow-lg hover:shadow-red-500/50">
                            View all tutorials on YouTube <i className="fas fa-play"></i>
                        </a>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="my-16 md:my-24 scroll-mt-24" id="testimonials">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-heading inline-block">Success Stories</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Hear from the teams and individuals who have leveled up their technical capabilities with Devtonic.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 relative fade-in">
                            <i className="fas fa-quote-left text-4xl text-[#FF8A3D]/20 absolute top-6 left-6"></i>
                            <div className="relative z-10">
                                <div className="flex text-yellow-400 mb-4">
                                    <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                                </div>
                                <p className="text-gray-700 italic mb-6">"The Devtonic team totally revolutionized how we handle Vendor Management. The automated workflows they built on the Power Platform saved us countless hours of manual data entry."</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">ZT</div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">Operations Lead</h4>
                                        <span className="text-sm text-gray-500">ZoomTan Inc.</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 relative fade-in">
                            <i className="fas fa-quote-left text-4xl text-[#FF8A3D]/20 absolute top-6 left-6"></i>
                            <div className="relative z-10">
                                <div className="flex text-yellow-400 mb-4">
                                    <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                                </div>
                                <p className="text-gray-700 italic mb-6">"I joined the Skool community as a beginner and within months I was building my own canvas apps. The mentorship and YouTube tutorials are simply world-class!"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-100 text-[#FF8A3D] rounded-full flex items-center justify-center font-bold">M</div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">Marcus T.</h4>
                                        <span className="text-sm text-gray-500">Academy Student</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 relative fade-in">
                            <i className="fas fa-quote-left text-4xl text-[#FF8A3D]/20 absolute top-6 left-6"></i>
                            <div className="relative z-10">
                                <div className="flex text-yellow-400 mb-4">
                                    <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                                </div>
                                <p className="text-gray-700 italic mb-6">"Devtonic developed a flawless Contact App syncing over 8,000 active Azure profiles. The speed, security, and scale of their solutions are unmatched."</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">IF</div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">IT Director</h4>
                                        <span className="text-sm text-gray-500">IFPMA</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact Us Section */}
                <section id="contact" className="my-16 scroll-mt-24 p-8 bg-[rgb(143,49,138)]/5 rounded-3xl fade-in border border-[rgb(143,49,138)]/20 shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at center, rgb(143,49,138) 2px, transparent 2px)", backgroundSize: "20px 20px" }}></div>
                    <div className="max-w-3xl mx-auto relative z-10 text-center">
                        <h2 className="text-3xl font-bold mb-4 text-gray-800">Get in Touch</h2>
                        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                            Ready to transform your skills or build your next scalable app? Send us a message to get started with Devtonic Academy or Devtonic Agency.
                        </p>

                        <form onSubmit={handleContactSubmit} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-left">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">Full Name</label>
                                    <input type="text" id="name" name="name" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[rgb(143,49,138)] focus:border-transparent outline-none transition-all" placeholder="John Doe" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">Email Address</label>
                                    <input type="email" id="email" name="email" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[rgb(143,49,138)] focus:border-transparent outline-none transition-all" placeholder="john@example.com" />
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="message">Your Message</label>
                                <textarea id="message" name="message" rows={4} required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[rgb(143,49,138)] focus:border-transparent outline-none transition-all" placeholder="How can we help you?"></textarea>
                            </div>
                            <div className="text-center">
                                <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 bg-[rgb(143,49,138)] text-white px-8 py-4 rounded-full font-bold hover:bg-[#E67A2E] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl w-full sm:w-auto">
                                    {isSubmitting ? (
                                        <><i className="fas fa-spinner fa-spin"></i> Sending...</>
                                    ) : (
                                        <><i className="fas fa-paper-plane"></i> Send Message</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            </main>

            <footer className="bg-gray-900 border-t border-gray-800 text-gray-300 pt-16 pb-8 relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        {/* Brand Column */}
                        <div className="md:col-span-1 border-b md:border-b-0 border-gray-800 pb-8 md:pb-0">
                            <img src="https://firebasestorage.googleapis.com/v0/b/devtonic-lms-2.firebasestorage.app/o/Logo_no%20bg.png?alt=media&token=af4099c8-048a-4f73-88ab-7c160a23048b" alt="Devtonic Logo" className="h-12 brightness-0 invert opacity-90 mb-6" />
                            <p className="text-sm text-gray-400 leading-relaxed mb-6">
                                Mentoring individuals and crafting high-quality web apps & Power Platform solutions that scale globally.
                            </p>
                            <Link href="/portal" className="inline-block bg-[rgb(143,49,138)] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#E67A2E] transition-colors text-sm">
                                LMS Sign In
                            </Link>
                        </div>

                        {/* Quick Links */}
                        <div className="md:col-span-1">
                            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Quick Links</h4>
                            <ul className="space-y-4">
                                <li><a href="#why-us" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                                <li><a href="#courses" className="text-gray-400 hover:text-white transition-colors">Academy Courses</a></li>
                                <li><a href="#tutorials" className="text-gray-400 hover:text-white transition-colors">Free YouTube Tutorials</a></li>
                                <li><a href="#testimonials" className="text-gray-400 hover:text-white transition-colors">Client Success</a></li>
                            </ul>
                        </div>

                        {/* Connect */}
                        <div className="md:col-span-2">
                            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Connect With Us</h4>
                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <a href="https://instagram.com/devtonichub_ltd" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center sm:justify-start gap-3 bg-gray-800 hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-red-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl transition-all w-full sm:w-auto">
                                    <i className="fab fa-instagram text-xl"></i> devtonichub_ltd
                                </a>
                                <a href="https://chat.whatsapp.com/FfJIYo7L4MBEBHqm61ACCv" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center sm:justify-start gap-3 bg-gray-800 hover:bg-green-600 text-white px-6 py-3 rounded-xl transition-all w-full sm:w-auto">
                                    <i className="fab fa-whatsapp text-xl"></i> WhatsApp Community
                                </a>
                            </div>
                            <div className="flex items-center justify-center sm:justify-start gap-4">
                                <a href="https://www.youtube.com/@Devtonic" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-colors">
                                    <i className="fab fa-youtube text-xl"></i>
                                </a>
                                <a href="https://skool.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-colors">
                                    <i className="fas fa-graduation-cap text-xl"></i>
                                </a>
                                <span className="text-gray-500 text-sm ml-2"><i className="fas fa-phone mr-2"></i> +234 806 262 6722</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                        <p>&copy; {new Date().getFullYear()} Devtonic Systems Hub Solution Ltd. All rights reserved.</p>
                        <div className="flex gap-6 mt-4 md:mt-0">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Course Modal */}
            {selectedCourse && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100] backdrop-blur-sm transition-opacity" onClick={() => setSelectedCourse(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full p-8 relative transform transition-transform scale-100" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedCourse(null)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500 transition-colors"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                        <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">{selectedCourse.title}</h3>
                        <div className="h-1 w-16 bg-[#FF8A3D] mb-6 rounded-full"></div>

                        <div className="space-y-4 mb-6 text-gray-600 dark:text-gray-300">
                            <div>
                                <strong className="block text-gray-800 dark:text-gray-200 mb-1">What You'll Learn:</strong>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    {selectedCourse.learn.map((l, i) => <li key={i}>{l}</li>)}
                                </ul>
                            </div>
                            <div>
                                <strong className="block text-gray-800 dark:text-gray-200 mb-1">Benefits:</strong>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    {selectedCourse.benefits.map((b, i) => <li key={i}>{b}</li>)}
                                </ul>
                            </div>
                            <div className="flex items-center gap-2 text-[rgb(143,49,138)] font-semibold border-t pt-4">
                                <i className="fas fa-tag"></i> {selectedCourse.pricing}
                            </div>
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <i className="far fa-calendar-alt"></i> {selectedCourse.schedule}
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <a href={`https://wa.me/2348062626722?text=${encodeURIComponent(`Hi Devtonic Academy, I'm interested in enrolling in the ${selectedCourse.title} course!`)}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-[rgb(143,49,138)] text-white px-6 py-3 rounded-xl font-bold text-center hover:bg-[#E67A2E] transition-colors shadow flex justify-center items-center gap-2">
                                <i className="fab fa-whatsapp text-xl"></i> Enroll via WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
