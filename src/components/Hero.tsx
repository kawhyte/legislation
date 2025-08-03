import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MapPin, Info, Users, Building } from 'lucide-react';
import StateSelector, { type States } from '../components/JurisdictionSelector';


// --- Data ---
// In a real application, you would fetch this from an API.
// For this example, we'll use a static object.
const legislatureData = {
  CA: {
    name: 'California',
    coords: { lon: -119.4179, lat: 36.7783 },
    zoom: 5.5,
    senators: {
      total: 40,
      democrats: 32, // Updated data for realism
      republicans: 8,
    },
    assembly: {
      total: 80,
      democrats: 62,
      republicans: 18,
    },
  },
  NV: {
    name: 'Nevada',
    coords: { lon: -116.4194, lat: 38.8026 },
    zoom: 5.8,
    senators: {
      total: 21,
      democrats: 13,
      republicans: 8,
    },
    assembly: {
      total: 42,
      democrats: 28,
      republicans: 14,
    },
  },
  TX: {
    name: 'Texas',
    coords: { lon: -99.9018, lat: 31.9686 },
    zoom: 5,
    senators: {
      total: 31,
      democrats: 12,
      republicans: 19,
    },
    assembly: {
      name: 'House of Representatives',
      total: 150,
      democrats: 64,
      republicans: 86,
    },
  },
};

interface Props {
    jurisdiction: States | null;
}


export default function App({ jurisdiction }: Props) {
  // --- State Management ---
  const [selectedState, setSelectedState] = useState('CA');
  
  // --- API Configuration ---
  // IMPORTANT: Replace with your actual Geoapify API key.
  const geoapifyApiKey = 'bbd7c80a0a3a43549778382e9e794add';

  // --- Derived State ---
  const currentData = legislatureData[selectedState];
  const mapUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-bright-grey&width=800&height=600&center=lonlat:${currentData.coords.lon},${currentData.coords.lat}&zoom=${currentData.zoom}&apiKey=${geoapifyApiKey}`;

	if (!jurisdiction) {
		return (
			<div>
				<h2 className='text-2xl font-bold mb-4'>Legislature</h2>
			</div>
		);
	}


  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-4 sm:p-6  flex items-center justify-center font-sans">
      <Card className="w-full max-w-5xl shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="p-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="space-y-1">
              <CardTitle className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                {jurisdiction.name} State Legislature
              </CardTitle>
              <CardDescription>
                Legislative data and party breakdown.
              </CardDescription>
            </div>
            {/* <div className="w-full sm:w-48">
              <Select onValueChange={setSelectedState} defaultValue={selectedState}>
                <SelectTrigger className="w-full">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(legislatureData).map((stateAbbr) => (
                    <SelectItem key={stateAbbr} value={stateAbbr}>
                      {legislatureData[stateAbbr].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

        
            </div> */}
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Informational Alert Banner */}
          {/* <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/50">
            <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertTitle className="font-semibold text-yellow-800 dark:text-yellow-300">Open States is now Plural!</AlertTitle>
            <AlertDescription className="text-yellow-700 dark:text-yellow-400">
              The Open States website is now available at open.pluralpolicy.com. You can try out an account using these new and improved tools.
            </AlertDescription>
          </Alert> */}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            
            {/* Left Column: Map */}
            <div className="lg:col-span-3 w-full h-auto aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-md">
              <img 
                src={mapUrl} 
                alt={`Map of ${jurisdiction.name}`} 
                className="w-full h-full object-cover"
                onError={(e) => { 
                  e.target.onerror = null; 
                  // Provide a fallback placeholder if the API fails or the key is missing
                  e.target.src=`https://placehold.co/800x600/e2e8f0/475569?text=Map+of+${jurisdiction.name}`;
                }}
              />
            </div>

            {/* Right Column: Stats */}
            <div className="lg:col-span-2 w-full space-y-8">
              {/* Senators */}
              <div className="flex flex-col items-start p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                 <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    <Building className="h-4 w-4 mr-2"/>
                    Senators
                 </div>
                 <p className="text-6xl font-bold text-gray-800 dark:text-white">{currentData.senators.total}</p>
                 <ul className="mt-4 space-y-2 text-gray-700 dark:text-gray-300 w-full">
                    <li className="flex justify-between items-center">
                        <span>Democrats</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{currentData.senators.democrats}</span>
                    </li>
                    <li className="flex justify-between items-center">
                        <span>Republicans</span>
                        <span className="font-semibold text-red-600 dark:text-red-400">{currentData.senators.republicans}</span>
                    </li>
                 </ul>
              </div>

              {/* Assemblymembers */}
              <div className="flex flex-col items-start p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                 <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    <Users className="h-4 w-4 mr-2"/>
                    {currentData.assembly.name || 'Assemblymembers'}
                 </div>
                 <p className="text-6xl font-bold text-gray-800 dark:text-white">{currentData.assembly.total}</p>
                 <ul className="mt-4 space-y-2 text-gray-700 dark:text-gray-300 w-full">
                    <li className="flex justify-between items-center">
                        <span>Democrats</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{currentData.assembly.democrats}</span>
                    </li>
                    <li className="flex justify-between items-center">
                        <span>Republicans</span>
                        <span className="font-semibold text-red-600 dark:text-red-400">{currentData.assembly.republicans}</span>
                    </li>
                 </ul>
              </div>
            </div>
          </div>
        </CardContent>
        
     
      </Card>
    </div>
  );
}