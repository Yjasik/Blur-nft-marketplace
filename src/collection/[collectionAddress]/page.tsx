import CollectionHeader from '../components/collectionHeader';
import CollectionHeroSection from '../components/collectionHeroSection';
import CollectionPurchaseSection from '../components/collectionPurchaseSection';

export default function CollectionPage() {
  return (
    <div className="viewCollection_main">
      <CollectionHeader />
      <CollectionHeroSection />
      <CollectionPurchaseSection />
    </div>
  );
}