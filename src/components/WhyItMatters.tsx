// src/components/WhyItMatters.tsx
import { Handshake, Vote, School } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WhyItMatters = () => {
  const points = [
    {
      icon: <Handshake className="h-8 w-8 text-primary" />,
      title: "It Affects Your Daily Life",
      description: "From the roads you drive on to the healthcare you receive, laws shape every aspect of your world. Understanding them is the first step to influencing them."
    },
    {
      icon: <Vote className="h-8 w-8 text-primary" />,
      title: "Your Voice Matters",
      description: "Politicians respond to engaged citizens. When you're informed, you can advocate for change, hold leaders accountable, and ensure your community's needs are met."
    },
    {
      icon: <School className="h-8 w-8 text-primary" />,
      title: "Shape Your Future",
      description: "The laws passed today will define the world of tomorrow. Staying informed empowers you to help build a future that aligns with your values and goals."
    }
  ];

  return (
    <div className="bg-slate-50 py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Why This Matters</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Legislation isn't just for politicians. It's the blueprint for our society, and you have a role to play.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {points.map((point) => (
            <Card key={point.title} className="text-center border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="items-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  {point.icon}
                </div>
                <CardTitle className="text-lg font-semibold text-foreground">{point.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{point.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhyItMatters;