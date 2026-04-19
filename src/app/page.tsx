import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import SearchSection from "@/components/SearchSection";
import ApiDocs from "@/components/ApiDocs";
import Footer from "@/components/Footer";

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
