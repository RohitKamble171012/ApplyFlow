export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mt-2">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <Section title="1. Overview">
          ApplyFlow ("we", "our", or "us") is a job application tracking tool that connects to your Gmail
          account to automatically detect and organise job-related emails. We are committed to protecting
          your personal information and being transparent about how we use it.
        </Section>

        <Section title="2. Information We Collect">
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li><strong>Google Account Info:</strong> Your name, email address, and profile photo via Google Sign-In.</li>
            <li><strong>Gmail Data:</strong> Subject lines, sender information, email snippets, and body text of emails we classify as job-related. We do not access, store, or read any other emails.</li>
            <li><strong>Application Data:</strong> Job application statuses, notes, and labels you create within the app.</li>
            <li><strong>Usage Data:</strong> Basic logs for debugging (e.g. sync timestamps, error logs). No analytics or tracking.</li>
          </ul>
        </Section>

        <Section title="3. How We Use Gmail Data">
          <p className="text-gray-600 mb-3">
            ApplyFlow uses Gmail read access (<code className="bg-gray-100 px-1 rounded text-sm">gmail.readonly</code> and <code className="bg-gray-100 px-1 rounded text-sm">gmail.modify</code>) solely to:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>Scan your inbox for emails related to job applications</li>
            <li>Extract company names, job roles, and application statuses</li>
            <li>Display them in your personal ApplyFlow dashboard</li>
          </ul>
          <p className="mt-3 text-gray-600">
            <strong>We never:</strong> read personal emails unrelated to job applications, send emails on your behalf,
            share your email data with third parties, use your data for advertising, or train AI/ML models on your data.
          </p>
        </Section>

        <Section title="4. Data Storage">
          Only job-related email metadata (subject, sender, snippet, body) is stored in our database.
          Your Gmail OAuth tokens are stored securely and are only used to sync your inbox when you
          explicitly request it. You can disconnect Gmail at any time from Settings, which immediately
          deletes your stored tokens.
        </Section>

        <Section title="5. Data Sharing">
          We do not sell, rent, or share your personal data with any third parties. Your data is
          stored on MongoDB Atlas (cloud database) with encryption at rest. We use Firebase for
          authentication only.
        </Section>

        <Section title="6. Data Retention">
          Your data is retained as long as you have an account. You may request deletion of all
          your data at any time by contacting us or deleting your account from Settings. We will
          permanently delete all associated data within 30 days.
        </Section>

        <Section title="7. Your Rights">
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>Access all data we store about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and all data</li>
            <li>Disconnect Gmail integration at any time</li>
            <li>Revoke Google OAuth access from your Google Account settings</li>
          </ul>
        </Section>

        <Section title="8. Security">
          We implement reasonable security measures including HTTPS encryption, secure token storage,
          and rate limiting. However, no internet transmission is 100% secure. We encourage you to
          revoke access if you suspect any unauthorised use.
        </Section>

        <Section title="9. Children's Privacy">
          ApplyFlow is not intended for users under 13 years of age. We do not knowingly collect
          data from children.
        </Section>

        <Section title="10. Changes to This Policy">
          We may update this policy periodically. We will notify users of significant changes via
          the app. Continued use after changes constitutes acceptance.
        </Section>

        <Section title="11. Contact Us">
          If you have questions about this Privacy Policy or want to request data deletion, contact us at:
          <br /><br />
          <a href="mailto:rohitkamble171012@gmail.com" className="text-blue-600 hover:underline font-medium">
            rohitkamble171012@gmail.com
          </a>
        </Section>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            ApplyFlow complies with Google's{' '}
            <a href="https://developers.google.com/terms/api-services-user-data-policy"
               target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              API Services User Data Policy
            </a>
            {' '}including the Limited Use requirements.
          </p>
        </div>
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
