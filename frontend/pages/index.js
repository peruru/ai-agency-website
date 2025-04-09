import Layout from '../components/Layout';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import ServicesSection from '../components/ServicesSection';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <Layout>
      <Header />
      <HeroSection />
      <ServicesSection />
      <Testimonials />
      <Footer />
    </Layout>
  );
}