import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Travel Blog - Safar AI | Tips, Guides & Travel Stories",
  description:
    "Discover budget travel tips, destination guides, street food trails, visa help, and travel facts. Plan smarter trips with Safar AI's travel blog.",
  openGraph: {
    title: "Travel Blog - Safar AI | Tips, Guides & Travel Stories",
    description:
      "Budget travel tips, destination guides, and travel stories for Indian travelers.",
    type: "website",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
