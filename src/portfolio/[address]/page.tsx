import Header from '../components/header';
import PortfolioTitle from '../components/portfolioTitle';
import PortfolioData from '../components/portfolioData';

export default function PortfolioPage() {
  return (
    <div className="portfolio_main">
      <Header />
      <PortfolioTitle />
      <PortfolioData />
    </div>
  );
}