import { Link } from "wouter";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors" data-testid="link-home">
          ← Back to Home
        </Link>
        
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="space-y-8 text-foreground/90 leading-relaxed">
          <section>
            <p className="text-muted-foreground mb-8">
              <strong>Last Updated:</strong> November 6, 2025
            </p>
            <p>
              At WOW by Dany, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you visit our website or make a purchase.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">Information We Collect</h2>
            <p className="mb-4">We collect information that you provide directly to us when you:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Make a purchase from our store</li>
              <li>Create an account or contact us</li>
              <li>Sign up for our newsletter or communications</li>
              <li>Browse our website</li>
            </ul>
            <p className="mb-4">This information may include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Personal Information:</strong> Name, email address, phone number</li>
              <li><strong>Shipping Information:</strong> Delivery address, city, state, ZIP code</li>
              <li><strong>Payment Information:</strong> Processed securely through Stripe (we do not store credit card details)</li>
              <li><strong>Order Information:</strong> Products purchased, order history, preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Process and fulfill your orders</li>
              <li>Send order confirmations and shipping notifications via email</li>
              <li>Generate shipping labels and track deliveries</li>
              <li>Respond to your questions and provide customer support</li>
              <li>Improve our website and customer experience</li>
              <li>Send promotional communications (you can opt-out anytime)</li>
              <li>Prevent fraud and ensure website security</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">Third-Party Services</h2>
            <p className="mb-4">We work with trusted third-party service providers to operate our business:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Stripe:</strong> Secure payment processing (subject to Stripe's Privacy Policy)</li>
              <li><strong>Shippo:</strong> Shipping label generation and tracking (subject to Shippo's Privacy Policy)</li>
              <li><strong>SendGrid:</strong> Email delivery for order confirmations and notifications (subject to SendGrid's Privacy Policy)</li>
            </ul>
            <p className="mt-4">
              These service providers only have access to the information necessary to perform their services and are obligated to protect your data.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">Data Security</h2>
            <p>
              We take reasonable measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. All payment transactions are encrypted and processed through Stripe's secure servers. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">Cookies and Tracking</h2>
            <p className="mb-4">
              Our website uses cookies and similar technologies to enhance your browsing experience, remember your shopping cart, and analyze site traffic. You can control cookies through your browser settings.
            </p>
            <p>
              We may use analytics tools to understand how visitors use our website, which helps us improve our services.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent where we rely on consent to process your data</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us using the information below.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Order information is typically retained for tax and accounting purposes.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">Children's Privacy</h2>
            <p>
              Our website is not directed to individuals under the age of 13. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child under 13, we will take steps to delete such information.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website with a new "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy or how we handle your personal information, please contact us:
            </p>
            <div className="bg-card p-6 rounded-lg border">
              <p className="font-semibold mb-2">WOW by Dany</p>
              <p className="text-muted-foreground">Email: jewelryboutiquewow@gmail.com</p>
              <p className="text-muted-foreground">Website: wowbydany.com</p>
            </div>
          </section>

          <section className="pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              By using our website and services, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
