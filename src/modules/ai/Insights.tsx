
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const mockInsights = [
  {
    id: 1,
    title: "Project Health Analysis",
    description: "Based on the current project data, the Website Redesign project is showing potential delays. Consider allocating additional resources to the development team.",
    confidence: 85,
  },
  {
    id: 2,
    title: "Vendor Performance",
    description: "Tech Solutions Inc has consistently delivered high-quality work ahead of schedule. Consider them for future priority projects.",
    confidence: 92,
  },
  {
    id: 3,
    title: "Financial Forecast",
    description: "Current spending patterns suggest the Q2 budget will be exhausted 2 weeks before the end of the quarter. Consider reviewing and adjusting allocations.",
    confidence: 78,
  },
  {
    id: 4,
    title: "Resource Optimization",
    description: "The Network Upgrade project team appears to be over-allocated. Consider redistributing 1-2 team members to other priority projects.",
    confidence: 81,
  },
];

const AIInsights = () => {
  const [insights, setInsights] = useState(mockInsights);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateInsights = () => {
    setIsLoading(true);
    
    // In a real application, this would make an API call to an AI service
    setTimeout(() => {
      // Mock a new insight based on the query
      const newInsight = {
        id: insights.length + 1,
        title: `Analysis: ${query}`,
        description: `Based on your query about "${query}", our AI analysis suggests this is a priority area to investigate further. The data shows potential opportunities for optimization.`,
        confidence: Math.floor(Math.random() * 30) + 65, // Random confidence between 65-95%
      };
      
      setInsights([newInsight, ...insights]);
      setQuery("");
      setIsLoading(false);
    }, 2000);
  };

  const handleClearInsights = () => {
    setInsights(mockInsights);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">AI Insights</h2>
        <p className="text-muted-foreground">
          Machine learning powered analysis and recommendations
        </p>
      </div>
      
      {/* Query Input */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Insights</CardTitle>
          <CardDescription>
            Ask a specific question or request an analysis of your system data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="query">Your Query</Label>
              <div className="flex space-x-2">
                <Input
                  id="query"
                  placeholder="e.g., Which projects are at risk of delay?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleGenerateInsights} 
                  disabled={!query.trim() || isLoading}
                >
                  {isLoading ? "Analyzing..." : "Generate"}
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>The AI will analyze system data to provide insights and recommendations.</p>
            </div>
            
            {insights.length > mockInsights.length && (
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={handleClearInsights}>
                  Reset to Default Insights
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Insights List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Recent Insights</h3>
        
        {insights.map((insight) => (
          <Card key={insight.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{insight.title}</CardTitle>
                <div className="text-sm">
                  Confidence: 
                  <span className={`ml-1 font-medium ${
                    insight.confidence > 85 
                      ? "text-green-600" 
                      : insight.confidence > 75 
                        ? "text-amber-600"
                        : "text-gray-600"
                  }`}>
                    {insight.confidence}%
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p>{insight.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AIInsights;
