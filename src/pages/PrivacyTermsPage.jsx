import { useState, useEffect, useRef } from 'react';
import ScrollReveal from '../components/ScrollReveal';
import {
  ArrowLeft,
  Copy,
  Check
} from 'lucide-react';

export default function PrivacyTermsPage({ initialTab = 'terms', onNavigateBack }) {
  const [copied, setCopied] = useState(false);
  const [showSubNav, setShowSubNav] = useState(true);
  const lastScrollY = useRef(0);

  // Smooth scroll to target section if hash or initialTab is specified
  useEffect(() => {
    if (initialTab === 'privacy') {
      setTimeout(() => {
        document.getElementById('privacy-policy')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (initialTab === 'terms') {
      setTimeout(() => {
        document.getElementById('terms-of-service')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [initialTab]);

  // Smoothly hide sub-navbar on scroll down, reappear on scroll up or top
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Ignore negative scroll (rubber-banding on iOS/macOS)
      if (currentScrollY < 0) return;

      // Always show at top of page
      if (currentScrollY <= 25) {
        setShowSubNav(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Scrolling down: hide smoothly
      if (currentScrollY > lastScrollY.current + 6) {
        setShowSubNav(false);
      }
      // Scrolling up: reveal smoothly
      else if (currentScrollY < lastScrollY.current - 6) {
        setShowSubNav(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Action Header (Smoothly auto-hides on scroll, reappears on scroll up) */}
      <div
        className={`border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-18 z-20 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          showSubNav
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          {/* Back Button */}
          <button
            type="button"
            onClick={onNavigateBack}
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Return to Platform</span>
          </button>

          {/* Quick Page Utilities */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition cursor-pointer active:scale-95"
              title="Copy link to page"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <section className="relative overflow-hidden pt-10 pb-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <ScrollReveal threshold={0.05}>
          <div className="space-y-3.5">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Terms of Service &amp; Privacy Policy
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Official institutional agreements, peer-to-peer property recovery protocols, and statutory data privacy compliance for SEENta.
            </p>

            {/* Simplified Effective & Compliance Metadata */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Effective October 2026</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>RA 8792 &amp; RA 10173 Compliant</span>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Main Single Document Canvas (Mobbin-style typography and simplified descriptions) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <main className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-200/80 dark:border-slate-800 shadow-2xs divide-y divide-slate-200/80 dark:divide-slate-800">
          
          {/* ============================================================== */}
          {/* PART 1: TERMS AND CONDITIONS OF SERVICE                       */}
          {/* ============================================================== */}
          <section id="terms-of-service" className="space-y-10 pb-12 sm:pb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Terms and Conditions of Service
            </h2>

            {/* Articles */}
            <div className="space-y-10 sm:space-y-12">
              
              {/* Article 1 */}
              <article id="sec-1" className="space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  1. Acceptance of Terms &amp; Electronic Consent
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  By creating an account, accessing, or utilizing the SEENta platform, you formally enter into a legally recognized electronic contract under <strong>Republic Act No. 8792 (Electronic Commerce Act of 2000)</strong>. If you do not agree to these terms, you must refrain from registering or using the service.
                </p>
              </article>

              {/* Article 2 */}
              <article id="sec-2" className="space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  2. Institutional Eligibility
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  System access is strictly restricted to active, verified bona fide students, faculty members, and administrative staff of the Polytechnic University of the Philippines – Biñan Campus. All users must authenticate exclusively through authorized institutional email domains (<code className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">@iskolarngbayan.pup.edu.ph</code> or <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">@pup.edu.ph</code>). Accounts created using unauthorized or external third-party domains will be automatically terminated.
                </p>
              </article>

              {/* Article 3 */}
              <article id="sec-3" className="space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  3. Decentralized Peer-to-Peer (P2P) Operating Model
                </h3>
                <ul className="space-y-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  <li>
                    <strong className="text-slate-900 dark:text-white font-semibold">No Custodial Depository:</strong>{' '}
                    SEENta is a digital communication and matching platform. The system does not hold, store, inspect, or take legal custody of any physical property.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white font-semibold">Direct Responsibility:</strong>{' '}
                    Finders retain temporary physical custody of found belongings until an approved claimant completes an in-person exchange. Finders are responsible for keeping items safe until handover.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white font-semibold">Zero Administrative Gatekeeping:</strong>{' '}
                    Claim approvals and rejections are evaluated directly by the finder based on submitted evidence without administrative pre-screening.
                  </li>
                </ul>
              </article>

              {/* Article 4 */}
              <article id="sec-4" className="space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  4. Proof of Ownership &amp; Academic Honesty Attestation
                </h3>
                <ul className="space-y-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  <li>
                    <strong className="text-slate-900 dark:text-white font-semibold">Mandatory Truthfulness:</strong>{' '}
                    Every claimant submitting a Proof of Ownership Claim Form must certify that they are the genuine owner of the listed property.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white font-semibold">Disciplinary Consequences:</strong>{' '}
                    Submitting fabricated descriptions, falsified serial numbers, or fraudulent claim receipts constitutes a direct violation of the PUP Student Handbook (Dishonesty and Misrepresentation). Any proven fraudulent claim will result in immediate revocation of system access and formal referral to the Office of Student Affairs (OSAS) for disciplinary action.
                  </li>
                </ul>
              </article>

              {/* Article 5 */}
              <article id="sec-5" className="space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  5. Campus Safe-Exchange Protocol
                </h3>
                <ul className="space-y-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  <li>
                    <strong className="text-slate-900 dark:text-white font-semibold">Designated Campus Safe Zones:</strong>{' '}
                    For personal safety and transparency, all physical handovers must occur strictly within designated, monitored areas of the PUP Biñan Campus (Main Campus Lobby, University Library Entrance, Campus Security Guard Post, or Student Center Plaza) during active campus operating hours (8:00 AM – 5:00 PM).
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white font-semibold">Dual-Sided Handover Confirmation:</strong>{' '}
                    Both the finder and claimant must physically inspect the item, verify each other&apos;s institutional identification cards, and simultaneously confirm the turnover within the platform to finalize the custody record.
                  </li>
                </ul>
              </article>

              {/* Article 6 */}
              <article id="sec-6" className="space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  6. Falsely Claimed Item Dispute Resolution &amp; Audit Trail
                </h3>
                <ul className="space-y-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  <li>
                    <strong className="text-slate-900 dark:text-white font-semibold">Unmasking of Counterparty Identity:</strong>{' '}
                    If an item is mistakenly or dishonestly surrendered to an unauthorized person, the true owner may file a formal Falsely Claimed Item Dispute Report.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white font-semibold">Consent to Disclosure:</strong>{' '}
                    By receiving an item through this platform, every claimant explicitly agrees that in the event of a substantiated dispute, their verified legal name, student number, institutional email, and mobile contact number will be disclosed to the reporting owner and university authorities for item recovery and arbitration.
                  </li>
                </ul>
              </article>

              {/* Article 7 */}
              <article id="sec-7" className="space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  7. Limitation of Liability
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  SEENta is provided on an <strong>&ldquo;AS-IS&rdquo;</strong> and <strong>&ldquo;AS-AVAILABLE&rdquo;</strong> basis. The system administrators, student developers, and university faculty are not financially or legally liable for:
                </p>
                <ul className="space-y-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed pl-5 list-disc">
                  <li>Personal belongings that remain unrecovered or unclaimed.</li>
                  <li>Items damaged, depleted, or altered prior to or during the handover process.</li>
                  <li>Any personal disputes or interactions occurring outside authorized campus safe zones.</li>
                </ul>
              </article>
            </div>
          </section>

          {/* ============================================================== */}
          {/* PART 2: DATA PRIVACY POLICY                                   */}
          {/* ============================================================== */}
          <section id="privacy-policy" className="space-y-10 pt-12 sm:pt-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Data Privacy Policy
            </h2>

            {/* Articles */}
            <div className="space-y-10 sm:space-y-12">
              
              {/* Article 1 */}
              <article id="priv-1" className="space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  1. General Privacy Statement
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  SEENta respects and upholds the data privacy rights of all PUP Biñan students and faculty members. In compliance with <strong>Republic Act No. 10173 (Data Privacy Act of 2012)</strong> and its Implementing Rules and Regulations (IRR), this policy explains what personal information we collect, why we process it, and how your information is safeguarded.
                </p>
              </article>

              {/* Article 2 */}
              <article id="priv-2" className="space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  2. Personal Information Collected
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  We collect only the minimum necessary information required to facilitate peer-to-peer lost and found matching:
                </p>
                <ul className="space-y-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  <li>
                    <strong className="text-slate-900 dark:text-white font-semibold">User Identity Data:</strong>{' '}
                    Legal First Name, Last Name, Official Student/Employee Number (<code className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">YYYY-XXXXX-BN-X</code>), and Institutional Email Address.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white font-semibold">Contact Data:</strong>{' '}
                    Active 11-digit Philippine mobile telephone number (<code className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">09XXXXXXXXX</code>) used exclusively for handover coordination.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white font-semibold">Item Ingestion Data:</strong>{' '}
                    Lost property descriptions, last known locations, dates, found item photographs, serial numbers, and condition notes.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white font-semibold">Ownership Verification Data:</strong>{' '}
                    Identifying proof answers, supporting receipt/photo uploads, and honesty attestation checkboxes.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white font-semibold">Transactional &amp; Communication Data:</strong>{' '}
                    In-app bilateral coordination messages and immutable turnover audit logs (timestamps, safe zone locations, and user IDs).
                  </li>
                </ul>
              </article>

              {/* Article 3 */}
              <article id="priv-3" className="space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  3. Legal Basis &amp; Purpose of Processing
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  Your personal data is processed under the legal grounds of <strong>Contractual Necessity</strong> and <strong>Legitimate Institutional Interest</strong> for the following specific purposes:
                </p>
                <ul className="space-y-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  <li>
                    <strong className="text-slate-900 dark:text-white font-semibold">Authentication &amp; Anti-Spam:</strong>{' '}
                    Verifying that users belong to the active PUP Biñan academic community.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white font-semibold">Automated Matching:</strong>{' '}
                    Algorithmically cross-referencing lost item reports against found posts by category and location to notify owners.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white font-semibold">Coordination &amp; Turnover:</strong>{' '}
                    Enabling finders and claimants to communicate via in-app chat and arrange safe in-person returns.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white font-semibold">Accountability &amp; Fraud Prevention:</strong>{' '}
                    Maintaining a non-editable transaction ledger to deter theft and false claims.
                  </li>
                </ul>
              </article>

              {/* Article 4 */}
              <article id="priv-4" className="space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  4. Data Disclosure and Counterparty Transparency
                </h3>
                <ul className="space-y-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  <li>
                    <strong className="text-slate-900 dark:text-white font-semibold">Public Feed:</strong>{' '}
                    Public listings display only item details, category, photos, and discovery location. A finder&apos;s personal contact details and student numbers are never displayed publicly.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white font-semibold">Claim Coordination:</strong>{' '}
                    Once a finder approves a claim, the claimant and finder are granted mutual visibility over their display names within an isolated chat session.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white font-semibold">Dispute Exception (Section 12, RA 10173):</strong>{' '}
                    In the event a completed turnover is flagged under a Falsely Claimed Item Dispute Report, the claimant&apos;s institutional identity and contact information will be disclosed to the true owner and the Office of Student Affairs (OSAS) solely for recovery and disciplinary arbitration.
                  </li>
                </ul>
              </article>

              {/* Article 5 */}
              <article id="priv-5" className="space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  5. Data Storage, Security &amp; Retention
                </h3>
                <ul className="space-y-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  <li>
                    <strong className="text-slate-900 dark:text-white font-semibold">Technical Safeguards:</strong>{' '}
                    All passwords are cryptographically hashed. Data transmissions are encrypted using standard Transport Layer Security (TLS/HTTPS), and database tables enforce Postgres Row-Level Security (RLS).
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white font-semibold">Storage Location:</strong>{' '}
                    Data is stored in secure cloud database infrastructure with automated regular backups.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white font-semibold">Retention Schedule:</strong>{' '}
                    Active accounts remain valid for the duration of the student&apos;s enrollment or faculty member&apos;s tenure. Transaction history logs are preserved for a period of one (1) academic year following item resolution to satisfy institutional audit trails, after which records are anonymized or purged.
                  </li>
                </ul>
              </article>

              {/* Article 6 */}
              <article id="priv-6" className="space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  6. Rights of the Data Subject (Under RA 10173)
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  As an authenticated user of SEENta, you are entitled to the following statutory rights under Republic Act No. 10173:
                </p>
                <ul className="space-y-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  <li>
                    <strong className="text-slate-900 dark:text-white font-semibold">Right to be Informed:</strong>{' '}
                    The right to know how your personal data is collected, handled, and stored.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white font-semibold">Right to Access:</strong>{' '}
                    The right to view your profile information, submitted reports, active claims, and personal transaction history at any time.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white font-semibold">Right to Rectification:</strong>{' '}
                    The right to request the correction of inaccurate or outdated contact details.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white font-semibold">Right to Erasure or Blocking:</strong>{' '}
                    The right to request account deactivation, provided the account is not subject to an ongoing, unresolved dispute report.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white font-semibold">Right to File a Complaint:</strong>{' '}
                    The right to file a complaint before the National Privacy Commission (NPC) if your personal data has been unlawfully processed or compromised.
                  </li>
                </ul>
              </article>

              {/* Article 7 */}
              <article id="priv-7" className="space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  7. Inquiries and Contact Information
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  For questions regarding this policy, data rectification requests, or privacy concerns, users may direct inquiries to the project maintainers or the campus institutional body:
                </p>
                <div className="pt-2 space-y-1 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  <p><strong className="text-slate-900 dark:text-white font-semibold">Campus Administrator:</strong> Office of Student Affairs and Services (OSAS)</p>
                  <p><strong className="text-slate-900 dark:text-white font-semibold">Institution:</strong> Polytechnic University of the Philippines – Biñan Campus</p>
                  <p><strong className="text-slate-900 dark:text-white font-semibold">Inquiry Channel:</strong> Dedicated &ldquo;Create Inquiry&rdquo; workflow on the SEENta login interface.</p>
                </div>
              </article>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
