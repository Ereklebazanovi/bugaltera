import LegalPage from "../components/LegalPage";
import SEO from "../components/SEO";

export default function Terms() {
  return (
    <>
      <SEO
        title="Terms and Conditions — Balance101"
        description="Read the terms and conditions of Balance101. Understand your rights and obligations when using our services."
        path="/terms"
        canonical="https://www.balance101.ge/terms"
      />
      <LegalPage pageKey="terms" />;
    </>
  );
}
