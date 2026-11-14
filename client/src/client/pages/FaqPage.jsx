import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  HelpCircle,
  Search,
  X,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Mail,
  ArrowRight,
  Target,
  Trophy,
  Award,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';

const FAQ_CATEGORIES = [
  'All',
  'Registration & Team',
  'Tracks & Challenges',
  'Pitch & Judging',
  'Certificates & Passes',
  'Rules & Conduct',
];

const FAQS_KNOWLEDGE_BASE = [
  {
    category: 'Registration & Team',
    q: 'What is the required team size? Can I participate solo?',
    a: 'Teams can range from 1 to 5 members. Team size = 1 indicates solo participation. For teams of 2 to 5 members, the registration form dynamically provides fields to invite each teammate by email. Cross-college and cross-branch teams are 100% permitted.',
    badge: 'Eligibility',
  },
  {
    category: 'Registration & Team',
    q: 'Is there any registration or entry fee to participate?',
    a: 'No. Participation in HackSphere National Innovation Hackathon 2026 is 100% free of charge. There are zero application, evaluation, or hidden certification fees for students and academic teams.',
    badge: 'Free Entry',
  },
  {
    category: 'Registration & Team',
    q: 'How does the OTP verification process work?',
    a: 'When you register an account, our server generates a secure 6-digit OTP code dispatched via email from matrucareai@gmail.com. The OTP code is time-limited (expires in 10 minutes) and is invalidated immediately upon successful verification. If not received within a minute, please check your Spam/Junk folder or request a new code.',
    badge: 'Security',
  },
  {
    category: 'Registration & Team',
    q: 'Who is eligible to participate in HackSphere 2026?',
    a: 'Undergraduate and postgraduate students currently enrolled in B.Tech, M.Tech, BCA, MCA, B.Sc, M.Sc, or related technical degrees across 1st, 2nd, 3rd, and 4th years are eligible. Mixed-college and multi-disciplinary teams are fully welcomed.',
    badge: 'Eligibility',
  },
  {
    category: 'Registration & Team',
    q: 'Can I edit or withdraw my registration after submitting?',
    a: 'Yes! From your personal Candidate Dashboard, you can review your registered team details, update project presentation links or member information, download your lanyard admission pass, or withdraw your entry if needed prior to final jury evaluation.',
    badge: 'Dashboard',
  },
  {
    category: 'Tracks & Challenges',
    q: 'Do we have to pick from the 8+ Challenge Problem Statements, or can we do Open Innovation?',
    a: 'Both options are fully supported! You can choose any curated challenge statement from our 8+ track library (AI/ML, IoT, Web Dev, Cyber Security, Blockchain, Cloud, Healthcare Tech, Open Innovation) to receive starter kits and specific outcome rubrics. Alternatively, you can select "Open Innovation" to build and register your own custom solution.',
    badge: 'Challenges',
  },
  {
    category: 'Tracks & Challenges',
    q: 'Can a candidate or team submit multiple projects under different tracks?',
    a: 'Each registered team lead account can submit one primary project entry to ensure thorough mentor review and fair judging. You may update or refine your project links, presentation, and team roster anytime before the Phase 01 submission deadline.',
    badge: 'Policy',
  },
  {
    category: 'Tracks & Challenges',
    q: 'Are there any restrictions on the tech stack we use?',
    a: 'No restrictions! You are free to architect your solution using modern web frameworks (MERN, Next.js, Django), mobile platforms (Flutter, React Native), AI/ML libraries (PyTorch, TensorFlow, LangChain), embedded IoT systems (ESP32, Arduino, Raspberry Pi), or Web3 smart contracts (Solidity).',
    badge: 'Architecture',
  },
  {
    category: 'Pitch & Judging',
    q: 'What is the 4-Pillar Evaluation Rubric and scoring scale?',
    a: 'All projects are evaluated across four official pillars, each scored from 1 to 10 points (total 40 points, normalized to 100%): (1) Innovation & Originality (25%), (2) Technical Architecture & Execution (25%), (3) Healthcare & Real-World Impact (25%), and (4) Prototype Demo & Presentation (25%).',
    badge: 'Rubrics',
  },
  {
    category: 'Pitch & Judging',
    q: 'What is the duration and format of the Live Pitch Round?',
    a: 'Shortlisted teams present live to our executive jury. Each pitch session is strictly timed at 6 minutes total: 3 minutes for uninterrupted live demo and slide presentation, 2 minutes for interactive Jury Q&A, and 1 minute for score finalization. The judge console includes an integrated synchronized chime timer.',
    badge: 'Timing',
  },
  {
    category: 'Pitch & Judging',
    q: 'What deliverables must be submitted by the deadline?',
    a: 'Each team must submit their Project Name, Track/Domain, Presentation slide deck link (Google Drive / OneDrive with "Anyone with link can view" permissions), and Prototype / Code repository link (GitHub / live demo URL). An optional short demo video link is recommended.',
    badge: 'Submissions',
  },
  {
    category: 'Certificates & Passes',
    q: 'When and how will Certificates of Participation and Merit be issued?',
    a: 'Official verified digital certificates are released directly on your Candidate Dashboard after the Grand Finale concludes and jury scores are published. Certificates are available in printable A4 landscape format and feature a tamper-proof cryptographic verification QR code.',
    badge: 'Credentials',
  },
  {
    category: 'Certificates & Passes',
    q: 'How is the Certificate QR code different from the Lanyard Entry Pass QR?',
    a: 'They serve two completely distinct purposes: The Lanyard Entry Pass QR (HS26-PASS-...) is used by on-site volunteers and security for gate check-in and attendee badge verification. The Certificate QR (HS26-CERT-...) points to our public credential verification portal (/verify-certificate) for recruiters, academic institutions, and LinkedIn verification.',
    badge: 'QR Codes',
  },
  {
    category: 'Certificates & Passes',
    q: 'Do my teammates get individual entry passes and certificates?',
    a: 'Yes! Once teammates accept their email invitation, the dashboard generates individualized attendee lanyard passes with custom QR badges for each member, as well as personalized certificates bearing their name and team role.',
    badge: 'Roster',
  },
  {
    category: 'Rules & Conduct',
    q: 'What are the rules regarding code originality and pre-existing templates?',
    a: 'All core project architecture and prototype features must be authored during the hackathon period. You are permitted to use open-source third-party libraries, public datasets, UI component kits, and APIs, provided they are cited in your repository README. Plagiarism or copying another team’s repository is grounds for immediate disqualification.',
    badge: 'Integrity',
  },
];

