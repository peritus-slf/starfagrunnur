import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import SearchSection from "@/components/SearchSection";
import ApiDocs from "@/components/ApiDocs";
import Footer from "@/components/Footer";

// Render on every request so Hero/Stats always reflect the live graph
// — static pre-rendering froze them to an empty build-time DB.
// Cheap enough: getStats() issues five parameterless aggregations.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <SearchSection />
        <ApiDocs />
      </main>
      <Footer />
    </>
  );
}
