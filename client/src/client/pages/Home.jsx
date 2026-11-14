import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../shared/services/api';
import { useAuth } from '../../shared/context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  Code2,
  Cpu,
  ShieldCheck,
  Globe2,
  Calendar,
  Trophy,
  Users,
  CheckCircle2,
  Layers,
  ChevronRight,
  ChevronDown,
  Mail,
  Award,
  HelpCircle,
  FileCheck2,
  Clock,
  KeyRound,
  Send,
  AlertTriangle,
  Search,
  X,
  Target,
  LayoutDashboard,
  PlusCircle,
  ShieldAlert,
  QrCode,
  ExternalLink,
  Star,
  Activity,
  Zap,
} from 'lucide-react';

const FALLBACK_FEATURED_PROBLEMS = [
  {
    _id: 'fb-1',
    psId: 'MCAI-PS-01',
    title: 'AI-Powered Early Maternal Health Risk Predictor',
    category: 'AI/ML',
    difficulty: 'Intermediate',
    description:
      'Architect an end-to-end predictive diagnostic system for maternal vital telemetries and prenatal complications using deep learning models.',
  },
  {
    _id: 'fb-2',
    psId: 'MCAI-PS-02',
    title: 'Zero-Trust Electronic Health Records Management',
    category: 'Cyber Security',
    difficulty: 'Advanced',
    description:
      'Design a privacy-preserving clinical records ledger with immutable audit logs, tamper-evident document hashing, and granular access controls.',
  },
  {
    _id: 'fb-3',
    psId: 'MCAI-PS-03',
    title: 'Smart ICU Telemetry & Real-Time Alert Engine',
    category: 'IoT & Embedded',
    difficulty: 'Intermediate',
    description:
      'Construct a real-time WebSocket sensor ingestion pipeline that monitors patient biometric signals and triggers automated distress alarms.',
  },
];

