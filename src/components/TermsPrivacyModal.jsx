import { X } from 'lucide-react';

export default function TermsPrivacyModal({
  isOpen,
  onClose,
  isChecked,
  onToggleCheck,
  onAccept
}) {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAcceptClick = () => {
    if (onAccept) {
      onAccept();
    } else {
      if (onToggleCheck) onToggleCheck(true);
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
    >
      <div className="relative w-full max-w-2xl h-[92vh] max-h-[860px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-neutral-200/90 dark:border-slate-800 p-6 sm:p-8 flex flex-col overflow-hidden animate-slide-right">
        {/* Close Button ('X') */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-slate-800 transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 stroke-[2]" />
        </button>

        {/* Modal Header Subtitle */}
        <p className="text-xs sm:text-[13px] text-neutral-600 dark:text-slate-300 font-medium mb-3 pr-8">
          We&apos;ve updated Terms and Conditions and Privacy Policy.
        </p>

        {/* Scrollable Container for both sections */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar">
          {/* Section 1: Terms & Conditions */}
          <section className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
                Terms &amp; Conditions
              </h3>
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-medium border border-[#d8e2cf] dark:border-emerald-800/60 bg-[#f4f7f0] dark:bg-emerald-950/30 text-[#4c6a33] dark:text-[#8cb865] shadow-2xs">
                Updated in Oct. 24, 2026
              </span>
            </div>

            <div className="border border-neutral-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 bg-neutral-50/70 dark:bg-slate-800/40 text-xs sm:text-[13px] leading-relaxed text-neutral-600 dark:text-slate-300 h-48 sm:h-56 overflow-y-auto space-y-2.5 custom-scrollbar">
              <h4 className="font-bold text-neutral-800 dark:text-slate-100 text-xs sm:text-[13px]">
                Terms and Conditions for SEENta
              </h4>

              <p>
                This Terms and Conditions for SEENta (&ldquo;Terms&rdquo;) is an institutional agreement between you and the Polytechnic University of the Philippines – Biñan Campus, governing your use of the SEENta Lost and Found Management System. You agree to comply with all terms and conditions contained herein.
              </p>

              <div>
                <strong className="text-neutral-900 dark:text-white font-semibold">1. Account Eligibility &amp; Authenticity:</strong>
                <p>Access is strictly limited to active students, faculty, and administrative staff with valid PUP webmail credentials (@pup.edu.ph or @iskolarngbayan.pup.edu.ph). All submitted personal details must be accurate and truthful.</p>
              </div>

              <div>
                <strong className="text-neutral-900 dark:text-white font-semibold">2. Honest Reporting &amp; Claim Integrity:</strong>
                <p>Users must submit accurate descriptions, photos, and discovery locations for lost and found items. Falsely reporting or dishonestly claiming property is strictly prohibited and subject to university disciplinary sanctions under the PUP Student Handbook.</p>
              </div>

              <div>
                <strong className="text-neutral-900 dark:text-white font-semibold">3. Safe Handover Protocol:</strong>
                <p>Physical turnover of recovered property must be conducted at designated campus Safe-Exchange Zones (Main Campus Lobby, University Library Entrance, Campus Security Guard Post, or Student Center Plaza) during active campus operating hours.</p>
              </div>

              <div>
                <strong className="text-neutral-900 dark:text-white font-semibold">4. Audit Trails &amp; Dispute Mediation:</strong>
                <p>All transactions, coordinate timestamps, and chat records are recorded in immutable audit logs. Unresolved disputes or falsely claimed item reports will be escalated to the Office of Student Affairs and Services (OSAS).</p>
              </div>
            </div>
          </section>

          {/* Section 2: Privacy Policy */}
          <section className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
              Privacy Policy
            </h3>

            <div className="border border-neutral-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 bg-neutral-50/70 dark:bg-slate-800/40 text-xs sm:text-[13px] leading-relaxed text-neutral-600 dark:text-slate-300 h-64 sm:h-80 overflow-y-auto space-y-3 custom-scrollbar">
              <div>
                <h4 className="font-bold text-neutral-800 dark:text-slate-100 text-xs sm:text-[13px]">
                  Data Privacy Policy for SEENta
                </h4>
                <div className="mt-1 space-y-0.5 text-[11px] text-neutral-500 dark:text-slate-400">
                  <p><strong className="text-neutral-700 dark:text-slate-300">Effective Date:</strong> October 2026</p>
                  <p><strong className="text-neutral-700 dark:text-slate-300">Governing Law:</strong> Republic Act No. 10173 (Data Privacy Act of 2012)</p>
                  <p><strong className="text-neutral-700 dark:text-slate-300">National Privacy Commission (NPC) Compliance:</strong> Transparency, Legitimate Purpose, and Proportionality</p>
                </div>
              </div>

              <div>
                <strong className="text-neutral-900 dark:text-white font-semibold block mb-0.5">
                  1. General Privacy Statement
                </strong>
                <p>
                  SEENta respects and upholds the data privacy rights of all PUP Biñan students and faculty members. In compliance with Republic Act No. 10173 (Data Privacy Act of 2012) and its Implementing Rules and Regulations (IRR), this policy explains what personal information we collect, why we process it, and how your information is safeguarded.
                </p>
              </div>

              <div>
                <strong className="text-neutral-900 dark:text-white font-semibold block mb-0.5">
                  2. Personal Information Collected
                </strong>
                <p>
                  We collect only the minimum necessary information required to facilitate peer-to-peer lost and found matching:
                </p>
                <ul className="mt-1 space-y-1 pl-2">
                  <li>• <strong className="text-neutral-900 dark:text-white font-medium">User Identity Data:</strong> Legal First Name, Last Name, Official Student/Employee Number (YYYY-XXXXX-BN-X), and Institutional Email Address.</li>
                  <li>• <strong className="text-neutral-900 dark:text-white font-medium">Contact Data:</strong> Active 11-digit Philippine mobile telephone number (09XXXXXXXXX) used exclusively for handover coordination.</li>
                  <li>• <strong className="text-neutral-900 dark:text-white font-medium">Item Ingestion Data:</strong> Lost property descriptions, last known locations, dates, found item photographs, serial numbers, and condition notes.</li>
                  <li>• <strong className="text-neutral-900 dark:text-white font-medium">Ownership Verification Data:</strong> Identifying proof answers, supporting receipt/photo uploads, and honesty attestation checkboxes.</li>
                  <li>• <strong className="text-neutral-900 dark:text-white font-medium">Transactional &amp; Communication Data:</strong> In-app bilateral coordination messages and immutable turnover audit logs (timestamps, safe zone locations, and user IDs).</li>
                </ul>
              </div>

              <div>
                <strong className="text-neutral-900 dark:text-white font-semibold block mb-0.5">
                  3. Legal Basis &amp; Purpose of Processing
                </strong>
                <p>
                  Your personal data is processed under the legal grounds of Contractual Necessity and Legitimate Institutional Interest for the following specific purposes:
                </p>
                <ul className="mt-1 space-y-1 pl-2">
                  <li>• <strong className="text-neutral-900 dark:text-white font-medium">Authentication &amp; Anti-Spam:</strong> Verifying that users belong to the active PUP Biñan academic community.</li>
                  <li>• <strong className="text-neutral-900 dark:text-white font-medium">Automated Matching:</strong> Algorithmically cross-referencing lost item reports against found posts by category and location to notify owners.</li>
                  <li>• <strong className="text-neutral-900 dark:text-white font-medium">Coordination &amp; Turnover:</strong> Enabling finders and claimants to communicate via in-app chat and arrange safe in-person returns.</li>
                  <li>• <strong className="text-neutral-900 dark:text-white font-medium">Accountability &amp; Fraud Prevention:</strong> Maintaining a non-editable transaction ledger to deter theft and false claims.</li>
                </ul>
              </div>

              <div>
                <strong className="text-neutral-900 dark:text-white font-semibold block mb-0.5">
                  4. Data Disclosure and Counterparty Transparency
                </strong>
                <p>SEENta enforces strict access boundaries:</p>
                <ul className="mt-1 space-y-1 pl-2">
                  <li>• <strong className="text-neutral-900 dark:text-white font-medium">Public Feed:</strong> Public listings display only item details, category, photos, and discovery location. A finder&apos;s personal contact details and student numbers are never displayed publicly.</li>
                  <li>• <strong className="text-neutral-900 dark:text-white font-medium">Claim Coordination:</strong> Once a finder approves a claim, the claimant and finder are granted mutual visibility over their display names within an isolated chat session.</li>
                  <li>• <strong className="text-neutral-900 dark:text-white font-medium">Dispute Exception (Section 12, RA 10173):</strong> In the event a completed turnover is flagged under a Falsely Claimed Item Dispute Report, the claimant&apos;s institutional identity and contact information will be disclosed to the true owner and the Office of Student Affairs (OSAS) solely for recovery and disciplinary arbitration.</li>
                </ul>
              </div>

              <div>
                <strong className="text-neutral-900 dark:text-white font-semibold block mb-0.5">
                  5. Data Storage, Security &amp; Retention
                </strong>
                <ul className="space-y-1 pl-2">
                  <li>• <strong className="text-neutral-900 dark:text-white font-medium">Technical Safeguards:</strong> All passwords are cryptographically hashed. Data transmissions are encrypted using standard Transport Layer Security (TLS/HTTPS), and database tables enforce Postgres Row-Level Security (RLS).</li>
                  <li>• <strong className="text-neutral-900 dark:text-white font-medium">Storage Location:</strong> Data is stored in secure cloud database infrastructure with automated regular backups.</li>
                  <li>• <strong className="text-neutral-900 dark:text-white font-medium">Retention Schedule:</strong> Active accounts remain valid for the duration of the student&apos;s enrollment or faculty member&apos;s tenure. Transaction history logs are preserved for a period of one (1) academic year following item resolution to satisfy institutional audit trails, after which records are anonymized or purged.</li>
                </ul>
              </div>

              <div>
                <strong className="text-neutral-900 dark:text-white font-semibold block mb-0.5">
                  6. Rights of the Data Subject (Under RA 10173)
                </strong>
                <p>As an authenticated user of SEENta, you are entitled to the following statutory rights:</p>
                <ul className="mt-1 space-y-1 pl-2">
                  <li>• <strong className="text-neutral-900 dark:text-white font-medium">Right to be Informed:</strong> The right to know how your personal data is collected, handled, and stored.</li>
                  <li>• <strong className="text-neutral-900 dark:text-white font-medium">Right to Access:</strong> The right to view your profile information, submitted reports, active claims, and personal transaction history at any time.</li>
                  <li>• <strong className="text-neutral-900 dark:text-white font-medium">Right to Rectification:</strong> The right to request the correction of inaccurate or outdated contact details.</li>
                  <li>• <strong className="text-neutral-900 dark:text-white font-medium">Right to Erasure or Blocking:</strong> The right to request account deactivation, provided the account is not subject to an ongoing, unresolved dispute report.</li>
                  <li>• <strong className="text-neutral-900 dark:text-white font-medium">Right to File a Complaint:</strong> The right to file a complaint before the National Privacy Commission (NPC) if your personal data has been unlawfully processed or compromised.</li>
                </ul>
              </div>

              <div>
                <strong className="text-neutral-900 dark:text-white font-semibold block mb-0.5">
                  7. Inquiries and Contact Information
                </strong>
                <p>For questions regarding this policy, data rectification requests, or privacy concerns, users may direct inquiries to the project maintainers or the campus institutional body:</p>
                <div className="mt-1.5 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-700 text-[11px] space-y-0.5">
                  <p><strong className="text-neutral-900 dark:text-white">Campus Administrator:</strong> Office of Student Affairs and Services (OSAS)</p>
                  <p><strong className="text-neutral-900 dark:text-white">Institution:</strong> Polytechnic University of the Philippines – Biñan Campus</p>
                  <p><strong className="text-neutral-900 dark:text-white">Inquiry Channel:</strong> Dedicated &ldquo;Create Inquiry&rdquo; workflow on the SEENta login interface.</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Checkbox Section */}
        <div
          className="flex items-start gap-2.5 pt-4 pb-2 cursor-pointer select-none"
          onClick={() => onToggleCheck(!isChecked)}
        >
          <input
            type="checkbox"
            id="modalTermsCheckbox"
            checked={isChecked}
            onChange={(e) => {
              e.stopPropagation();
              onToggleCheck(e.target.checked);
            }}
            className="w-4 h-4 mt-0.5 rounded-xs border-neutral-300 dark:border-slate-600 text-theme focus:ring-theme accent-theme shrink-0 cursor-pointer"
          />
          <label
            htmlFor="modalTermsCheckbox"
            className="text-xs text-neutral-600 dark:text-slate-300 cursor-pointer leading-snug"
          >
            By clicking you are accepting to the updated SEENta Terms &amp; Conditions and Privacy Policy.
          </label>
        </div>

        {/* Accept Button (Red theme button like the sign in / sign up button) */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleAcceptClick}
            className="w-52 py-2.5 sm:py-3 bg-theme hover:bg-theme-hover active:scale-[0.98] text-white font-semibold rounded-full text-xs sm:text-sm transition shadow-md hover:shadow-lg cursor-pointer tracking-wide"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
