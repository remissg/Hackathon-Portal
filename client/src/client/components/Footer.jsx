import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, Github, Linkedin, Twitter, ExternalLink, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                <Sparkles className="w-4 h-4 text-sky-200" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Hack<span className="text-sky-400 font-extrabold">Sphere</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Empowering next-generation full stack engineers and innovators to build impactful real-world healthcare & AI technologies.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-sky-400 hover:border-slate-700 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-sky-400 hover:border-slate-700 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-sky-400 transition-colors">Home Landing</Link>
              </li>
              <li>
                <Link to="/problems" className="hover:text-sky-400 transition-colors">Problem Statements Library</Link>
              </li>
              <li>
                <Link to="/leaderboard" className="hover:text-sky-400 transition-colors">Live Leaderboard</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-sky-400 transition-colors">Frequently Asked Questions (FAQ)</Link>
              </li>
              <li>
                <a href="/#timeline" className="hover:text-sky-400 transition-colors">Event Schedule &amp; Milestones</a>
              </li>
              <li>
                <Link to="/contact" className="hover:text-sky-400 transition-colors">Support &amp; Contact</Link>
              </li>
            </ul>
          </div>

          {/* Participant Portal */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Participant Hub
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/signup" className="hover:text-sky-400 transition-colors">Register for Hackathon</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-sky-400 transition-colors">Participant Sign In</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-sky-400 transition-colors">Candidate Dashboard</Link>
              </li>
              <li>
                <Link to="/register-hackathon" className="hover:text-sky-400 transition-colors">Team Project Submission</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Official Contact
            </h4>
            <p className="text-sm text-slate-400 mb-3">
              For queries regarding the internship program and hackathon guidelines, reach out to our team:
            </p>
            <div className="flex items-center gap-2 text-sm text-sky-400 font-medium bg-slate-900 border border-slate-800 p-3 rounded-lg">
              <Mail className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <a href="mailto:matrucareai@gmail.com" className="hover:underline truncate">
                matrucareai@gmail.com
              </a>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Programme: Full Stack Developer Track • Level: Intermediate
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} HackSphere Global. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with MERN Stack + Nodemailer for the Internship Track
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

