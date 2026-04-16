import LegalPage from "../components/LegalPage";
import SEO from "../components/SEO";

export default function Privacy() {
  return (
    <>
      <SEO
        title="Privacy Policy — Darchia & Partners"
        description="Read the privacy policy of Darchia & Partners. Learn how we handle your data and ensure your privacy."
        path="/privacy"
        canonical="https://www.darchiapartners.ge/privacy"
      />
      <LegalPage pageKey="privacy" />;
    </>
  );
}
