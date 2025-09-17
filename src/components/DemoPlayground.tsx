// src/components/DemoPlayground.tsx
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlayCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { useDemo } from '@/contexts/DemoContext';
import DemoBillCard from './DemoBillCard';
import { Link } from 'react-router-dom';

const DemoPlayground: React.FC = () => {
  const { 
    currentDemoBills, 
    refreshDemoBills, 
    demoSavedBills, 
    isDemoMode,
    setDemoMode,
    demoBills
  } = useDemo();
  
  const [activeTab, setActiveTab] = useState("demo-bills");


  const handleRefreshBills = () => {
    refreshDemoBills();
  };

  // Get exactly 3 trending bills (High momentum)
  const getTrendingBills = () => {
    // Get High momentum bills from current demo bills first
    let trendingBills = currentDemoBills.filter(bill => bill.momentum && bill.momentum.level === 'High');
    
    // If we don't have enough from current selection, get more from all demo bills
    if (trendingBills.length < 3) {
      const allHighMomentumBills = demoBills.filter(bill => bill.momentum && bill.momentum.level === 'High');
      
      // Add additional bills until we have 3
      const neededBills = allHighMomentumBills
        .filter(bill => !trendingBills.some(trending => trending.id === bill.id))
        .slice(0, 3 - trendingBills.length);
      
      trendingBills = [...trendingBills, ...neededBills];
    }
    
    return trendingBills.slice(0, 3);
  };

  // Auto-activate demo mode if not already active
  if (!isDemoMode) {
    setDemoMode(true);
    refreshDemoBills();
  }

  return (
    <section id="demo-playground" className="container-legislation py-8 mx-auto bg-gray-900 border-2 border-solid border-primary/40 rounded-4xl relative overflow-hidden">
      {/* Demo Mode Indicator */}
      <div className="absolute top-4 right-4 z-10">
        <Badge className="bg-primary-foreground text-gray-900">
          <PlayCircle className="h-3 w-3 mr-1" />
          Demo Mode
        </Badge>
      </div>

      <div className="container-legislation">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-6xl font-bold text-wellness-yellow">
               Interactive Demo Dashboard
            </h2>
            <p className="text-lg text-primary-foreground max-w-2xl mx-auto">
              Explore legislation tracking features with live data. All actions are temporary and saved locally.
            </p>
          </div>

          {/* Demo Dashboard Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 [&>[data-state=active]]:bg-wellness-yellow [&>[data-state=active]]:text-foreground">
              <TabsTrigger value="demo-bills">Demo Bills</TabsTrigger>
              <TabsTrigger value="demo-saved" className="flex items-center gap-2">
                Saved Bills
                {demoSavedBills.length > 0 && (
                  <Badge className='h-5 px-2 rounded-full text-xs bg-primary text-primary-foreground'>
                    {demoSavedBills.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="demo-trending">Trending Bills</TabsTrigger>
            </TabsList>

            {/* Demo Bills Tab */}
            <TabsContent value="demo-bills" className="mt-0">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-wellness-yellow">Sample Legislation</h3>
                    <p className="text-primary-foreground">Click "Explain this Bill" to see AI summaries in action</p>
                  </div>
                  <Button 
                    variant="default" 
                    onClick={handleRefreshBills}
                    className="flex items-center gap-2 bg-card text-card-foreground hover:bg-primary-hover"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Get New Bills
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentDemoBills.map((bill) => (
                    <DemoBillCard key={bill.id} bill={bill} />
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Demo Saved Bills Tab */}
            <TabsContent value="demo-saved" className="mt-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-wellness-yellow">Your Saved Bills</h3>
                  <p className="text-primary-foreground">Bills you've bookmarked in this demo session</p>
                </div>
                
                {demoSavedBills.length === 0 ? (
                  <Card className="bg-card border-border p-8 text-center">
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <Badge className="w-8 h-8 rounded-full" />
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-foreground mb-2">No saved bills yet</h4>
                        <p className="text-muted-foreground mb-4">
                          Switch to the Demo Bills tab and click the bookmark button on any bill to save it here.
                        </p>
                        <Button 
                          variant="outline" 
                          onClick={() => setActiveTab("demo-bills")}
                          className="flex items-center gap-2"
                        >
                          Explore Demo Bills
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {demoSavedBills.map((savedBill) => (
                      <DemoBillCard key={savedBill.id} bill={savedBill.billData} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Demo Trending Tab */}
            <TabsContent value="demo-trending" className="mt-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-wellness-yellow">Trending Legislation</h3>
                  <p className="text-primary-foreground">Popular bills gaining momentum across states</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getTrendingBills().map((bill) => (
                    <DemoBillCard key={`trending-${bill.id}`} bill={bill} showTrendingReason />
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Call to Action */}
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Ready to track real legislation?
            </h4>
            <p className="text-muted-foreground mb-4">
              Create a free account to save bills permanently and get personalized updates.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary-hover">
                <Link to="/sign-up">
                  Create Free Account
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/sign-in">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoPlayground;