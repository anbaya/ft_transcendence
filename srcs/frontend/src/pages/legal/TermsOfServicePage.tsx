import { Link, useNavigate } from 'react-router-dom';
import { FileCheck, ArrowLeft, ShieldAlert, CheckCircle2, Users, AlertTriangle, Scale, Mail, Hexagon, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export default function TermsOfServicePage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={isAuthenticated ? '/dashboard' : '/auth/login'} className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-white shadow-sm">
                <Hexagon className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-primary tracking-tight">Astra</span>
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-4">
            <FileCheck className="h-3.5 w-3.5" />
            <span>Terms & Conditions</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight mb-3">
            Terms of Service
          </h1>
          <p className="text-base text-muted max-w-2xl leading-relaxed">
            Please read these Terms of Service carefully before utilizing Astra. By accessing or using our
            workspace, you agree to comply with and be bound by these legal terms.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
            <span>Last Updated: October 16, 2026</span>
            <span>•</span>
            <span>Version: 1.2</span>
            <span>•</span>
            <span className="text-blue-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              Binding Agreement
            </span>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-10 text-slate-700 leading-relaxed text-sm sm:text-base">
          {/* Section 1 */}
          <section className="bg-white p-6 sm:p-8 rounded-xl border border-border shadow-xs">
            <div className="flex items-center gap-2.5 text-primary font-bold text-lg mb-4">
              <div className="h-7 w-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">1</div>
              <h2>Acceptance of Terms</h2>
            </div>
            <p className="mb-3">
              By registering an account, accessing, or using <strong>Astra</strong> (including its web application,
              REST APIs, and WebSocket messaging services), you agree to be bound by these Terms of Service
              and our{' '}
              <Link to="/privacy" className="text-secondary hover:underline font-medium">
                Privacy Policy
              </Link>
              . If you do not agree to these terms, you must discontinue your use of the platform immediately.
            </p>
            <p>
              If you access Astra on behalf of an educational cohort, organization, or enterprise, you confirm that you have
              the necessary authority to bind that entity to these Terms.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-white p-6 sm:p-8 rounded-xl border border-border shadow-xs">
            <div className="flex items-center gap-2.5 text-primary font-bold text-lg mb-4">
              <div className="h-7 w-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">2</div>
              <h2>Account Registration & Security</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-1 shrink-0" />
                <span><strong>Accurate Information:</strong> You agree to provide true, accurate, and current information during registration (first name, last name, and a valid email).</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-1 shrink-0" />
                <span><strong>Credential Confidentiality:</strong> You are solely responsible for maintaining the confidentiality of your password and authorization tokens. You may not share your account credentials with third parties.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-1 shrink-0" />
                <span><strong>Notice of Compromise:</strong> You must immediately report any suspected unauthorized access or credential leak to your workspace administrator.</span>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white p-6 sm:p-8 rounded-xl border border-border shadow-xs">
            <div className="flex items-center gap-2.5 text-primary font-bold text-lg mb-4">
              <div className="h-7 w-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">3</div>
              <h2>Acceptable Use Policy</h2>
            </div>
            <p className="mb-4">
              To ensure a safe, collaborative, and performant environment for all users, you agree <strong>NOT</strong> to:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="p-3.5 rounded-lg bg-red-50/60 border border-red-100 flex items-start gap-2.5">
                <ShieldAlert className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <span>Transmit malicious code, viruses, trojans, or exploit security vulnerabilities across the API Gateway.</span>
              </div>
              <div className="p-3.5 rounded-lg bg-red-50/60 border border-red-100 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <span>Spam, flood, or perform automated denial-of-service operations on WebSocket chat or REST endpoints.</span>
              </div>
              <div className="p-3.5 rounded-lg bg-red-50/60 border border-red-100 flex items-start gap-2.5">
                <Users className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <span>Harass, defame, impersonate, or abuse project team members within chat rooms or task comments.</span>
              </div>
              <div className="p-3.5 rounded-lg bg-red-50/60 border border-red-100 flex items-start gap-2.5">
                <Scale className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <span>Upload files or proprietary content that infringe upon third-party copyrights or intellectual property.</span>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-white p-6 sm:p-8 rounded-xl border border-border shadow-xs">
            <div className="flex items-center gap-2.5 text-primary font-bold text-lg mb-4">
              <div className="h-7 w-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">4</div>
              <h2>Project Ownership & Content Rights</h2>
            </div>
            <p className="mb-3">
              <strong>Your Content Remains Yours:</strong> You retain full copyright and ownership rights to all project assets,
              documents, code snippets, task descriptions, and messages uploaded or generated in Astra.
            </p>
            <p className="text-muted text-xs sm:text-sm">
              By uploading content, you grant Astra solely the limited license necessary to host, store, index, and transmit
              your content to authorized members of your projects as required for normal workspace collaboration.
            </p>
          </section>

          {/* Section 5 */}
          <section className="bg-white p-6 sm:p-8 rounded-xl border border-border shadow-xs">
            <div className="flex items-center gap-2.5 text-primary font-bold text-lg mb-4">
              <div className="h-7 w-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">5</div>
              <h2>AI Assistant Usage & Disclaimers</h2>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" />
              <div>
                <p className="mb-2">
                  Astra includes an AI Assistant designed to help synthesize tasks, answer project questions, and assist team workflow.
                </p>
                <ul className="text-xs sm:text-sm text-muted space-y-2 list-disc list-inside">
                  <li>AI outputs are generated algorithmically and provided for informational purposes. Users must independently verify critical code, security, or legal decisions.</li>
                  <li>Do not submit classified, sensitive personal health, or high-risk financial data into AI prompts.</li>
                  <li>We do not utilize your proprietary project data to train public foundation models without explicit organizational consent.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="bg-white p-6 sm:p-8 rounded-xl border border-border shadow-xs">
            <div className="flex items-center gap-2.5 text-primary font-bold text-lg mb-4">
              <div className="h-7 w-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">6</div>
              <h2>Role-Based Governance & Permissions</h2>
            </div>
            <p className="mb-3">
              Permissions within Astra are segmented according to role:
            </p>
            <div className="space-y-2 text-xs sm:text-sm">
              <p><strong>Administrators:</strong> Hold full rights to manage users, assign system roles, and oversee all workspace operations.</p>
              <p><strong>Project Managers:</strong> Responsible for inviting members, creating milestones, archiving tasks, and moderating project chat channels.</p>
              <p><strong>Members & Users:</strong> Permitted to collaborate, manage their assigned tasks, upload documents, and participate in project discussions.</p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="bg-white p-6 sm:p-8 rounded-xl border border-border shadow-xs">
            <div className="flex items-center gap-2.5 text-primary font-bold text-lg mb-4">
              <div className="h-7 w-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">7</div>
              <h2>Service Availability & Limitation of Liability</h2>
            </div>
            <p className="mb-3">
              Astra is provided on an <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis. While we strive to maintain
              high availability and perform periodic backups, we do not warrant that service will be uninterrupted, error-free,
              or completely secure at all times.
            </p>
            <p className="text-xs text-muted leading-relaxed">
              To the maximum extent permitted by applicable law, the authors and contributors of Astra shall not be held liable
              for any direct, indirect, incidental, or consequential damages resulting from data loss, downtime, unauthorized
              access, or inability to use the platform.
            </p>
          </section>

          {/* Section 8 */}
          <section className="bg-white p-6 sm:p-8 rounded-xl border border-border shadow-xs">
            <div className="flex items-center gap-2.5 text-primary font-bold text-lg mb-4">
              <div className="h-7 w-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">8</div>
              <h2>Termination & Inquiries</h2>
            </div>
            <p className="mb-4">
              We reserve the right to suspend or terminate accounts that breach these Terms or compromise platform stability.
              For inquiries regarding these Terms of Service or legal requests:
            </p>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border border-slate-100">
              <Mail className="h-5 w-5 text-secondary" />
              <div>
                <p className="font-semibold text-primary text-sm">Legal & Compliance Department</p>
                <p className="text-xs text-muted">legal@astra-workspace.local • ft_transcendence project</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border mt-16 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <div className="flex items-center gap-2">
            <Hexagon className="h-4 w-4 text-secondary" />
            <span className="font-semibold text-primary">Astra Workspace</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-primary hover:underline">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/terms" className="text-primary font-semibold hover:underline">
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
