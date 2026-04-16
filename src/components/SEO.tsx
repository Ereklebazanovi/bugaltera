
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

  const defaultTitle = lang === "en" ? "Darchia & Partners — Law Firm in Tbilisi, Georgia" : "დარჩია & პარტნიორები — იურიდიული ფირმა თბილისში";
  const defaultDescription = lang === "en"
    ? "Darchia & Partners is a leading law firm in Tbilisi, Georgia, providing expert legal services in civil, criminal, administrative, and corporate law. Contact us for professional legal advice."
    : "დარჩია & პარტნიორები — წამყვანი იურიდიული ფირმა თბილისში, რომელიც გთავაზობთ მაღალკვალიფიციურ იურიდიულ მომსახურებას სამოქალაქო, სისხლის, ადმინისტრაციულ და კორპორაციულ სამართალში. დაგვიკავშირდით პროფესიონალური იურიდიული კონსულტაციისთვის.";
  const defaultKeywords = "law firm georgia, lawyers tbilisi, legal services georgia, civil law, criminal law, administrative law, corporate law, darchia partners";
  const defaultImage = "https://www.darchiapartners.ge/og-default.jpg";
  const defaultPath = "/";

  const fullTitle = title ? `${title}` : defaultTitle;
  const fullDescription = description || defaultDescription;
  const fullKeywords = keywords || defaultKeywords;
  const fullImage = image || defaultImage;
  const fullPath = path || defaultPath;
  const fullCanonical = canonical || `https://www.darchiapartners.ge${fullPath}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={fullKeywords} />
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type || "website"} />
      <meta property="og:url" content={`https://www.darchiapartners.ge${fullPath}`} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={`https://www.darchiapartners.ge${fullPath}`} />
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
      {/* <link rel="alternate" hrefLang="ka-GE" href={`https://www.darchiapartners.ge/ka${fullPath}`} /> */}
      {/* <link rel="alternate" hrefLang="en-US" href={`https://www.darchiapartners.ge/en${fullPath}`} /> */}
      {/* <link rel="alternate" hrefLang="ru-RU" href={`https://www.darchiapartners.ge/ru${fullPath}`} /> */}
      <link rel="alternate" hrefLang="x-default" href={fullCanonical} />
    </Helmet>
  );
}
