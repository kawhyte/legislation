import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { BrainCircuit, Gavel, HeartPulse, GraduationCap, Leaf, type LucideIcon } from 'lucide-react';

interface Topic {
  name: string;
  value: string;
  icon: LucideIcon;
}

const topics: Topic[] = [
  { name: "Technology", value: "ai", icon: BrainCircuit },
  { name: "Housing@", value: "crime", icon: Gavel },
  { name: "Healthcare", value: "healthcare", icon: HeartPulse },
  { name: "Education", value: "education", icon: GraduationCap },
  { name: "Environment", value: "environment", icon: Leaf },
];

interface TopicSelectorProps {
  selectedTopic: string | null;
  onTopicSelect: (topic: string | null) => void;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({ selectedTopic, onTopicSelect }) => {
  const selectedTopicData = topics.find(t => t.value === selectedTopic);

  return (
    <div className='flex-1'>
      <Select onValueChange={(value) => onTopicSelect(value === "all" ? null : value)} value={selectedTopic || "all"}>
        <SelectTrigger className="w-full text-base py-6 px-4 bg-card border border-border">
          <SelectValue placeholder="Select a topic">
            {selectedTopicData ? (
              <div className="flex items-center">
                <selectedTopicData.icon className="w-6 h-6 mr-2" />
                <span>{selectedTopicData.name}</span>
              </div>
            ) : (
              "All Topics"
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-popover text-popover-foreground border-border">
          <SelectItem value="all" className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">All Topics</SelectItem>
          {topics.map(topic => {
            const Icon = topic.icon;
            return (
              <SelectItem key={topic.value} value={topic.value} className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                <div className="flex items-center">
                  <Icon className="w-6 h-6 mr-2" />
                  <span>{topic.name}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TopicSelector;
