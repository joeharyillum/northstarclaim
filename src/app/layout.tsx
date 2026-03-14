import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  metadataBase: new URL("https://northstarclaim.com"),
  title: {
    default: "NorthStar Claim | #1 AI Medical Claim Recovery Platform",
    template: "%s | NorthStar Claim",
  },
  description:
    "NorthStar Claim uses AI to recover denied medical insurance claims with a 35–40% success rate. Zero upfront cost — clinics pay $2,500 pilot or 30% on recovered revenue. Trusted by healthcare providers nationwide.",
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
    "NorthStar Claim",
    "medical billing AI",
    "insurance denial management",
    "revenue cycle management AI",
    "hospital claim recovery",
    "clinic denied claims",
  ],
  authors: [{ name: "NorthStar Claim" }],
  creator: "NorthStar Claim",
  publisher: "NorthStar Claim",
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
    url: "https://northstarclaim.com",
    siteName: "NorthStar Claim",
    title: "NorthStar Claim | #1 AI Medical Claim Recovery Platform",
    description:
      "Recover denied medical claims automatically with 35–40% success rate. $2,500 pilot or 30% commission — pay only when we win.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NorthStar Claim - AI Medical Claim Recovery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NorthStar Claim | #1 AI Medical Claim Recovery",
    description:
      "Recover denied claims with AI. $2,500 pilot, 30% commission.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://northstarclaim.com",
  },
  verification: {
    google: "ADD_YOUR_GOOGLE_VERIFICATION_CODE",
  },
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
              name: "NorthStar Claim",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              url: "https://northstarclaim.com",
              description:
                "AI-powered medical claim recovery platform that automatically appeals denied insurance claims with a 35–40% success rate.",
              offers: {
                "@type": "Offer",
                price: "2500",
                priceCurrency: "USD",
                description:
                  "$2,500 pilot fee. 30% success commission — pay only when claims are recovered.",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "47",
                bestRating: "5",
              },
              provider: {
                "@type": "Organization",
                name: "NorthStar Claim",
                url: "https://northstarclaim.com",
                logo: "https://northstarclaim.com/logo.png",
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
                  name: "How much does NorthStar Claim cost?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "NorthStar Claim has a $2,500 one-time pilot fee that covers AI analysis of up to 500 claims. After that, we charge a 30% success fee only on recovered claims. The Growth Lattice tier is $7,500 with a reduced 20% commission for higher volume.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What is the success rate for denied claim appeals?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "NorthStar Claim achieves a 35–40% recovery success rate on denied medical insurance claim appeals using our AI-powered analysis and appeal generation system.",
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
                  name: "Is NorthStar Claim HIPAA compliant?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. NorthStar Claim is fully HIPAA compliant with military-grade encryption and we provide a signed Business Associate Agreement (BAA) to every client.",
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
