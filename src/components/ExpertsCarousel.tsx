import React from 'react';

interface LawImpact {
  id: number;
  title: string;
  description: string;
  image: string;
  backgroundColor: string;
}

const lawImpactData: LawImpact[] = [
  {
    id: 1,
    title: "Justice & Equality",
    description: "Laws protect your fundamental rights and ensure fair treatment for everyone.",
    image: "/justice.svg",
    backgroundColor: "bg-wellness-purple",
  },
  {
    id: 2,
    title: "Economic Opportunity",
    description: "From minimum wage to business rules, laws shape jobs and innovation.",
    image: "/forms.svg", 
    backgroundColor: "bg-wellness-pink",
  },
  {
    id: 3,
    title: "Health & Safety",
    description: "Food standards and workplace protections keep you and your family safe.",
    image: "/hands.svg",
    backgroundColor: "bg-wellness-green",
  },
  {
    id: 4,
    title: "Education & Future",
    description: "Educational policies and student aid shape learning opportunities.",
    image: "/justice.svg",
    backgroundColor: "bg-wellness-yellow",
  },
  {
    id: 5,
    title: "Environmental Protection",
    description: "Clean air and water standards protect the environment we depend on.",
    image: "/hands.svg",
    backgroundColor: "bg-primary",
  },
  {
    id: 6,
    title: "Technology & Privacy",
    description: "Data protection laws safeguard your personal information online.",
    image: "/forms.svg",
    backgroundColor: "bg-wellness-purple",
  }
];

const ExpertsCarousel: React.FC = () => {
  // Duplicate items for seamless infinite scroll
  const duplicatedImpacts = [...lawImpactData, ...lawImpactData];

  return (
    <section className="py-20 sm:py-24 lg:py-32 bg-muted/20 overflow-hidden">
      <div className="container mx-auto px-4 mb-16">
        <div className="text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            How Laws Impact Your Daily Life
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover the ways legislation shapes every aspect of your life, from basic rights to economic opportunities
          </p>
        </div>
      </div>

      <div className="relative">
        {/* Gradient overlays for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-muted/20 to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-muted/20 to-transparent z-10"></div>
        
        {/* Animated carousel container */}
        <div className="experts-carousel-track">
          {duplicatedImpacts.map((impact, index) => (
            <div
              key={`${impact.id}-${index}`}
              className="experts-carousel-item flex-shrink-0 mx-3 sm:mx-4"
            >
              <div className="expert-card group cursor-pointer">
                {/* Background with image and color overlay */}
                <div className={`expert-card-background ${impact.backgroundColor}/80 relative overflow-hidden rounded-2xl`}>
                  <div 
                    className="expert-card-image"
                    style={{
                      backgroundImage: `url(${impact.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    {/* Color overlay */}
                    <div className={`absolute inset-0 ${impact.backgroundColor} opacity-70 group-hover:opacity-60 transition-opacity duration-300`}></div>
                    
                    {/* Content overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    {/* Text content */}
                    <div className="expert-card-content absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h5 className="expert-card-name font-display text-xl font-bold mb-2 group-hover:scale-105 transition-transform duration-300">
                        {impact.title}
                      </h5>
                      <p className="expert-card-description text-sm opacity-90 leading-relaxed">
                        {impact.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExpertsCarousel;