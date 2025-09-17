import React, { useState } from 'react';
import TrendingBillGrid from '../components/TrendingBillGrid';
import BillViewSwitcher from '../components/BillViewSwitcher';
import type { BillViewMode } from '@/types';

const TrendingBillsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<BillViewMode>('quick');

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

        {/* View Switcher */}
        <div className="flex justify-between items-center mb-8">
          <BillViewSwitcher 
            value={viewMode}
            onValueChange={setViewMode}
          />
        </div>

        <TrendingBillGrid
          viewMode={viewMode}
        />
      </div>
    </div>
  );
};

export default TrendingBillsPage;
