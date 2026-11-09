import { Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Lock, CheckCircle2, UserCheck, HardDrive, Bot, Cookie, Mail } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={isAuthenticated ? '/dashboard' : '/auth/login'} className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200/80 shadow-xs p-1">
                <img src="/logo-icon.png" alt="TeamUP" className="h-full w-full object-contain" />
              </div>
              <span className="text-xl font-bold text-primary tracking-tight">TeamUP</span>
            </Link>
            <span className="text-xs text-muted font-medium bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 hidden sm:inline-block">
              Legal Documentation
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted hover:text-primary hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <Link
              to={isAuthenticated ? '/dashboard' : '/auth/login'}
              className="inline-flex items-center justify-center px-4 py-1.5 text-sm font-medium text-white bg-secondary hover:bg-secondary/90 rounded-md shadow-xs transition-colors"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Sign In'}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Document Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12 flex-1 w-full">
        {/* Header Hero */}
        <div className="mb-10 pb-8 border-b border-border">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-secondary text-xs font-semibold mb-4">
            <Shield className="h-3.5 w-3.5" />
            <span>Privacy & Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-base text-muted max-w-2xl leading-relaxed">
            This Privacy Policy explains how TeamUP collects, utilizes, stores, and protects your personal
            information and project data across our collaboration platform and microservices architecture.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
            <span>Last Updated: October 16, 2026</span>
            <span>•</span>
            <span>Version: 1.2</span>
            <span>•</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              GDPR Compliant
            </span>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-10 text-slate-700 leading-relaxed text-sm sm:text-base">
          {/* Section 1 */}
          <section className="bg-white p-6 sm:p-8 rounded-xl border border-border shadow-xs">
            <div className="flex items-center gap-2.5 text-primary font-bold text-lg mb-4">
              <div className="h-7 w-7 rounded-md bg-indigo-50 text-secondary flex items-center justify-center text-xs font-bold">1</div>
              <h2>Introduction & Scope</h2>
            </div>
            <p className="mb-3">
              Welcome to <strong>TeamUP</strong>, an integrated team workspace developed for project planning, task tracking,
              real-time discussion, document management, and AI assistance. We respect your fundamental right to privacy
              and are committed to safeguarding personal data in accordance with international standards, including the
              European Union General Data Protection Regulation (GDPR).
            </p>
            <p>
              This policy applies to all registered users, project managers, and administrators interacting with our web application,
              REST APIs, and WebSocket endpoints.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-white p-6 sm:p-8 rounded-xl border border-border shadow-xs">
            <div className="flex items-center gap-2.5 text-primary font-bold text-lg mb-4">
              <div className="h-7 w-7 rounded-md bg-indigo-50 text-secondary flex items-center justify-center text-xs font-bold">2</div>
              <h2>Information We Collect</h2>
            </div>
            <p className="mb-4">
              We collect information strictly necessary to provide and maintain a collaborative workspace:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 font-semibold text-primary text-sm mb-1.5">
                  <UserCheck className="h-4 w-4 text-secondary" />
                  <h3>Account Credentials</h3>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Your first name, last name, and email address. Passwords are never stored in plaintext; they are hashed
                  using industry-standard bcrypt/Argon2 cryptography before persistence.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 font-semibold text-primary text-sm mb-1.5">
                  <HardDrive className="h-4 w-4 text-secondary" />
                  <h3>Workspace & Project Content</h3>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Projects created, task details (titles, descriptions, assignments, priorities), uploaded documents,
                  and chat discussions across project channels.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 font-semibold text-primary text-sm mb-1.5">
                  <Bot className="h-4 w-4 text-secondary" />
                  <h3>AI Assistant Queries</h3>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Queries and contextual project prompts submitted to the AI assistant to summarize tasks, answer team questions,
                  or draft documentation.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 font-semibold text-primary text-sm mb-1.5">
                  <Lock className="h-4 w-4 text-secondary" />
                  <h3>Session & Technical Logs</h3>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Short-lived JSON Web Tokens (JWT) for API authorization, IP addresses, browser user agent, and error/access
                  logs managed through internal Elasticsearch and Logstash clusters.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white p-6 sm:p-8 rounded-xl border border-border shadow-xs">
            <div className="flex items-center gap-2.5 text-primary font-bold text-lg mb-4">
              <div className="h-7 w-7 rounded-md bg-indigo-50 text-secondary flex items-center justify-center text-xs font-bold">3</div>
              <h2>How We Use Your Data</h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-1 shrink-0" />
                <span><strong>Core Platform Functionality:</strong> To authenticate your identity, load assigned projects, and grant authorized access based on user roles (Admin, PM, Member).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-1 shrink-0" />
                <span><strong>Real-Time Delivery:</strong> To broadcast instant chat messages and project task notifications to relevant teammates over secure WebSockets.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-1 shrink-0" />
                <span><strong>Document Security:</strong> To store files on dedicated, isolated backend storage volumes and verify user authorization before allowing document downloads.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-1 shrink-0" />
                <span><strong>Service Reliability:</strong> To monitor system uptime, container metrics (Prometheus), and diagnose operational errors.</span>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="bg-white p-6 sm:p-8 rounded-xl border border-border shadow-xs">
            <div className="flex items-center gap-2.5 text-primary font-bold text-lg mb-4">
              <div className="h-7 w-7 rounded-md bg-indigo-50 text-secondary flex items-center justify-center text-xs font-bold">4</div>
              <h2>Data Security Architecture</h2>
            </div>
            <p className="mb-4">
              Security is built into every layer of our platform infrastructure:
            </p>
            <div className="space-y-3 text-sm">
              <div className="border-l-3 border-secondary pl-3">
                <p className="font-semibold text-primary">Transport Layer Encryption</p>
                <p className="text-muted text-xs">All communications between client and server are encrypted using TLS/HTTPS via our reverse proxy API Gateway on port 8443.</p>
              </div>
              <div className="border-l-3 border-secondary pl-3">
                <p className="font-semibold text-primary">Microservices Network Isolation</p>
                <p className="text-muted text-xs">Database and service communication occurs within an isolated internal Docker bridge network (`transcendence_net`), unreachable from the public internet.</p>
              </div>
              <div className="border-l-3 border-secondary pl-3">
                <p className="font-semibold text-primary">Role-Based Access Control (RBAC)</p>
                <p className="text-muted text-xs">Access to project assets, documents, and administrative actions is enforced on every API request via validated JWT claims.</p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="bg-white p-6 sm:p-8 rounded-xl border border-border shadow-xs">
            <div className="flex items-center gap-2.5 text-primary font-bold text-lg mb-4">
              <div className="h-7 w-7 rounded-md bg-indigo-50 text-secondary flex items-center justify-center text-xs font-bold">5</div>
              <h2>Cookies & Local Storage</h2>
            </div>
            <div className="flex items-start gap-3">
              <Cookie className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="mb-2">
                  <strong>We do not use advertising, marketing, or tracking cookies.</strong>
                </p>
                <p className="text-xs text-muted leading-relaxed">
                  TeamUP uses browser LocalStorage strictly for functional session persistence: storing your authenticated JWT tokens
                  (`auth-storage`) and interface preferences (such as collapsed/expanded sidebar state). Clearing your browser
                  cache or logging out immediately removes all stored session tokens.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="bg-white p-6 sm:p-8 rounded-xl border border-border shadow-xs">
            <div className="flex items-center gap-2.5 text-primary font-bold text-lg mb-4">
              <div className="h-7 w-7 rounded-md bg-indigo-50 text-secondary flex items-center justify-center text-xs font-bold">6</div>
              <h2>Your GDPR Rights</h2>
            </div>
            <p className="mb-3">
              Under applicable data protection laws, you retain full control over your personal data:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-md bg-slate-50 border border-slate-100">
                <span className="font-semibold text-primary block mb-1">Right to Access</span>
                Request a complete export of your personal information and activity records.
              </div>
              <div className="p-3 rounded-md bg-slate-50 border border-slate-100">
                <span className="font-semibold text-primary block mb-1">Right to Rectification</span>
                Update your name, email, or credentials anytime via your Profile Settings.
              </div>
              <div className="p-3 rounded-md bg-slate-50 border border-slate-100">
                <span className="font-semibold text-primary block mb-1">Right to Erasure</span>
                Request complete account deletion and anonymization of your data.
              </div>
              <div className="p-3 rounded-md bg-slate-50 border border-slate-100">
                <span className="font-semibold text-primary block mb-1">Data Portability</span>
                Download your project documents and task files in standard formats.
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section className="bg-white p-6 sm:p-8 rounded-xl border border-border shadow-xs">
            <div className="flex items-center gap-2.5 text-primary font-bold text-lg mb-4">
              <div className="h-7 w-7 rounded-md bg-indigo-50 text-secondary flex items-center justify-center text-xs font-bold">7</div>
              <h2>Contact & Inquiries</h2>
            </div>
            <p className="mb-4">
              If you have any questions about this Privacy Policy, wish to exercise your data protection rights,
              or need support regarding your account data, please contact our team:
            </p>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border border-slate-100">
              <Mail className="h-5 w-5 text-secondary" />
              <div>
                <p className="font-semibold text-primary text-sm">Privacy & Compliance Office</p>
                <p className="text-xs text-muted">privacy@teamup-workspace.local • ft_transcendence project</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border mt-16 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5">
              <img src="/logo-icon.png" alt="TeamUP" className="h-full w-full object-contain" />
            </div>
            <span className="font-semibold text-primary">TeamUP Workspace</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-primary font-semibold hover:underline">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-primary hover:underline">
              Terms of Service
            </Link>
            <span>•</span>
            <Link to={isAuthenticated ? '/dashboard' : '/auth/login'} className="hover:text-primary hover:underline">
              {isAuthenticated ? 'Dashboard' : 'Sign In'}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
