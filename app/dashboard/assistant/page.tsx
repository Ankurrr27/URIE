import { Bot, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function AssistantPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary" className="mb-3">AI Assistant</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">Resume AI Assistant</h1>
        <p className="mt-2 text-sm text-muted-foreground">Use the API-backed AI routes to improve summaries, bullets, and skills.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-primary" /> Draft improvement prompt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea className="min-h-56" placeholder="Paste resume bullets or a job description here..." />
          <div className="flex flex-wrap gap-2">
            <Button><Sparkles className="mr-2 h-4 w-4" /> Improve bullets</Button>
            <Button variant="secondary">Generate summary</Button>
            <Button variant="secondary">Suggest skills</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
