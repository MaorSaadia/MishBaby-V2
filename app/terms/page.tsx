import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/app/components/legal-page";

export const metadata: Metadata = { title: "Terms of Use", description: "The terms for using MishBaby and its account features.", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return <LegalPage eyebrow="Using MishBaby" title="Terms of Use" intro="These terms cover use of MishBaby’s product-discovery content, merchant links, and account features.">
    <section><h2>Acceptance and eligibility</h2><p>By using MishBaby or creating an account, you agree to these terms and acknowledge the <Link href="/privacy">Privacy Policy</Link>. Accounts may be created only by people aged 18 or older. If you do not agree, do not create or use an account.</p></section>
    <section><h2>Information, not professional advice</h2><p>MishBaby provides general product-discovery and editorial information. Content is not medical, safety, legal, or other professional advice and cannot account for every child or circumstance. Check instructions, recalls, age and weight limits, and consult a qualified professional when appropriate.</p></section>
    <section><h2>Affiliate links and merchants</h2><p>MishBaby may earn a commission from qualifying purchases through eligible links, normally at no additional cost to you. MishBaby does not sell, fulfill, warrant, or accept returns for merchant products. Prices, availability, shipping, product claims, checkout, warranties, customer service, and returns are the merchant’s responsibility. Confirm important details on the merchant’s site.</p></section>
    <section><h2>Your account</h2><p>You are responsible for accurate account information, protecting your credentials, and activity under your account. Notify us if you suspect unauthorized use. You may sign out or permanently delete the account through the Account page.</p></section>
    <section><h2>Acceptable use</h2><p>Do not misuse the website, attempt unauthorized access, disrupt its operation, automate abusive requests, introduce malicious code, impersonate others, or use MishBaby unlawfully. We may restrict access when reasonably necessary to protect users, the service, or legal rights.</p></section>
    <section><h2>Content and availability</h2><p>MishBaby and its original presentation and content are protected by applicable intellectual-property laws. Third-party names and marks belong to their owners. We may correct, update, remove, or discontinue content or account functionality and do not promise uninterrupted availability.</p></section>
    <section><h2>Disclaimers and responsibility</h2><p>The service is provided on an “as available” basis to the extent permitted by law. We do not guarantee that descriptions, links, or merchant information are always complete or current. To the extent permitted by applicable law, MishBaby is not responsible for indirect losses or for third-party products, merchant services, or external websites. Nothing here limits rights or liability that cannot legally be limited.</p></section>
    <section><h2>Governing law and contact</h2><p>These terms are governed by the laws of Israel, subject to any mandatory consumer protections that apply to you. Questions can be sent to <a href="mailto:mishbabyshop@gmail.com">mishbabyshop@gmail.com</a>. We may update these terms as the service changes and will revise the date above.</p></section>
    <aside className="rounded-2xl bg-[#fff7df] p-5 text-sm text-[#735a16]"><strong>Owner review:</strong> These terms are a product foundation, not legal advice. They should be reviewed by a qualified professional before MishBaby relies on them as final legal terms.</aside>
  </LegalPage>;
}
