export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
            </svg>
          </div>
          <a href="/" className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors">
            ApplyFlow
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          <p className="text-sm text-gray-500 mt-2">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <Section title="1. Acceptance of Terms">
          By accessing or using ApplyFlow, you agree to be bound by these Terms of Service.
          If you do not agree, please do not use the service.
        </Section>

        <Section title="2. Description of Service">
          ApplyFlow is a personal productivity tool that helps you track job applications by
          connecting to your Gmail account and automatically classifying job-related emails.
          The service is provided as-is for personal, non-commercial use.
        </Section>

        <Section title="3. Google Account & Gmail Access">
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>You must have a valid Google account to use ApplyFlow.</li>
            <li>You grant ApplyFlow permission to read and modify Gmail labels on your behalf.</li>
            <li>You can revoke this permission at any time from your Google Account settings or within ApplyFlow Settings.</li>
            <li>ApplyFlow only accesses emails it classifies as job-related. It does not read, store, or process any other emails.</li>
          </ul>
        </Section>

        <Section title="4. User Responsibilities">
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>You are responsible for maintaining the security of your account.</li>
            <li>You agree not to use the service for any unlawful purpose.</li>
            <li>You agree not to attempt to reverse-engineer, scrape, or abuse the service.</li>
            <li>You are solely responsible for the accuracy of any data you manually add.</li>
          </ul>
        </Section>

        <Section title="5. Intellectual Property">
          All content, design, and code within ApplyFlow is the property of the developer.
          You may not copy, reproduce, or distribute any part of the service without permission.
        </Section>

        <Section title="6. Disclaimer of Warranties">
          ApplyFlow is provided "as is" without warranties of any kind. We do not guarantee
          that the service will be uninterrupted, error-free, or that all job-related emails
          will be correctly classified. Email classification is automated and may not be 100% accurate.
        </Section>

        <Section title="7. Limitation of Liability">
          To the fullest extent permitted by law, ApplyFlow and its developer shall not be liable
          for any indirect, incidental, or consequential damages arising from your use of the service,
          including missed job opportunities due to incorrect email classification.
        </Section>

        <Section title="8. Termination">
          We reserve the right to suspend or terminate your access to ApplyFlow at any time for
          violation of these terms. You may stop using the service and request account deletion
          at any time from Settings.
        </Section>

        <Section title="9. Changes to Terms">
          We may update these Terms at any time. Continued use of ApplyFlow after changes
          constitutes acceptance of the new terms.
        </Section>

        <Section title="10. Contact">
          For questions about these Terms, contact us at:{' '}
          <a href="mailto:rohitkamble171012@gmail.com" className="text-blue-600 hover:underline font-medium">
            rohitkamble171012@gmail.com
          </a>
        </Section>
      </main>

      <footer className="border-t border-gray-200 bg-white mt-10 px-6 py-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <span>© {new Date().getFullYear()} ApplyFlow. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-gray-600 transition-colors">Terms of Service</a>
            <a href="/" className="hover:text-gray-600 transition-colors">Back to App</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <div className="text-gray-600 leading-relaxed text-sm">{children}</div>
    </section>
  );
}
