import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  Mail,
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const tracks = [
    {
      title: 'Artificial Intelligence & ML',
      description: 'Build predictive health diagnostics, automated workflows, and generative LLM applications.',
      icon: Cpu,
      color: 'from-purple-500 to-indigo-600',
    },
    {
      title: 'Full Stack Web Development',
      description: 'Architect scalable web platforms using MERN stack, microservices, and real-time data pipelines.',
      icon: Globe2,
      color: 'from-sky-500 to-blue-600',
    },
    {
      title: 'IoT & Smart Devices',
      description: 'Connect hardware sensors, microcontrollers, and cloud telemetry for connected healthcare.',
      icon: Code2,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Cyber Security & Privacy',
      description: 'Design robust zero-trust security layers, encrypted medical storage, and audit systems.',
      icon: ShieldCheck,
      color: 'from-amber-500 to-orange-600',
    },
  ];

  const timeline = [
    {
      phase: 'Phase 01',
      title: 'Registration & Team Formation',
      date: 'November 06 – November 25, 2026',
      desc: 'Sign up on the portal, verify via OTP, assemble your team (1-5 members), and submit project outlines.',
      completed: true,
    },
    {
      phase: 'Phase 02',
      title: 'Prototype Submission & PPT',
      date: 'November 26 – December 10, 2026',
      desc: 'Submit your GitHub repo, live demo prototype link, and slide deck presentation.',
      completed: false,
    },
    {
      phase: 'Phase 03',
      title: 'Mentorship & Review',
      date: 'December 11 – December 20, 2026',
      desc: 'Shortlisted teams undergo technical screening and mentor code reviews by senior engineers.',
      completed: false,
    },
    {
      phase: 'Phase 04',
      title: 'Grand Finale & Results',
      date: 'December 28, 2026',
      desc: 'Live virtual demo day presentations, winners announcement, and internship offers.',
      completed: false,
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-500/15 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-[350px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-950/70 border border-sky-800/80 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-8 shadow-inner">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MatruCare AI Internship Programme • 2026 Edition</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Build the Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400">
                Intelligent Full-Stack Apps
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
              Join the official MatruCare AI Hackathon. Showcase your technical chops across AI/ML, MERN stack, and Cloud engineering. Verify identity via OTP, form your team, and submit your breakthrough solution.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-base shadow-lg shadow-sky-500/30 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Go to My Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
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
                </>
              )}
            </div>

            {/* Quick stats banner */}
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
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Verified Registration</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">Direct</p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Internship Interview Offers</p>
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
              Choose the domain that matches your team’s passion. Every track will be judged by industry mentors on creativity, technical depth, and execution.
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
                    <span>Explore Track</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-sky-400">Roadmap</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Event Timeline & Milestones
            </p>
            <p className="mt-3 text-slate-400 text-base">
              Mark your calendar with the key event milestones from registration to grand finale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {timeline.map((item, idx) => (
              <div
                key={idx}
                className="relative bg-slate-900/80 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase px-2.5 py-1 rounded bg-slate-800 text-sky-400">
                      {item.phase}
                    </span>
                    {item.completed ? (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-medium">Upcoming</span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{item.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-sky-400 font-medium mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.date}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prizes Section */}
      <section id="prizes" className="py-20 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-sky-400">Rewards</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Prizes & Internship Opportunities
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

      {/* CTA Footer Banner */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-sky-900/40 via-blue-900/30 to-indigo-900/40 border border-sky-800/40 p-10 md:p-14 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Ready to showcase your skills?
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-xl mx-auto">
                Sign up today, verify your email with a 6-digit OTP, assemble your team, and build something exceptional.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/signup"
                  className="px-8 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-base shadow-lg shadow-sky-500/30 transition-all"
                >
                  Create Account & Register
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

