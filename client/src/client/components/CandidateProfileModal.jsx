import React, { useState, useEffect } from 'react';
import api from '../../shared/services/api';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  FileCode,
  Github,
  Globe,
  GraduationCap,
  Linkedin,
  Lock,
  Sparkles,
  X,
} from 'lucide-react';

const CandidateProfileModal = ({ isOpen, onClose, user, updateUser, onSaved }) => {
  const buildInitialForm = () => ({
    fullName: user?.fullName || '',
    mobileNumber: user?.mobileNumber || '',
    collegeName: user?.collegeName || '',
    course: user?.course || 'B.Tech',
    branch: user?.branch || 'CSE',
    yearOfStudy: user?.yearOfStudy || '3rd Year',
    headline: user?.headline || '',
    githubUrl: user?.githubUrl || '',
    linkedinUrl: user?.linkedinUrl || '',
    portfolioUrl: user?.portfolioUrl || '',
    skills: Array.isArray(user?.skills) ? user.skills.join(', ') : (user?.skills || ''),
    bio: user?.bio || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileTab, setProfileTab] = useState('academic');
  const [profileForm, setProfileForm] = useState(buildInitialForm);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setProfileForm(buildInitialForm());
      setProfileTab('academic');
      setProfileMessage('');
      setProfileSuccessMsg('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    setProfileSuccessMsg('');

    if (!profileForm.fullName.trim() || profileForm.fullName.trim().length < 3) {
      setProfileMessage('Full name must be at least 3 characters');
      setProfileTab('academic');
      return;
    }

    if (profileForm.mobileNumber && !/^[0-9]{10}$/.test(profileForm.mobileNumber.trim())) {
      setProfileMessage('Please enter a valid 10-digit mobile number');
      setProfileTab('academic');
      return;
    }

    if (profileForm.newPassword) {
      if (!profileForm.currentPassword) {
        setProfileMessage('Current password is required to change password');
        setProfileTab('security');
        return;
      }
      if (profileForm.newPassword.length < 6) {
        setProfileMessage('New password must be at least 6 characters');
        setProfileTab('security');
        return;
      }
      if (profileForm.newPassword !== profileForm.confirmPassword) {
        setProfileMessage('New passwords do not match');
        setProfileTab('security');
        return;
      }
    }

    try {
      setUpdatingProfile(true);
      const payload = {
        fullName: profileForm.fullName.trim(),
        mobileNumber: profileForm.mobileNumber.trim(),
        collegeName: profileForm.collegeName.trim(),
        course: profileForm.course.trim(),
        branch: profileForm.branch.trim(),
        yearOfStudy: profileForm.yearOfStudy.trim(),
        headline: profileForm.headline.trim(),
        githubUrl: profileForm.githubUrl.trim(),
        linkedinUrl: profileForm.linkedinUrl.trim(),
        portfolioUrl: profileForm.portfolioUrl.trim(),
        skills: profileForm.skills,
        bio: profileForm.bio.trim(),
      };

      if (profileForm.newPassword) {
        payload.currentPassword = profileForm.currentPassword;
        payload.newPassword = profileForm.newPassword;
      }

      const res = await api.put('/user/update', payload);
      if (res.data.success) {
        updateUser(res.data.user);
        setProfileSuccessMsg('Candidate profile updated successfully!');
        setTimeout(() => {
          onClose();
          onSaved?.('Candidate profile updated successfully!');
        }, 700);
      }
    } catch (err) {
      setProfileMessage(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[92vh] overflow-y-auto relative">
            <button
              onClick={() => onClose()}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1.5 flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-sky-400" />
                <span>Update Candidate Profile</span>
              </h3>
              <p className="text-xs text-slate-400">
                Manage your academic credentials, developer showcase, skills, and account credentials.
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => setProfileTab('academic')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
                  profileTab === 'academic'
                    ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Academic &amp; Contact</span>
              </button>

              <button
                type="button"
                onClick={() => setProfileTab('developer')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
                  profileTab === 'developer'
                    ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <FileCode className="w-4 h-4" />
                <span>Dev Showcase &amp; Skills</span>
              </button>

              <button
                type="button"
                onClick={() => setProfileTab('security')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
                  profileTab === 'security'
                    ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Security</span>
              </button>
            </div>

            {profileMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center gap-2.5 shadow-sm">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{profileMessage}</span>
              </div>
            )}

            {profileSuccessMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {/* TAB 1: ACADEMIC & CONTACT */}
              {profileTab === 'academic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Full Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                        placeholder="e.g. Joydip Maiti"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Mobile / WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={profileForm.mobileNumber}
                        onChange={(e) => setProfileForm({ ...profileForm, mobileNumber: e.target.value.replace(/\D/g, '') })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                        placeholder="10-digit mobile number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      College / University Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.collegeName}
                      onChange={(e) => setProfileForm({ ...profileForm, collegeName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                      placeholder="e.g. Calcutta Institute of Technology"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Degree / Course
                      </label>
                      <input
                        type="text"
                        value={profileForm.course}
                        onChange={(e) => setProfileForm({ ...profileForm, course: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                        placeholder="e.g. B.Tech, BCA, MCA"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Branch / Stream
                      </label>
                      <input
                        type="text"
                        value={profileForm.branch}
                        onChange={(e) => setProfileForm({ ...profileForm, branch: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                        placeholder="e.g. CSE, IT, ECE"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Year of Study
                      </label>
                      <select
                        value={profileForm.yearOfStudy}
                        onChange={(e) => setProfileForm({ ...profileForm, yearOfStudy: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Postgraduate / Alumni">Postgraduate / Alumni</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3 bg-sky-950/40 border border-sky-800/60 rounded-xl text-sky-300 text-xs flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>These academic details will automatically pre-fill your hackathon registrations!</span>
                  </div>
                </div>
              )}

              {/* TAB 2: DEV SHOWCASE & SKILLS */}
              {profileTab === 'developer' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Professional Headline
                    </label>
                    <input
                      type="text"
                      value={profileForm.headline}
                      onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                      placeholder="e.g. Full-Stack Web & AI Developer | Open Source Contributor"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Technical Skills (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={profileForm.skills}
                      onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                      placeholder="e.g. React, Node.js, Python, MongoDB, Docker, Tailwind"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Github className="w-3.5 h-3.5" />
                        <span>GitHub Profile URL</span>
                      </label>
                      <input
                        type="url"
                        value={profileForm.githubUrl}
                        onChange={(e) => setProfileForm({ ...profileForm, githubUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                        placeholder="https://github.com/username"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Linkedin className="w-3.5 h-3.5 text-sky-400" />
                        <span>LinkedIn Profile URL</span>
                      </label>
                      <input
                        type="url"
                        value={profileForm.linkedinUrl}
                        onChange={(e) => setProfileForm({ ...profileForm, linkedinUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Portfolio / Website Link</span>
                    </label>
                    <input
                      type="url"
                      value={profileForm.portfolioUrl}
                      onChange={(e) => setProfileForm({ ...profileForm, portfolioUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                      placeholder="https://yourportfolio.dev"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Short Bio / About
                    </label>
                    <textarea
                      rows={3}
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500 resize-none"
                      placeholder="Tell hackathon organizers and teammates about what you like to build..."
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: ACCOUNT SECURITY */}
              {profileTab === 'security' && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-300 text-xs flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Leave these fields blank if you do not wish to change your password.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={profileForm.currentPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={profileForm.newPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                        placeholder="Min 6 characters"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={profileForm.confirmPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                        placeholder="Re-type new password"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-5 border-t border-slate-800">
                <div className="text-xs text-slate-500">
                  Account: <span className="text-slate-300 font-mono">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => onClose()}
                    className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-sky-500/20 disabled:opacity-50 transition"
                  >
                    {updatingProfile ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving Profile...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Candidate Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
  );
};

export default CandidateProfileModal;
