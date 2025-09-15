import React from 'react';
import { 
  Search, 
  Sparkles, 
  Bell, 
  BookOpen, 
  Users, 
  Shield,
  Gavel,
  TrendingUp 
} from 'lucide-react';

interface CarouselItem {
  id: number;
  text: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

const carouselItems: CarouselItem[] = [
  {
    id: 1,
    text: "track bills that matter",
    icon: Search,
    color: "text-primary",
    bgColor: "bg-primary/10"
  },
  {
    id: 2,
    text: "get AI summaries",
    icon: Sparkles,
    color: "text-wellness-purple",
    bgColor: "bg-wellness-purple/10"
  },
  {
    id: 3,
    text: "stay informed",
    icon: Bell,
    color: "text-wellness-green",
    bgColor: "bg-wellness-green/10"
  },
  {
    id: 4,
    text: "understand legislation",
    icon: BookOpen,
    color: "text-wellness-pink",
    bgColor: "bg-wellness-pink/10"
  },
  {
    id: 5,
    text: "engage your community",
    icon: Users,
    color: "text-primary",
    bgColor: "bg-primary/10"
  },
  {
    id: 6,
    text: "protect your rights",
    icon: Shield,
    color: "text-wellness-green",
    bgColor: "bg-wellness-green/10"
  },
  {
    id: 7,
    text: "follow the process",
    icon: Gavel,
    color: "text-wellness-purple",
    bgColor: "bg-wellness-purple/10"
  },
  {
    id: 8,
    text: "spot trends early",
    icon: TrendingUp,
    color: "text-wellness-yellow",
    bgColor: "bg-wellness-yellow/10"
  }
];

const FeatureCarousel: React.FC = () => {
  // Duplicate items for seamless infinite scroll
  const duplicatedItems = [...carouselItems, ...carouselItems];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-background to-accent/20 overflow-hidden">
      <div className="relative">
        {/* Gradient overlays for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-background to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-background to-transparent z-10"></div>
        
        {/* Animated carousel container */}
        <div className="carousel-track bg-wellness-yellow">
          {duplicatedItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={`${item.id}-${index}`}
                className="carousel-item flex-shrink-0 mx-4 sm:mx-6 "
              >
                <div className="flex items-center gap-4 sm:gap-6   px-6 sm:px-8 py-4 sm:py-6  transition-all duration-300 hover:-translate-y-1">
                  {/* Animated icon container */}
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 ${item.bgColor} rounded-xl flex items-center justify-center transition-transform duration-300 hover:scale-110`}>
                    <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${item.color}`} />
                  </div>
                  
                  {/* Text */}
                  <span className="font-display text-lg sm:text-xl font-semibold text-foreground whitespace-nowrap">
                    {item.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureCarousel;