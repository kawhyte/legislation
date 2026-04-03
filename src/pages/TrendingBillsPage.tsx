import React from 'react';
import TrendingBillGrid from '../components/TrendingBillGrid';

const TrendingBillsPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <div className="container-legislation container-section">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Legislative Bills Trending Around The USA
          </h1>
          <p className="text-8px-rhythm-lg text-muted-foreground">
            Bills that are currently gaining momentum nationwide.
          </p>
        </div>

        <TrendingBillGrid viewMode="detailed" />
      </div>
    </div>
  );
};

export default TrendingBillsPage;
