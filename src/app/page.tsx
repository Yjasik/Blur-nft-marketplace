import Header from '@/components/Header'; 
import HeroSection from '@/components/HeroSection';
// import Carousel from '@/components/Carousel';
// import TrendingSection from '@/components/TrendingSection';
// import AirdropPopUp from '@/components/AirdropPopUp';

export default function Home() {
  return (
    <main className="main">
      <Header />
      <HeroSection />
      {/* <Carousel />
      <TrendingSection />
      <AirdropPopUp /> */}
    </main>
  );
}