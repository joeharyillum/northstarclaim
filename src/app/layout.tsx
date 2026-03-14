import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  metadataBase: new URL("https://northstarmedic.com"),
  title: {
    default: "NorthStar Medic | #1 AI Medical Claim Recovery Platform",
    template: "%s | NorthStar Medic",
  },
  description:
    "NorthStar Medic uses AI to recover denied medical insurance claims with a 35–40% success rate. Zero upfront cost — clinics pay $2,500 pilot or 30% on recovered revenue. Trusted by healthcare providers nationwide.",
  keywords: [
    "medical claim recovery",
    "denied claim appeals",
    "AI medical billing",
    "insurance claim recovery",
    "medical billing automation",
    "denied insurance claim help",
    "healthcare revenue recovery",
    "medical claim appeal service",
    "automated claim recovery",
    "NorthStar Medic",
    "medical billing AI",
    "insurance denial management",
    "revenue cycle management AI",
    "hospital claim recovery",
    "clinic denied claims",
  ],
  authors: [{ name: "NorthStar Medic" }],
  creator: "NorthStar Medic",
  publisher: "NorthStar Medic",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://northstarmedic.com",
    siteName: "NorthStar Medic",
    title: "NorthStar Medic | #1 AI Medical Claim Recovery Platform",
    description:
      "Recover denied medical claims automatically with 35–40% success rate. $2,500 pilot or 30% commission — pay only when we win.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NorthStar Medic - AI Medical Claim Recovery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NorthStar Medic | #1 AI Medical Claim Recovery",
    description:
      "Recover denied claims with AI. $2,500 pilot, 30% commission.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://northstarmedic.com",
  },
  verification: {},
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "NorthStar Medic",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              url: "https://northstarmedic.com",
              description:
                "AI-powered medical claim recovery platform that automatically appeals denied insurance claims with a 35–40% success rate.",
              offers: {
                "@type": "Offer",
                price: "2500",
                priceCurrency: "USD",
                description:
                  "$2,500 pilot fee. 30% success commission — pay only when claims are recovered.",
              },
              provider: {
                "@type": "Organization",
                name: "NorthStar Medic",
                url: "https://northstarmedic.com",
                logo: "https://northstarmedic.com/logo.png",
                sameAs: [],
                contactPoint: {
                  "@type": "ContactPoint",
                  contactType: "sales",
                  availableLanguage: "English",
                },
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "How much does NorthStar Medic cost?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "NorthStar Medic has a $2,500 one-time pilot fee that covers AI analysis of up to 500 claims. After that, we charge a 30% success fee only on recovered claims. The Growth Lattice tier is $7,500 with a reduced 20% commission for higher volume.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What is the success rate for denied claim appeals?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "NorthStar Medic achieves a 35–40% recovery success rate on denied medical insurance claim appeals using our AI-powered analysis and appeal generation system.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How does AI medical claim recovery work?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Our AI scans denied claims, identifies the specific CMS rules and payer guidelines that were violated, and automatically generates legally-sound appeal letters. The entire process takes minutes instead of weeks.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is NorthStar Medic HIPAA compliant?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. NorthStar Medic is fully HIPAA compliant with military-grade encryption and we provide a signed Business Associate Agreement (BAA) to every client.",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body>
        <ErrorBoundary>
          <Navigation />
          <main style={{ minHeight: "100vh" }}>
            {children}
          </main>
          <Footer />
          <Chatbot />
        </ErrorBoundary>
      </body>
    </html>
  );
}
