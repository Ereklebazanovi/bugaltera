import LegalPage from "../components/LegalPage";
import SEO from "../components/SEO";

export default function Terms() {
  return (
    <>
      <SEO
        title="Terms and Conditions — Darchia & Partners"
        description="Read the terms and conditions of Darchia & Partners. Understand your rights and obligations when using our services."
        path="/terms"
        canonical="https://www.darchiapartners.ge/terms"
      />
      <LegalPage pageKey="terms" />;
    </>
  );
}
