
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  path?: string;
  canonical?: string;
  type?: string;
  publishedTime?: string;
  noindex?: boolean;
}

export default function SEO({ title, description, keywords, image, path, canonical, type, publishedTime, noindex }: SEOProps) {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const defaultTitle = lang === "en" ? "Balance101 — Accounting & Financial Services in Tbilisi, Georgia" : "ბალანსი 101 — საბუღალტრო და ფინანსური მომსახურება თბილისში";
  const defaultDescription = lang === "en"
    ? "Balance101 is a professional accounting and financial services firm in Tbilisi, Georgia, providing bookkeeping, tax consulting, audit, and financial advisory. Contact us for expert financial advice."
    : "ბალანსი 101 — პროფესიონალური საბუღალტრო და ფინანსური მომსახურება თბილისში. ბუღალტრული აღრიცხვა, საგადასახადო კონსულტაცია, აუდიტი და ფინანსური მრჩეველობა. დაგვიკავშირდით კვალიფიციური კონსულტაციისთვის.";
  const defaultKeywords = "accounting georgia, bookkeeping tbilisi, tax consulting georgia, audit tbilisi, financial services georgia, balance101, ბალანსი 101";
  const siteUrl = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ?? 'https://www.balance101.ge';
  const defaultImage = `${siteUrl}/og-default.jpg`;
  const defaultPath = "/";

  const fullTitle = title ? `${title}` : defaultTitle;
  const fullDescription = description || defaultDescription;
  const fullKeywords = keywords || defaultKeywords;
  const fullImage = image || defaultImage;
  const fullPath = path || defaultPath;
  const fullCanonical = canonical || `https://www.balance101.ge${fullPath}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={fullKeywords} />
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type || "website"} />
      <meta property="og:url" content={`https://www.balance101.ge${fullPath}`} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="fb:app_id" content="" />
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={`https://www.balance101.ge${fullPath}`} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={fullDescription} />
      <meta property="twitter:image" content={fullImage} />
      {/* Canonical Link */}
      <link rel="canonical" href={fullCanonical} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}

      {/* hreflang links */}
      {/* Add more specific hreflangs if needed, for now using x-default for the main path */}
      {/* Example for a specific page if direct translations exist: */}
      {/* <link rel="alternate" hrefLang="ka-GE" href={`https://www.balance101.ge/ka${fullPath}`} /> */}
      {/* <link rel="alternate" hrefLang="en-US" href={`https://www.balance101.ge/en${fullPath}`} /> */}
      {/* <link rel="alternate" hrefLang="ru-RU" href={`https://www.balance101.ge/ru${fullPath}`} /> */}
      <link rel="alternate" hrefLang="x-default" href={fullCanonical} />
    </Helmet>
  );
}
