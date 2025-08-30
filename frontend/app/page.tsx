// app/page.tsx

import Link from 'next/link';
import Button from '@/components/Button';
import { ShieldCheck, UploadCloud, Timer, Share2, ArrowRight, Download, Eye } from 'lucide-react';

// Main Page Component
export default function HomePage() {
  return (
    <div className="bg-dark-blue text-soft-beige">
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}

// --- Page Sections ---

const HeroSection = () => (
  <section className="relative text-center py-32 md:py-48 bg-gradient-to-b from-dark-blue to-navy-blue">
    <div className="container mx-auto px-4 z-10">
      <h1 className="text-4xl md:text-6xl font-extrabold text-soft-beige mb-4 leading-tight">
        Share Files with Absolute Privacy and Control
      </h1>
      <p className="text-lg md:text-xl text-light-blue max-w-3xl mx-auto mb-8">
        SecuShare offers end-to-end encrypted file sharing with ephemeral links, ensuring your sensitive data is seen only by those you trust, and only when you want.
      </p>
      <div className="w-full max-w-xs mx-auto">
        <Link href="/signup">
          <Button className="flex items-center justify-center gap-2">
            Get Started for Free <ArrowRight size={20} />
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

const HowItWorksSection = () => (
  <section className="py-20 bg-dark-blue">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold mb-2">How It Works</h2>
      <p className="text-light-blue mb-12">Share files securely in three simple steps.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        <StepCard
          icon={<UploadCloud className="text-light-blue" size={40} />}
          title="1. Upload & Encrypt"
          description="Your file is encrypted in your browser before it even touches our servers. We never have access to your unencrypted data."
        />
        <StepCard
          icon={<Timer className="text-light-blue" size={40} />}
          title="2. Set Sharing Rules"
          description="Create a secure, one-time-use link. Set an expiration time and a download limit for complete control over your share."
        />
        <StepCard
          icon={<Share2 className="text-light-blue" size={40} />}
          title="3. Share Securely"
          description="Send the generated link to your recipient. Once the rules are met (e.g., downloaded once), the link is permanently disabled."
        />
      </div>
    </div>
  </section>
);

const FeaturesSection = () => (
  <section className="py-20 bg-navy-blue">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold mb-12">Security and Control at its Core</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <FeatureCard
          icon={<ShieldCheck size={32} className="text-light-blue" />}
          title="End-to-End Encryption"
          description="Using AES-256, your files are encrypted on your device and can only be decrypted by the recipient."
        />
        <FeatureCard
          icon={<Timer size={32} className="text-light-blue" />}
          title="Expiring Links"
          description="Ensure your files aren't accessible forever. Set a timer and links will automatically expire."
        />
        <FeatureCard
          icon={<Download size={32} className="text-light-blue" />}
          title="Download Limits"
          description="Restrict access to a single download or a specific number to prevent unauthorized sharing."
        />
        <FeatureCard
          icon={<Eye size={32} className="text-light-blue" />}
          title="Access Tracking"
          description="Get notified when your file is downloaded and see a history of access events (IP, timestamp)."
        />
        <FeatureCard
          icon={<UploadCloud size={32} className="text-light-blue" />}
          title="Large File Support"
          description="Securely transfer large files that are typically blocked by email providers, without compromising speed."
        />
        <FeatureCard
          icon={<Share2 size={32} className="text-light-blue" />}
          title="Simple Interface"
          description="A clean, intuitive user experience designed to make secure file sharing effortless for everyone."
        />
      </div>
    </div>
  </section>
);

const FinalCTASection = () => (
  <section className="py-20 bg-dark-blue">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold text-soft-beige mb-4">Ready to take control of your data?</h2>
      <p className="text-light-blue mb-8 max-w-xl mx-auto">Sign up now and experience the peace of mind that comes with truly secure file sharing.</p>
      <div className="w-full max-w-xs mx-auto">
        <Link href="/signup">
          <Button>Create Your Free Account</Button>
        </Link>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-navy-blue border-t border-light-blue/20">
    <div className="container mx-auto px-4 py-6 text-center text-light-blue">
      <p>&copy; {new Date().getFullYear()} SecuShare. All Rights Reserved.</p>
    </div>
  </footer>
);

// --- Reusable Sub-Components ---

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-dark-blue p-6 rounded-lg text-left border border-light-blue/20 transform hover:-translate-y-2 transition-transform duration-300">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-soft-beige mb-2">{title}</h3>
    <p className="text-light-blue">{description}</p>
  </div>
);

const StepCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="bg-navy-blue p-6 rounded-lg">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-soft-beige mb-2">{title}</h3>
        <p className="text-light-blue">{description}</p>
    </div>
);