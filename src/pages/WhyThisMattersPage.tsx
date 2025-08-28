import React from 'react';
import { Scale, Users, Landmark, Leaf, HeartPulse, BrainCircuit } from 'lucide-react';

const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
  <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center text-center">
    <div className="bg-blue-100 text-blue-600 rounded-full p-4 mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{children}</p>
  </div>
);

const WhyThisMattersPage: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-blue-600 text-white text-center py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-extrabold mb-4">Why Legislation Matters</h1>
          <p className="text-xl max-w-3xl mx-auto">
            From your morning coffee to your evening news, laws shape every aspect of your life. Understanding them is the first step to shaping your future.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section>
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How Laws Impact Your Daily Life</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard icon={<Scale size={32} />} title="Justice & Equality">
              Laws ensure fair treatment and protect your fundamental rights, creating a just society for everyone.
            </FeatureCard>
            <FeatureCard icon={<Users size={32} />} title="Community & Services">
              Legislation funds and regulates public services like schools, parks, roads, and healthcare that you use every day.
            </FeatureCard>
            <FeatureCard icon={<Landmark size={32} />} title="Economic Opportunity">
              From minimum wage to business regulations, laws create the economic environment for jobs and innovation to flourish.
            </FeatureCard>
          </div>
        </section>

        <section className="mt-20 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Voice, Your Future</h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto mb-8">
                When you're informed about new and existing legislation, you're not just a spectator—you're a participant in democracy. Your awareness empowers you to vote, advocate, and drive change on the issues you care about most.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
                <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold flex items-center"><Leaf className="mr-2" size={20} /> Environment</span>
                <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full font-semibold flex items-center"><HeartPulse className="mr-2" size={20} /> Healthcare</span>
                <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold flex items-center"><BrainCircuit className="mr-2" size={20} /> Technology</span>
            </div>
        </section>

        <section className="mt-20 bg-blue-600 text-white rounded-lg p-12 text-center">
            <h2 className="text-4xl font-bold mb-4">Stay Informed, Stay Empowered</h2>
            <p className="text-xl max-w-3xl mx-auto mb-6">
                Our platform is designed to demystify the legislative process, providing you with the clear, concise information you need to be an effective citizen.
            </p>
            <button className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-transform transform hover:scale-105">
                Start Tracking Bills
            </button>
        </section>
      </main>
    </div>
  );
};

export default WhyThisMattersPage;
