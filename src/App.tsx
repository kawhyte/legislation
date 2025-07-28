

import FilterBar from './components/FilterBar';

import Header from './components/Header';
import StatCard from './components/StatCard';
import BillGrid from './components/BillGrid';
import StateSelector from './components/StateSelector';


const App = () => {
  return (
    <div className="bg-white min-h-screen">
    
      <Header/>
 

      <main className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Paid Family Leave bills</h1>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Bills" value={98} note="Last 3 months" color="blue" />
          <StatCard label="Major Update" value={11} note="Last 3 months" color="indigo" />
          <StatCard label="New Bills" value={0} note="Last 40 days" color="yellow" />
          <StatCard label="Failed Bills" value={0} note="Last 2 months" color="red" />
      
        </div>
        <div className="text-sm text-center text-gray-500 mb-4">
         
          Information updated Monday, November 14th 2022
        </div>

        <FilterBar />

<StateSelector/>

        {/* Bill Cards Grid */}
        
        <BillGrid/>
        
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <BillCard
             id="New York - K 825"
            introduced="May 03, 2022"
            status="Adopted"
            summary="Memorializing governor Kathy Hochul to proclaim May 6, 2022, as mother's equal pay day in New York"
            sources={['1', '2']}
          />
          <BillCard
            id="Massachusetts - H 4612"
            introduced="Apr 03, 2022"
            status="Reported"
            summary="An act relative to the creation of a paid family and medical leave advisory board"
            sources={['1']}
          />
        </div> */}
      </main>
     
    </div>
  );
};

export default App;
