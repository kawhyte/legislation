'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { TOPICS } from '@/constants/topics';

interface TopicSelectorProps {
  selectedTopic: string | null;
  onTopicSelect: (topic: string | null) => void;
  disabled?: boolean;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({ selectedTopic, onTopicSelect, disabled }) => {
  const selectedTopicData = TOPICS.find(t => t.value === selectedTopic);

  const selectElement = (
    <Select onValueChange={(value) => onTopicSelect(value === "all" ? null : value)} value={selectedTopic || "all"} disabled={disabled}>
      <SelectTrigger className="w-full text-base py-6 px-4 bg-card border border-border">
        <SelectValue placeholder="Select a topic">
          {selectedTopicData ? (
            <div className="flex items-center">
              <selectedTopicData.icon className="w-6 h-6 mr-2" />
              <span>{selectedTopicData.label}</span>
            </div>
          ) : (
            "All Topics"
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-popover text-popover-foreground border-border">
        <SelectItem value="all" className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">All Topics</SelectItem>
        {TOPICS.map(topic => {
          const Icon = topic.icon;
          return (
            <SelectItem key={topic.value} value={topic.value} className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
              <div className="flex items-center">
                <Icon className="w-6 h-6 mr-2" />
                <span>{topic.label}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );

  if (disabled) {
    return (
      <div className="flex-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full">{selectElement}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Please select a state first.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className='flex-1'>
      {selectElement}
    </div>
  );
};

export default TopicSelector;
