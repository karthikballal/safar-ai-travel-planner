import React from "react";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Safar AI",
  description: "Privacy policy for Safar AI travel planning platform.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50">
            <Shield size={20} className="text-primary-600" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-text-primary">Privacy Policy</h1>
            <p className="text-xs text-text-muted">Last updated: March 2026</p>
          </div>
        </div>

        <div className="prose prose-sm max-w-none text-text-secondary space-y-4">
          <h2 className="text-sm font-semibold text-text-primary">1. Information We Collect</h2>
          <p className="text-sm leading-relaxed">
            When you use Safar AI, we collect information you provide directly: your name, email address (when you create an account), trip preferences (destinations, dates, budget), and any feedback you submit. We also collect usage data such as pages visited and features used to improve our service.
          </p>

          <h2 className="text-sm font-semibold text-text-primary">2. How We Use Your Information</h2>
          <p className="text-sm leading-relaxed">
            We use your information to: generate personalized trip itineraries, save your trip plans to your account, improve our AI recommendations, and communicate service updates. We do not sell your personal information to third parties.
          </p>

          <h2 className="text-sm font-semibold text-text-primary">3. Third-Party Services</h2>
          <p className="text-sm leading-relaxed">
            Safar AI integrates with booking platforms (MakeMyTrip, Booking.com, Skyscanner, etc.) via affiliate links. When you click these links, you are redirected to the partner site which has its own privacy policy. We use Firebase (Google) for authentication and data storage, and Google Gemini AI for trip planning.
          </p>

          <h2 className="text-sm font-semibold text-text-primary">4. Data Storage & Security</h2>
          <p className="text-sm leading-relaxed">
            Your data is stored securely on Firebase (Google Cloud) servers. We use industry-standard encryption for data in transit (HTTPS) and at rest. Account authentication is handled by Firebase Authentication with support for email/password and Google sign-in.
          </p>

          <h2 className="text-sm font-semibold text-text-primary">5. Your Rights</h2>
          <p className="text-sm leading-relaxed">
            You can access, update, or delete your account and trip data at any time through your dashboard. To request complete data deletion, contact us at the email address listed on our website. We comply with applicable Indian data protection regulations.
          </p>

          <h2 className="text-sm font-semibold text-text-primary">6. Cookies</h2>
          <p className="text-sm leading-relaxed">
            We use essential cookies for authentication and session management. We do not use third-party tracking cookies. Analytics data is collected in aggregate and cannot be used to identify individual users.
          </p>

          <h2 className="text-sm font-semibold text-text-primary">7. Changes to This Policy</h2>
          <p className="text-sm leading-relaxed">
            We may update this privacy policy from time to time. We will notify registered users of significant changes via email. Continued use of Safar AI after changes constitutes acceptance of the updated policy.
          </p>
        </div>
      </div>
    </div>
  );
}