const FaqPage = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (!categoryParam) return 'All';
    const match = FAQ_CATEGORIES.find((c) =>
      c.toLowerCase().includes(categoryParam.toLowerCase())
    );
    return match || 'All';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    if (categoryParam) {
      const match = FAQ_CATEGORIES.find((c) =>
        c.toLowerCase().includes(categoryParam.toLowerCase())
      );
      if (match) setSelectedCategory(match);
    }
  }, [categoryParam]);

  const filteredFaqs = useMemo(() => {
    let list = FAQS_KNOWLEDGE_BASE;
    if (selectedCategory !== 'All') {
      list = list.filter((f) => f.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (f) =>
          f.q.toLowerCase().includes(q) ||
          f.a.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q) ||
          (f.badge && f.badge.toLowerCase().includes(q))
      );
    }
    return list;
  }, [selectedCategory, searchQuery]);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-10">
        
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-semibold shadow-inner">
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <span>HackSphere 2026 • Official Knowledge Base &amp; Help Center</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Frequently Asked <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Questions</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Find immediate answers regarding team formation, problem statements, the 4-pillar evaluation rubric, gate passes, and verified certificate credentials.
          </p>
        </div>

        {/* Filter and Search Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords (e.g., certificates, live pitch, free entry, rubric, team size)..."
              className="w-full pl-11 pr-10 py-3 bg-slate-950 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                title="Clear Search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setOpenFaq(null);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/25'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion Questions List */}
        <div className="space-y-3.5">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className={`border rounded-2xl transition-all overflow-hidden ${
                  isOpen
                    ? 'bg-slate-900 border-sky-500/40 shadow-lg shadow-sky-950/20'
                    : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-start sm:items-center justify-between gap-4 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-sky-400 border border-slate-700/80">
                        {faq.category}
                      </span>
                      {faq.badge && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-950 text-indigo-300 border border-indigo-800/80">
                          {faq.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white hover:text-sky-300 transition-colors">
                      {faq.q}
                    </h3>
                  </div>

                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-sky-400' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-4">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
              <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-white">No Matching Questions Found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No FAQs matched your search for &quot;{searchQuery}&quot;. Try searching for &quot;team&quot;, &quot;certificates&quot;, or &quot;rubric&quot;.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-2 text-xs font-semibold text-sky-400 hover:underline"
              >
                Clear Filters &amp; View All
              </button>
            </div>
          )}
        </div>

        {/* Quick Help & Contact Card */}
        <div className="rounded-3xl bg-gradient-to-r from-sky-950/80 via-indigo-950/70 to-slate-900 border border-sky-800/50 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-400">
              <Mail className="w-3.5 h-3.5" />
              <span>Direct Support Team</span>
            </div>
            <h3 className="text-xl font-bold text-white">Still have questions or special requirements?</h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Our academic and technical organizing committee is available to help. Reach out directly or send us an inquiry.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              to="/contact"
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-sky-500/25"
            >
              <span>Contact Committee</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/problems"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs sm:text-sm font-semibold transition flex items-center gap-2"
            >
              <Target className="w-4 h-4 text-sky-400" />
              <span>Browse Challenges</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FaqPage;

