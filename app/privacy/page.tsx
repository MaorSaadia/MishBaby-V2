import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/app/components/legal-page";

export const metadata: Metadata = { title: "Privacy Policy", description: "How MishBaby handles account and website information.", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return <LegalPage eyebrow="Your information" title="Privacy Policy" intro="This policy explains the current MishBaby account foundation and how information is handled when you use the website.">
    <section><h2>Who operates MishBaby</h2><p>MishBaby operates this website. Questions or privacy requests can be sent to <a href="mailto:mishbabyshop@gmail.com">mishbabyshop@gmail.com</a>.</p></section>
    <section><h2>Information we handle</h2><p>When you create an account, we handle your email address, authentication identifiers, login provider, and security/session information. We do not currently ask for a display name, address, payment information, or information about children. Our hosting and service providers may also process technical logs such as IP address, device information, timestamps, and error data needed to operate and secure the service.</p></section>
    <section><h2>How we use it</h2><p>Account information is used to register you, confirm your email, sign you in, recover your password, protect the service, respond to requests, and delete your account when requested. Account emails are transactional only. MishBaby does not currently enroll account holders in marketing emails or sell personal information.</p></section>
    <section><h2>Providers and international processing</h2><p>Supabase provides authentication and account storage. Google processes information if you choose Google sign-in. Resend delivers transactional authentication emails. Vercel hosts the website, and Sanity supplies public catalog and editorial content. These providers may process information in countries outside Israel under their own safeguards and terms.</p></section>
    <section><h2>Cookies and external merchants</h2><p>Supabase session cookies keep you securely signed in and are necessary for account functionality. MishBaby also links to affiliate merchants such as Amazon and AliExpress. Those merchants independently control their sites, checkout, cookies, and privacy practices; review their policies before purchasing.</p></section>
    <section><h2>Retention and deletion</h2><p>We retain the account while it remains active and as reasonably needed for security, legal obligations, dispute handling, and provider backup or log cycles. You can permanently delete your authentication account from the Account page. You may also contact us for access, correction, or deletion questions.</p></section>
    <section><h2>Adults only</h2><p>MishBaby accounts are for adults aged 18 or older. The service is parent-focused but is not intended to collect personal information directly from children. Contact us if you believe a child created an account.</p></section>
    <section><h2>Security and changes</h2><p>We use reasonable technical and organizational safeguards, but no online system is completely secure. We may update this policy as MishBaby changes and will update the date above. See our <Link href="/terms">Terms</Link> for the website rules.</p></section>
    <aside className="rounded-2xl bg-[#fff7df] p-5 text-sm text-[#735a16]"><strong>Owner review:</strong> This is a practical policy foundation, not legal advice. MishBaby’s owner should have it reviewed for the laws and markets that apply before treating it as final.</aside>
  </LegalPage>;
}