const DEFAULT_TIMELINE_PHASES = [
  {
    phase: 'Phase 01',
    title: 'Registration & Initial Project Submission',
    date: 'November 06 – November 25, 2026',
    desc: 'Sign up on the portal, verify via OTP, assemble your team (1-5 members), pick your track, and submit project outline, PPT slide deck, and repository links.',
    status: 'Active',
    completed: false,
  },
  {
    phase: 'Phase 02',
    title: 'Artifact Refinement & Technical Screening',
    date: 'November 26 – December 10, 2026',
    desc: 'Candidates polish repository commits, update live demo endpoints, and undergo preliminary code hygiene, security, and architecture screening.',
    status: 'Upcoming',
    completed: false,
  },
  {
    phase: 'Phase 03',
    title: 'Shortlisting & Mentorship Pitch Dry-Runs',
    date: 'December 11 – December 20, 2026',
    desc: 'Top shortlisted teams receive 1-on-1 industry mentor feedback, refine pitch decks, and participate in mock Q&A rehearsals.',
    status: 'Upcoming',
    completed: false,
  },
  {
    phase: 'Phase 04',
    title: 'Grand Finale, Live Jury Pitch & Awards',
    date: 'December 28, 2026',
    desc: '6-minute live pitch (3m pitch + 2m Q&A + 1m scoring) in the Judge Arena; announcement of winners, internship offers, and certificate releases.',
    status: 'Upcoming',
    completed: false,
  },
];

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);
  const [faqSearch, setFaqSearch] = useState('');
  const [faqCategory, setFaqCategory] = useState('All');

  // Featured Problems State
  const [featuredProblems, setFeaturedProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(true);

  // Dynamic Event Timeline Milestones
  const [timeline, setTimeline] = useState(DEFAULT_TIMELINE_PHASES);

  // Live countdown to Phase 01 deadline (November 25, 2026 23:59:59)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const isAdmin =
    user?.role === 'admin' ||
    user?.email?.trim().toLowerCase() === 'matrucareai@gmail.com';
  const isJudge = user?.role === 'evaluator';
  const isVolunteer = user?.role === 'volunteer';

  useEffect(() => {
    const targetDate = new Date('2026-11-25T23:59:59').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch featured problem statements and dynamic event timeline
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoadingProblems(true);
        const [problemsRes, eventsRes] = await Promise.all([
          api.get('/events/problems/all'),
          api.get('/events'),
        ]);

        if (problemsRes.data?.success && Array.isArray(problemsRes.data.problems) && problemsRes.data.problems.length > 0) {
          setFeaturedProblems(problemsRes.data.problems.slice(0, 3));
        } else {
          setFeaturedProblems(FALLBACK_FEATURED_PROBLEMS);
        }

        if (eventsRes.data?.success && Array.isArray(eventsRes.data.events) && eventsRes.data.events[0]?.timeline?.length > 0) {
          setTimeline(eventsRes.data.events[0].timeline);
        }
      } catch (err) {
        setFeaturedProblems(FALLBACK_FEATURED_PROBLEMS);
      } finally {
        setLoadingProblems(false);
      }
    };

    fetchEventData();
  }, []);

  const tracks = [
    {
      title: 'Artificial Intelligence & ML',
      domain: 'AI/ML',
      description: 'Build predictive health diagnostics, automated workflows, and generative LLM applications.',
      icon: Cpu,
      color: 'from-purple-500 to-indigo-600',
    },
    {
      title: 'Full Stack Web Development',
      domain: 'Web Dev',
      description: 'Architect scalable web platforms using MERN stack, microservices, and real-time data pipelines.',
      icon: Globe2,
      color: 'from-sky-500 to-blue-600',
    },
    {
      title: 'IoT & Smart Devices',
      domain: 'IoT & Robotics',
      description: 'Connect hardware sensors, microcontrollers, and cloud telemetry for connected healthcare.',
      icon: Code2,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Cyber Security & Privacy',
      domain: 'Cyber Security',
      description: 'Design robust zero-trust security layers, encrypted medical storage, and audit systems.',
      icon: ShieldCheck,
      color: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Blockchain & Web3',
      domain: 'Blockchain & Web3',
      description: 'Build tamper-evident medical audit trails, decentralized patient consent, and cryptographic proof-of-care.',
      icon: Layers,
      color: 'from-cyan-500 to-blue-600',
    },
    {
      title: 'Healthcare & MedTech',
      domain: 'Healthcare Tech',
      description: 'Design offline-first mother-care portals, ASHA worker dispatchers, and emergency neonatal alert networks.',
      icon: Activity,
      color: 'from-rose-500 to-pink-600',
    },
    {
      title: 'Cloud & DevOps',
      domain: 'Cloud & DevOps',
      description: 'Engineer high-availability tele-health microservices, automated failover pipelines, and edge mesh telemetry.',
      icon: Zap,
      color: 'from-violet-500 to-purple-600',
    },
    {
      title: 'Open Innovation & Assistive Tech',
      domain: 'Open Innovation',
      description: 'Develop custom social-impact assistive tech, vernacular speech interfaces, or original innovations.',
      icon: Sparkles,
      color: 'from-amber-400 to-yellow-600',
    },
  ];

  const prizes = [
    {
      rank: '1st Place',
      title: 'Champion Innovator',
      amount: '₹50,000',
      perks: ['Paid Full-Stack Internship Offer', 'Winner Trophy & Certificate', '1-on-1 Mentorship with Founders'],
      highlight: true,
    },
    {
      rank: '2nd Place',
      title: 'Runner Up',
      amount: '₹30,000',
      perks: ['Fast-track Internship Interview', 'Certificate of Excellence', 'Tech Goodies & Swag Pack'],
      highlight: false,
    },
    {
      rank: '3rd Place',
      title: 'Second Runner Up',
      amount: '₹20,000',
      perks: ['Internship Interview Shortlist', 'Certificate of Merit', 'Cloud Credits & Tool Vouchers'],
      highlight: false,
    },
  ];

  // Official HackSphere 4-Pillar Judging Matrix (100 Marks / 100%)
  const evaluationCriteria = [
    {
      pillar: '01',
      title: 'Innovation & Originality',
      weight: '25 Marks',
      desc: 'Novelty of approach, creative problem solving, unique value proposition, and differentiation from existing marketplace solutions.',
      badge: '25% Weight',
      icon: Sparkles,
      color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30',
    },
    {
      pillar: '02',
      title: 'Technical Execution & Architecture',
      weight: '25 Marks',
      desc: 'Full-stack MERN robustness, clean modular ES code, resilient database schema design, fast query indexing, and secure API error handling.',
      badge: '25% Weight',
      icon: Code2,
      color: 'from-sky-500/20 to-blue-500/20 text-sky-400 border-sky-500/30',
    },
    {
      pillar: '03',
      title: 'Healthcare & Real-World Impact',
      weight: '25 Marks',
      desc: 'Tangible clinical utility, patient accessibility, addressing critical diagnostic pain points, and practical scalability for healthcare institutions.',
      badge: '25% Weight',
      icon: ShieldCheck,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      pillar: '04',
      title: 'Prototype Demo & Presentation',
      weight: '25 Marks',
      desc: 'Functioning interactive prototype, intuitive responsive UI/UX, clarity of pitch presentation deck, and concise demo walkthrough.',
      badge: '25% Weight',
      icon: Trophy,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
    },
  ];

  const faqs = [
    {
      category: 'Registration & Team',
      q: 'What is the required team size? Can I participate solo?',
      a: 'Teams can range from 1 to 5 members. Team size = 1 indicates solo participation. For teams of 2 to 5 members, the form dynamically provides fields to invite each teammate by email. Cross-college and cross-branch teams are 100% permitted.',
    },
    {
      category: 'Registration & Team',
      q: 'Is there any registration fee to participate in HackSphere 2026?',
      a: 'No. Participation in HackSphere National Innovation Hackathon 2026 is 100% free of charge. There are zero application, evaluation, or hidden certification fees.',
    },
    {
      category: 'Registration & Team',
      q: 'How does the OTP verification process work?',
      a: 'When you register an account, our backend generates a secure 6-digit OTP code dispatched via email from matrucareai@gmail.com. The OTP code is time-limited (expires in 10 minutes) and is invalidated immediately upon successful verification. If not received within a minute, please check your Spam/Junk folder.',
    },
    {
      category: 'Registration & Team',
      q: 'Who is eligible to participate?',
      a: 'Students currently enrolled in B.Tech, M.Tech, BCA, MCA, B.Sc, M.Sc, or related technical degrees across 1st, 2nd, 3rd, and 4th years are eligible. Mixed-college and multi-disciplinary teams are fully encouraged.',
    },
    {
      category: 'Registration & Team',
      q: 'Can I edit or withdraw my registration after submitting?',
      a: 'Yes! From your personal Candidate Dashboard, you can review your registered team details, update project links or member information, download your lanyard admission pass, or withdraw your entry if needed prior to final jury evaluation.',
    },
    {
      category: 'Tracks & Challenges',
      q: 'Do we have to pick from the 8+ Challenge Problem Statements, or can we do Open Innovation?',
      a: 'Both options are fully supported! You can choose any curated challenge statement from our 8+ track library (AI/ML, IoT, Web Dev, Cyber Security, Blockchain, Cloud, Healthcare Tech, Open Innovation) to receive starter kits and specific outcome rubrics. Alternatively, you can select "Open Innovation" to build and register your own custom solution.',
    },
    {
      category: 'Tracks & Challenges',
      q: 'Can a candidate or team submit multiple projects under different tracks?',
      a: 'Each registered team lead account can submit one primary project entry to ensure thorough mentor review and fair judging. You may update or refine your project links, presentation, and team roster anytime before the Phase 01 submission deadline.',
    },
    {
      category: 'Tracks & Challenges',
      q: 'Are there any restrictions on the tech stack we use?',
      a: 'No restrictions! You are free to architect your solution using modern web frameworks (MERN, Next.js, Django), mobile platforms (Flutter, React Native), AI/ML libraries (PyTorch, TensorFlow, LangChain), embedded IoT systems (ESP32, Arduino, Raspberry Pi), or Web3 smart contracts (Solidity).',
    },
    {
      category: 'Pitch & Judging',
      q: 'What is the 4-Pillar Evaluation Rubric and scoring scale?',
      a: 'All projects are evaluated across four official pillars, each scored from 1 to 10 points (total 40 points, normalized to 100%): (1) Innovation & Originality (25%), (2) Technical Architecture & Execution (25%), (3) Healthcare & Real-World Impact (25%), and (4) Prototype Demo & Presentation (25%).',
    },
    {
      category: 'Pitch & Judging',
      q: 'What is the duration and format of the Live Pitch Round?',
      a: 'Shortlisted teams present live to our executive jury. Each pitch session is strictly timed at 6 minutes total: 3 minutes for uninterrupted live demo and slide presentation, 2 minutes for interactive Jury Q&A, and 1 minute for score finalization. The judge console includes an integrated synchronized chime timer.',
    },
    {
      category: 'Pitch & Judging',
      q: 'What deliverables must be submitted by the deadline?',
      a: 'Each team must submit their Project Name, Track/Domain, Presentation slide deck link (Google Drive / OneDrive with "Anyone with link can view" permissions), and Prototype / Code repository link (GitHub / live demo URL). An optional short demo video link is recommended.',
    },
    {
      category: 'Certificates & Passes',
      q: 'When and how will Certificates of Participation and Merit be issued?',
      a: 'Official verified digital certificates are released directly on your Candidate Dashboard after the Grand Finale concludes and jury scores are published. Certificates are available in printable A4 landscape format and feature a tamper-proof cryptographic verification QR code.',
    },
    {
      category: 'Certificates & Passes',
      q: 'How is the Certificate QR code different from the Lanyard Entry Pass QR?',
      a: 'They serve two completely distinct purposes: The Lanyard Entry Pass QR (HS26-PASS-...) is used by on-site volunteers and security for gate check-in and attendee badge verification. The Certificate QR (HS26-CERT-...) points to our public credential verification portal (/verify-certificate) for recruiters, academic institutions, and LinkedIn verification.',
    },
    {
      category: 'Certificates & Passes',
      q: 'Do my teammates get individual entry passes and certificates?',
      a: 'Yes! Once teammates accept their email invitation, the dashboard generates individualized attendee lanyard passes with custom QR badges for each member, as well as personalized certificates bearing their name and team role.',
    },
  ];

  const filteredFaqs = useMemo(() => {
    let list = faqs;
    if (faqCategory !== 'All') {
      list = list.filter((f) => f.category === faqCategory);
    }
    if (faqSearch.trim()) {
      const term = faqSearch.toLowerCase().trim();
      list = list.filter(
        (f) =>
          f.q.toLowerCase().includes(term) ||
          f.a.toLowerCase().includes(term) ||
          f.category.toLowerCase().includes(term)
      );
    }
    return list;
  }, [faqSearch, faqCategory, faqs]);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-500/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[350px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-950/70 border border-sky-800/80 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-6 shadow-inner">
              <Sparkles className="w-3.5 h-3.5" />
              <span>HackSphere Innovation Arena • 2026 Edition</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Build the Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400">
                Intelligent Full-Stack Apps
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
              Join the official HackSphere National Innovation Hackathon. Showcase your technical chops across AI/ML, MERN stack, and Cloud engineering. Verify identity via OTP, form your team, and submit your breakthrough solution.
            </p>

            {/* Tech Stack Pills */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">React 18</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">Node.js</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">Express</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">MongoDB</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">Tailwind CSS</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">JWT &amp; RBAC</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400">Live Audit Logs</span>
            </div>

            {/* Live Registration Countdown */}
            <div className="mt-8 max-w-lg mx-auto bg-slate-900/90 border border-sky-900/60 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-3">
                <Clock className="w-3.5 h-3.5" />
                <span>Phase 01 Registration Deadline Closes In:</span>
              </div>
              <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
                <div className="bg-slate-950/80 p-2 sm:p-3 rounded-xl border border-slate-800">
                  <div className="text-xl sm:text-2xl font-extrabold text-white">{timeLeft.days}</div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Days</div>
                </div>
                <div className="bg-slate-950/80 p-2 sm:p-3 rounded-xl border border-slate-800">
                  <div className="text-xl sm:text-2xl font-extrabold text-white">{timeLeft.hours}</div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Hours</div>
                </div>
                <div className="bg-slate-950/80 p-2 sm:p-3 rounded-xl border border-slate-800">
                  <div className="text-xl sm:text-2xl font-extrabold text-white">{timeLeft.minutes}</div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Mins</div>
                </div>
                <div className="bg-slate-950/80 p-2 sm:p-3 rounded-xl border border-slate-800">
                  <div className="text-xl sm:text-2xl font-extrabold text-sky-400 font-mono">{timeLeft.seconds}</div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Secs</div>
                </div>
              </div>
            </div>

            {/* Role-Aware Intelligent CTA Actions */}
            <div className="mt-10 max-w-xl mx-auto">
              {isAuthenticated ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="text-slate-400">
                      Signed in as: <strong className="text-white">{user?.fullName || 'Operator'}</strong>
                    </span>
                    {isAdmin ? (
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold text-[10px] uppercase">
                        Super Admin
                      </span>
                    ) : isJudge ? (
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold text-[10px] uppercase">
                        Judge
                      </span>
                    ) : isVolunteer ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-[10px] uppercase">
                        Gate Volunteer
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400 font-semibold text-[10px] uppercase">
                        Candidate
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    {isAdmin ? (
                      <>
                        <Link
                          to="/admin"
                          className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-md shadow-rose-600/25 transition"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          <span>Admin Console</span>
                        </Link>
                        <Link
                          to="/judge"
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                        >
                          <Award className="w-4 h-4 text-amber-400" />
                          <span>Judge Queue</span>
                        </Link>
                        <Link
                          to="/volunteer"
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                        >
                          <QrCode className="w-4 h-4 text-emerald-400" />
                          <span>Pass Scanner</span>
                        </Link>
                      </>
                    ) : isJudge ? (
                      <>
                        <Link
                          to="/judge"
                          className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/25 transition"
                        >
                          <Award className="w-4 h-4" />
                          <span>Enter Judge Workspace</span>
                        </Link>
                        <Link
                          to="/judge/completed"
                          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                        >
                          <span>Review History</span>
                        </Link>
                      </>
                    ) : isVolunteer ? (
                      <>
                        <Link
                          to="/volunteer"
                          className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm shadow-md shadow-cyan-500/25 transition"
                        >
                          <QrCode className="w-4 h-4" />
                          <span>Open Gate Pass Scanner</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/dashboard"
                          className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-sm shadow-md shadow-sky-500/30 transition"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>My Candidate Dashboard</span>
                        </Link>
                        <Link
                          to="/register-hackathon"
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                        >
                          <PlusCircle className="w-4 h-4 text-sky-400" />
                          <span>Register Project</span>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    to="/signup"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-base shadow-lg shadow-sky-500/30 transition-all transform hover:-translate-y-0.5"
                  >
                    <span>Register Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-base transition-colors"
                  >
                    Participant Login
                  </Link>
                  <Link
                    to="/problems"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-sky-400 text-sm font-semibold transition"
                  >
                    <Target className="w-4 h-4" />
                    <span>Challenges</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Stats Banner */}
            <div className="mt-14 pt-10 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">₹1,00,000+</p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Total Prize Pool</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">1 – 5</p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Team Size (Solo or Team)</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">100%</p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">OTP-Verified Accounts</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">Direct</p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Internship Interview Offers</p>
              </div>
            </div>

            {/* Live Leaderboard Callout Banner */}
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/30 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3.5 text-left">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Live Scoring Arena</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <p className="text-sm font-semibold text-white">Explore Ranked Teams &amp; Real-Time Judge Evaluations</p>
                  </div>
                </div>
                <Link
                  to="/leaderboard"
                  className="shrink-0 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all hover:scale-105"
                >
                  <span>View Leaderboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Highlights / Tracks Section */}
      <section id="highlights" className="py-20 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-sky-400">Innovation Tracks</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Choose Your Hackathon Domain
            </p>
            <p className="mt-3 text-slate-400 text-base">
              Choose the domain that matches your team’s passion. Every track is evaluated by industry mentors on innovation, technical architecture, and impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tracks.map((track, idx) => {
              const IconComp = track.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-900 border border-slate-800 p-6 hover:border-slate-700 transition-all hover:shadow-xl hover:shadow-sky-950/20 flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${track.color} flex items-center justify-center text-white mb-5 shadow-md`}>
                      <IconComp className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{track.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{track.description}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center text-xs font-semibold text-sky-400">
                    <Link
                      to={
                        user
                          ? user.role === 'admin'
                            ? '/admin'
                            : user.role === 'evaluator'
                            ? '/judge'
                            : user.role === 'volunteer'
                            ? '/volunteer'
                            : `/dashboard?track=${encodeURIComponent(track.domain || track.title)}`
                          : `/signup?track=${encodeURIComponent(track.domain || track.title)}`
                      }
                      className="flex items-center hover:underline"
                    >
                      <span>Register for this Track</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Problem Statements / Challenges Section */}
      <section id="challenges" className="py-20 bg-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-sky-400 mb-2">
                <Target className="w-3.5 h-3.5" />
                <span>Smart India Hackathon Challenge Matrix</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Featured Problem Statements
              </h2>
              <p className="mt-2 text-slate-400 text-sm max-w-xl">
                Tackle curated industry and healthcare problem statements equipped with starter kits, outcome rubrics, and technical briefs.
              </p>
            </div>
            <Link
              to="/problems"
              className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 hover:text-sky-300 transition shrink-0"
            >
              <span>Explore All Challenge Statements</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProblems.map((prob) => (
              <div
                key={prob._id || prob.psId}
                className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 p-6 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-sky-950/20 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-sky-950 text-sky-400 border border-sky-800/60">
                      {prob.psId}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {prob.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 line-clamp-2 group-hover:text-sky-300 transition-colors">
                    {prob.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
                    {prob.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Difficulty: <strong className="text-slate-300">{prob.difficulty || 'Intermediate'}</strong>
                  </span>
                  <Link
                    to="/problems"
                    className="inline-flex items-center gap-1 font-semibold text-sky-400 hover:text-sky-300 transition"
                  >
                    <span>View Brief</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/problems"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              <span>View Full Problem Statements Library (8+ Tracks)</span>
              <ChevronRight className="w-4 h-4 text-sky-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-sky-400">Roadmap</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Event Timeline &amp; Milestones
            </p>
            <p className="mt-3 text-slate-400 text-base">
              Mark your calendar with the key event milestones from registration to grand finale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {timeline.map((item, idx) => {
              const isActive = item.status === 'Active';
              const isCompleted = item.status === 'Completed' || item.completed;

              return (
                <div
                  key={idx}
                  className={`relative p-6 rounded-2xl flex flex-col justify-between transition-all ${
                    isActive
                      ? 'bg-gradient-to-b from-slate-900 via-sky-950/20 to-slate-900 border-2 border-sky-500/60 shadow-xl shadow-sky-950/30 transform md:-translate-y-1'
                      : isCompleted
                      ? 'bg-slate-900/90 border border-slate-700/80'
                      : 'bg-slate-900/60 border border-slate-800/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase px-2.5 py-1 rounded bg-slate-800 text-sky-400">
                        {item.phase}
                      </span>
                      {isActive ? (
                        <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          <span>Active</span>
                        </span>
                      ) : isCompleted ? (
                        <span className="flex items-center gap-1 text-[11px] text-sky-400 font-medium bg-sky-950/40 px-2 py-0.5 rounded border border-sky-800/50">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completed</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-medium px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                          Upcoming
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white mb-1.5">{item.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-sky-400 font-medium mb-3">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.date}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-400">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Prizes Section */}
      <section id="prizes" className="py-20 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-sky-400">Rewards</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Prizes &amp; Internship Opportunities
            </p>
            <p className="mt-3 text-slate-400 text-base">
              Win cash awards, verified certificates, and top-tier full stack developer internship positions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {prizes.map((p, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-8 relative flex flex-col justify-between transition-all ${
                  p.highlight
                    ? 'bg-gradient-to-b from-sky-950/80 to-slate-900 border-2 border-sky-500 shadow-xl shadow-sky-500/20 transform md:-translate-y-2'
                    : 'bg-slate-900 border border-slate-800'
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-sky-500 text-white text-xs font-bold uppercase tracking-wider shadow-md">
                    First Place
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-sky-400 uppercase tracking-wider">{p.rank}</span>
                    <Trophy className={`w-6 h-6 ${p.highlight ? 'text-amber-400' : 'text-slate-500'}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{p.title}</h3>
                  <div className="text-3xl font-extrabold text-white mb-6">{p.amount}</div>

                  <ul className="space-y-3">
                    {p.perks.map((perk, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800">
                  <Link
                    to={isAuthenticated ? '/dashboard' : '/signup'}
                    className={`block w-full py-2.5 text-center rounded-xl text-sm font-semibold transition-all ${
                      p.highlight
                        ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-md shadow-sky-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    Compete for this Prize
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Official 4-Pillar Judging Matrix (100 Marks / 100%) */}
      <section id="evaluation" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-sky-400">Judging Rubric</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Official Evaluation Matrix (100 Marks)
            </p>
            <p className="mt-3 text-slate-400 text-base">
              Submissions are evaluated in real time by appointed industry judges across four balanced technical pillars.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {evaluationCriteria.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 font-bold text-sm">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">
                        {item.weight}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                      Pillar {item.pillar}
                    </span>
                    <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Scoring Scale: 1–10</span>
                    <span className="text-sky-400 font-semibold">{item.badge}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) Accordion */}
      <section id="faq" className="py-20 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs font-bold uppercase tracking-widest text-sky-400">Questions &amp; Answers</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Frequently Asked Questions
            </p>
            <p className="mt-3 text-slate-400 text-base">
              Everything you need to know about the registration, team management, and presentation guidelines.
            </p>
          </div>

          {/* Interactive FAQ Search Bar */}
          <div className="relative max-w-md mx-auto mb-6">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              placeholder="Search questions (e.g. certificates, pitch, team size, rubrics)..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition-colors"
            />
            {faqSearch && (
              <button
                onClick={() => setFaqSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* FAQ Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {['All', 'Registration & Team', 'Tracks & Challenges', 'Pitch & Judging', 'Certificates & Passes'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setFaqCategory(cat);
                  setOpenFaq(null);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  faqCategory === cat
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/25'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex items-start sm:items-center justify-between gap-3 text-base font-semibold text-white hover:text-sky-400 transition-colors"
                  >
                    <div className="space-y-1">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-sky-400 border border-slate-700/80 mr-2">
                        {faq.category}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-white">{faq.q}</span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 text-sky-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredFaqs.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm bg-slate-900/40 rounded-2xl border border-slate-800/60">
                No questions found matching "{faqSearch}". Try searching for keywords like "team", "eligibility", or "OTP".
              </div>
            )}
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-slate-400">
              Have another question not covered here?{' '}
              <Link to="/contact" className="text-sky-400 hover:underline font-semibold">
                Contact our organizing team directly
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-sky-900/40 via-blue-900/30 to-indigo-900/40 border border-sky-800/40 p-10 md:p-14 text-center relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Ready to showcase your skills?
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-xl mx-auto">
                Sign up today, verify your email with a 6-digit OTP, assemble your team, and build something exceptional.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to={
                    user
                      ? user.role === 'admin'
                        ? '/admin'
                        : user.role === 'evaluator'
                        ? '/judge'
                        : user.role === 'volunteer'
                        ? '/volunteer'
                        : '/dashboard'
                      : '/signup'
                  }
                  className="px-8 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-base shadow-lg shadow-sky-500/30 transition-all"
                >
                  {user ? 'Go to Candidate Dashboard' : 'Create Account & Register'}
                </Link>
                <Link
                  to="/contact"
                  className="px-8 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-base transition-colors"
                >
                  Have Questions? Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
