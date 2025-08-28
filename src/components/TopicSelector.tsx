import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface TopicSelectorProps {
  selectedTopic: string | null;
  onTopicSelect: (topic: string | null) => void;
}

const topics = ["AI", "Crime", "Healthcare", "Education", "Environment"];

const TopicSelector: React.FC<TopicSelectorProps> = ({ selectedTopic, onTopicSelect }) => {
  return (
    <Select onValueChange={(value) => onTopicSelect(value === "all" ? null : value)} value={selectedTopic || "all"}>
      <SelectTrigger className="w-full md:w-[240px]">
        <SelectValue placeholder="Select a topic" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Topics</SelectItem>
        {topics.map(topic => (
          <SelectItem key={topic} value={topic.toLowerCase()}>{topic}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TopicSelector;