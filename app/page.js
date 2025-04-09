import Layout from '../../frontend/components/Layout';
import Header from '../../frontend/components/Header';
import HeroSection from '../../frontend/components/HeroSection';
import FeaturesSection from '../../frontend/components/FeaturesSection';
import Testimonials from '../../frontend/components/Testimonials';
import Footer from '../../frontend/components/Footer';

export default function Home() {
  return (
    <Layout>
      <Header />
      <HeroSection />
      <FeaturesSection />
      <Testimonials />
      <Footer />
    </Layout>
  );
}