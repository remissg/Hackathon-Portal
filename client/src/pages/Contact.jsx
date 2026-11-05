import React, { useState } from 'react';
import api from '../services/api';
import { Mail, Send, CheckCircle2, AlertCircle, Sparkles, MessageSquare, MapPin } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in all contact fields');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/contact', formData);
      if (res.data.success) {
        setSuccess('Thank you! Your message has been sent to matrucareai@gmail.com. We will respond shortly.');
        setFormData({ name: '', email: '', message: '' });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-950/70 border border-sky-800/80 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Mail className="w-3.5 h-3.5" />
            <span>MatruCare AI Support</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Contact the Organizing Committee
          </h1>
          <p className="mt-3 text-slate-400 text-sm max-w-xl mx-auto">
            Have questions regarding the hackathon tracks, rules, presentation submissions, or internship evaluation? Send us a message directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Company Details Sidebar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white mb-2">MatruCare AI</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full Stack Developer Track • Internship Programme 2026
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-800 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-sky-400 mt-1 flex-shrink-0" />
                <div>
                  <span className="text-xs text-slate-500 uppercase font-semibold block">Official Email</span>
                  <a href="mailto:matrucareai@gmail.com" className="text-sky-400 hover:underline font-medium">
                    matrucareai@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-sky-400 mt-1 flex-shrink-0" />
                <div>
                  <span className="text-xs text-slate-500 uppercase font-semibold block">Evaluation Level</span>
                  <span className="text-slate-300">Intermediate Full Stack</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageSquare className="w-4 h-4 text-sky-400 mt-1 flex-shrink-0" />
                <div>
                  <span className="text-xs text-slate-500 uppercase font-semibold block">Response Time</span>
                  <span className="text-slate-300">Within 24 Hours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-sm flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Your Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="priya@example.com"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Your Message / Query
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Describe your inquiry or question regarding the hackathon..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending Inquiry...</span>
                  </>
                ) : (
                  <>
                    <span>Send Inquiry to matrucareai@gmail.com</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Contact;
