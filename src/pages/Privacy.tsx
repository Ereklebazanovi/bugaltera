import LegalPage from "../components/LegalPage";
import SEO from "../components/SEO";

export default function Privacy() {
  return (
    <>
      <SEO
        title="Privacy Policy — Balance101"
        description="Read the privacy policy of Balance101. Learn how we handle your data and ensure your privacy."
        path="/privacy"
        canonical="https://www.balance101.ge/privacy"
      />
      <LegalPage pageKey="privacy" />;
    </>
  );
}
