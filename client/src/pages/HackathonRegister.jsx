import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Sparkles,
  Users,
  User,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Calendar,
  Layers,
  FileCode,
  Link as LinkIcon,
  Video,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Plus,
  Target,
  ExternalLink,
} from 'lucide-react';

const collegesList = [
  'Indian Institute of Technology (IIT Bombay)',
  'Indian Institute of Technology (IIT Delhi)',
  'Indian Institute of Technology (IIT Madras)',
  'National Institute of Technology (NIT Trichy)',
  'Birla Institute of Technology and Science (BITS Pilani)',
  'Delhi Technological University (DTU)',
  'Vellore Institute of Technology (VIT)',
  'SRM Institute of Science and Technology',
  'Jadavpur University',
  'Manipal Institute of Technology',
  'Anna University',
  'Thapar Institute of Engineering and Technology',
  'Amity University',
  'Other Institution / College',
];

const HackathonRegister = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If editing an existing registration
  const editEntry = location.state?.editEntry || null;

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    mobileNumber: user?.mobileNumber || '',
    collegeName: user?.collegeName || '',
    course: user?.course || 'B.Tech',
    branch: user?.branch || 'CSE',
    yearOfStudy: user?.yearOfStudy || '3rd Year',
    domain: 'AI/ML',
    problemStatementId: '',
    problemStatementTitle: '',
    projectName: '',
    pptLink: '',
    prototypeLink: '',
    demoVideoLink: '',
    teamSize: 1,
    teamMembers: [],
  });

  const [availableProblems, setAvailableProblems] = useState([]);
  const [otherBranch, setOtherBranch] = useState('');
  const [otherCourse, setOtherCourse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const standardBranches = ['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'AIDS', 'AIML'];
  const standardCourses = ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'B.Sc', 'M.Sc'];

  // Load available challenge problem statements
  useEffect(() => {
    api
      .get('/events/problems/all')
      .then((res) => {
        if (res.data.success) {
          setAvailableProblems(res.data.problems || []);
        }
      })
      .catch(() => {});
  }, []);

  // Pre-fill problem statement from query parameters (e.g. from /problems page)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const psId = params.get('psId');
    const track = params.get('track');
    const title = params.get('title');

    if (psId) {
      setFormData((prev) => ({
        ...prev,
        problemStatementId: psId,
        problemStatementTitle: title || '',
        domain: track || prev.domain,
      }));
    }
  }, [location.search]);

  // Check if candidate already has an active registration
  useEffect(() => {
    if (!editEntry) {
      api
        .get('/hackathon/my-entry')
        .then((res) => {
          if (res.data.success && res.data.entry) {
            navigate('/dashboard?already_registered=true', { replace: true });
          }
        })
        .catch(() => {});
    }
  }, [editEntry, navigate]);

  // Prepopulate if user or editEntry changes
  useEffect(() => {
    if (editEntry) {
      const isCustomBranch = !standardBranches.includes(editEntry.branch);
      const isCustomCourse = !standardCourses.includes(editEntry.course);

      setFormData({
        fullName: editEntry.fullName || user?.fullName || '',
        email: editEntry.email || user?.email || '',
        mobileNumber: editEntry.mobileNumber || '',
        collegeName: editEntry.collegeName || '',
        course: isCustomCourse ? 'Other' : (editEntry.course || 'B.Tech'),
        branch: isCustomBranch ? 'Other' : (editEntry.branch || 'CSE'),
        yearOfStudy: editEntry.yearOfStudy || '3rd Year',
        domain: editEntry.domain || 'AI/ML',
        problemStatementId: editEntry.problemStatementId || '',
        problemStatementTitle: editEntry.problemStatementTitle || '',
        projectName: editEntry.projectName || '',
        pptLink: editEntry.pptLink || '',
        prototypeLink: editEntry.prototypeLink || '',
        demoVideoLink: editEntry.demoVideoLink || '',
        teamSize: editEntry.teamSize || 1,
        teamMembers: editEntry.teamMembers || [],
      });

      if (isCustomBranch) setOtherBranch(editEntry.branch);
      if (isCustomCourse) setOtherCourse(editEntry.course);
    } else if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        email: user.email || prev.email,
        mobileNumber: prev.mobileNumber || user.mobileNumber || '',
        collegeName: prev.collegeName || user.collegeName || '',
        course: prev.course && prev.course !== 'B.Tech' ? prev.course : (user.course || 'B.Tech'),
        branch: prev.branch && prev.branch !== 'CSE' ? prev.branch : (user.branch || 'CSE'),
        yearOfStudy: prev.yearOfStudy && prev.yearOfStudy !== '3rd Year' ? prev.yearOfStudy : (user.yearOfStudy || '3rd Year'),
      }));
    }
  }, [user, editEntry]);

  // Adjust teamMembers array whenever teamSize changes
  const handleTeamSizeChange = (newSize) => {
    const size = parseInt(newSize, 10);
    const requiredExtraMembers = size > 1 ? size - 1 : 0;

    let updatedMembers = [...formData.teamMembers];
    if (updatedMembers.length < requiredExtraMembers) {
      // Add empty member slots
      const toAdd = requiredExtraMembers - updatedMembers.length;
      for (let i = 0; i < toAdd; i++) {
        updatedMembers.push({ name: '', email: '' });
      }
    } else if (updatedMembers.length > requiredExtraMembers) {
      // Trim excess slots
      updatedMembers = updatedMembers.slice(0, requiredExtraMembers);
    }

    setFormData({
      ...formData,
      teamSize: size,
      teamMembers: updatedMembers,
    });
  };

  const handleMemberChange = (index, field, value) => {
    const updated = [...formData.teamMembers];
    updated[index][field] = value;
    setFormData({ ...formData, teamMembers: updated });
    if (error) setError('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Field Validations
    if (formData.fullName.trim().length < 3) {
      setError('Full Name must be at least 3 characters');
      return;
    }

    if (!/^[a-zA-Z\s.]+$/.test(formData.fullName)) {
      setError('Full Name must contain letters and spaces only');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.mobileNumber.trim())) {
      setError('Please provide a valid 10-digit Indian mobile number');
      return;
    }

    if (formData.projectName.trim().length < 5) {
      setError('Project Name must be at least 5 characters long');
      return;
    }

    if (!validateUrl(formData.pptLink)) {
      setError('Please enter a valid presentation (PPT) URL (e.g. Google Drive/OneDrive shareable link)');
      return;
    }

    if (!validateUrl(formData.prototypeLink)) {
      setError('Please enter a valid Prototype URL (e.g. GitHub repo, Figma, or live website link)');
      return;
    }

    if (formData.demoVideoLink && !validateUrl(formData.demoVideoLink)) {
      setError('Please enter a valid Demo Video URL (e.g. YouTube or Drive link)');
      return;
    }

    // Validate dynamic team members
    if (formData.teamSize > 1) {
      for (let i = 0; i < formData.teamMembers.length; i++) {
        const m = formData.teamMembers[i];
        if (!m.name.trim() || !m.email.trim()) {
          setError(`Please provide both name and email for Team Member #${i + 2}`);
          return;
        }
        if (!/^\S+@\S+\.\S+$/.test(m.email.trim())) {
          setError(`Invalid email address for Team Member #${i + 2}`);
          return;
        }
      }
    }

    if (formData.course === 'Other' && !otherCourse.trim()) {
      setError('Please specify your course / degree');
      return;
    }

    if (formData.branch === 'Other' && !otherBranch.trim()) {
      setError('Please specify your branch / discipline');
      return;
    }

    const payload = {
      ...formData,
      collegeName: formData.collegeName.trim(),
      course: formData.course === 'Other' ? otherCourse.trim() : formData.course,
      branch: formData.branch === 'Other' ? otherBranch.trim() : formData.branch,
    };

    try {
      setLoading(true);

      if (editEntry) {
        // PUT update
        const res = await api.put(`/hackathon/${editEntry._id}`, payload);
        if (res.data.success) {
          setSuccess('Hackathon registration successfully updated!');
          setTimeout(() => navigate('/dashboard'), 1200);
        }
      } else {
        // POST create
        const res = await api.post('/hackathon/register', payload);
        if (res.data.success) {
          setSuccess('Registration submitted! Confirmation email sent via Nodemailer.');
          setTimeout(() => navigate('/dashboard?registered=true'), 1500);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit registration. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-950/70 border border-sky-800/80 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HackSphere National Hackathon 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {editEntry ? 'Update Hackathon Registration' : 'Official Hackathon Registration Form'}
          </h1>
          <p className="mt-2 text-slate-400 text-sm max-w-xl mx-auto">
            Fill in your project details, academic profile, and team members. All fields are mandatory unless marked optional.
          </p>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="mb-8 p-4 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-sm flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-8 p-4 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-sm flex items-start gap-3 shadow-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Lead Participant / Personal Info */}
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3 mb-5">
                <User className="w-5 h-5 text-sky-400" />
                <span>1. Primary Candidate Information</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Min 3 letters (e.g. Rohit Sharma)"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Min 3 characters, alphabets and spaces only</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    readOnly
                    value={formData.email}
                    className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-400 text-sm cursor-not-allowed"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Pre-filled from your authenticated session</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Mobile Number <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-sm font-medium">
                      +91
                    </span>
                    <input
                      type="tel"
                      name="mobileNumber"
                      required
                      maxLength={10}
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="w-full pl-12 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">10-digit Indian mobile number</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    College / University <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="collegeName"
                    required
                    value={formData.collegeName}
                    onChange={handleChange}
                    placeholder="Enter your college or university name"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Academic Profile */}
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3 mb-5">
                <GraduationCap className="w-5 h-5 text-sky-400" />
                <span>2. Academic Background</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Course <span className="text-rose-400">*</span>
                  </label>
                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                  >
                    <option value="B.Tech">B.Tech</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="BCA">BCA</option>
                    <option value="MCA">MCA</option>
                    <option value="B.Sc">B.Sc</option>
                    <option value="M.Sc">M.Sc</option>
                    <option value="Other">Other</option>
                  </select>

                  {formData.course === 'Other' && (
                    <div className="mt-2.5">
                      <input
                        type="text"
                        required
                        value={otherCourse}
                        onChange={(e) => {
                          setOtherCourse(e.target.value);
                          if (error) setError('');
                        }}
                        placeholder="Specify your course / degree"
                        className="w-full px-3.5 py-2 bg-slate-950 border border-sky-600 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-400"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Branch / Discipline <span className="text-rose-400">*</span>
                  </label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                  >
                    <option value="CSE">Computer Science (CSE)</option>
                    <option value="IT">Information Technology (IT)</option>
                    <option value="ECE">Electronics & Comm (ECE)</option>
                    <option value="AIDS">AI & Data Science (AIDS)</option>
                    <option value="AIML">AI & Machine Learning (AIML)</option>
                    <option value="EE">Electrical (EE)</option>
                    <option value="ME">Mechanical (ME)</option>
                    <option value="CE">Civil (CE)</option>
                    <option value="Other">Other</option>
                  </select>

                  {formData.branch === 'Other' && (
                    <div className="mt-2.5">
                      <input
                        type="text"
                        required
                        value={otherBranch}
                        onChange={(e) => {
                          setOtherBranch(e.target.value);
                          if (error) setError('');
                        }}
                        placeholder="Specify your branch / discipline"
                        className="w-full px-3.5 py-2 bg-slate-950 border border-sky-600 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-400"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Year of Study <span className="text-rose-400">*</span>
                  </label>
                  <select
                    name="yearOfStudy"
                    value={formData.yearOfStudy}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Project & Track Details */}
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3 mb-5">
                <FileCode className="w-5 h-5 text-sky-400" />
                <span>3. Project & Submission Details</span>
              </h2>

              {/* SIH / National Format: Problem Statement Selector */}
              {availableProblems.length > 0 && (
                <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/40 border border-sky-800/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-sky-400" />
                      Target Problem Statement (SIH / National Format)
                    </label>
                    <Link
                      to="/problems"
                      target="_blank"
                      className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                    >
                      Browse Catalog <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                  <select
                    value={formData.problemStatementId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const found = availableProblems.find((p) => p.psId === selectedId);
                      setFormData((prev) => ({
                        ...prev,
                        problemStatementId: selectedId,
                        problemStatementTitle: found?.title || '',
                        domain: found?.category || prev.domain,
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-sky-500"
                  >
                    <option value="">-- Open Innovation / Custom Track (No Specific Challenge) --</option>
                    {availableProblems.map((p) => (
                      <option key={p.psId} value={p.psId}>
                        [{p.psId}] {p.title} • ({p.category})
                      </option>
                    ))}
                  </select>
                  {formData.problemStatementId && (
                    <div className="p-2.5 rounded-xl bg-sky-950/80 border border-sky-800/80 text-xs text-sky-200 space-y-1">
                      <p className="font-semibold text-white">
                        ✓ Selected: [{formData.problemStatementId}] {formData.problemStatementTitle}
                      </p>
                      <p className="text-[11px] text-sky-300/80">
                        Category auto-locked to <strong className="text-white">{formData.domain}</strong>.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Domain / Track <span className="text-rose-400">*</span>
                  </label>
                  <select
                    name="domain"
                    value={formData.domain}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                  >
                    <option value="AI/ML">AI & Machine Learning</option>
                    <option value="Web Dev">Full Stack Web Development</option>
                    <option value="IoT & Robotics">IoT & Embedded Systems</option>
                    <option value="Cyber Security">Cyber Security & Privacy</option>
                    <option value="Blockchain & Web3">Blockchain & Web3</option>
                    <option value="Healthcare Tech">Healthcare & Diagnostics Tech</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Project Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="projectName"
                    required
                    value={formData.projectName}
                    onChange={handleChange}
                    placeholder="Min 5 characters (e.g. HackSphere Telehealth)"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Presentation (PPT) Link <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <LinkIcon className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      name="pptLink"
                      required
                      value={formData.pptLink}
                      onChange={handleChange}
                      placeholder="https://drive.google.com/..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Google Drive or OneDrive shareable link</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Prototype / Repo Link <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <FileCode className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      name="prototypeLink"
                      required
                      value={formData.prototypeLink}
                      onChange={handleChange}
                      placeholder="https://github.com/..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">GitHub, Figma, or live hosted prototype</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Demo Video Link <span className="text-slate-500 text-[10px]">(Optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Video className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      name="demoVideoLink"
                      value={formData.demoVideoLink}
                      onChange={handleChange}
                      placeholder="https://youtube.com/..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">YouTube or Drive video walk-through</p>
                </div>
              </div>
            </div>

            {/* Section 4: Dynamic Team Size & Members */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-sky-400" />
                  <span>4. Team Configuration & Members</span>
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Team Size:</span>
                  <select
                    name="teamSize"
                    value={formData.teamSize}
                    onChange={(e) => handleTeamSizeChange(e.target.value)}
                    className="px-3 py-1 bg-slate-950 border border-sky-600 rounded-lg text-white font-bold text-sm focus:outline-none"
                  >
                    <option value={1}>1 (Solo Participant)</option>
                    <option value={2}>2 Members</option>
                    <option value={3}>3 Members</option>
                    <option value={4}>4 Members</option>
                    <option value={5}>5 Members</option>
                  </select>
                </div>
              </div>

              {formData.teamSize === 1 ? (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 text-sm">
                  <p className="font-medium text-slate-300">Solo Participation Selected</p>
                  <p className="text-xs text-slate-500 mt-1">
                    You are registered as the single developer and presenter for this submission. No additional team member inputs required.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400">
                    Leader: <strong className="text-white">{formData.fullName} ({formData.email})</strong>. Provide name and email for the other {formData.teamSize - 1} team member(s):
                  </p>

                  {formData.teamMembers.map((member, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center"
                    >
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Member #{index + 2} Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={member.name}
                          onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                          placeholder="e.g. Aditi Roy"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Member #{index + 2} Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={member.email}
                          onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                          placeholder="member@example.com"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submission Button */}
            <div className="pt-6 border-t border-slate-800 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>{editEntry ? 'Update Registration' : 'Submit Hackathon Registration'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default HackathonRegister;

