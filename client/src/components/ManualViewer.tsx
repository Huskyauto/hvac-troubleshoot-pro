import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { FileText, ExternalLink, Save, Clock, Eye } from "lucide-react";
import { toast } from "sonner";

interface ManualViewerProps {
  modelId?: number;
  brand?: string;
  equipmentType?: string;
}

export default function ManualViewer({ modelId, brand, equipmentType }: ManualViewerProps) {
  const [manualUrl, setManualUrl] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualSource, setManualSource] = useState<"user_manual" | "service_manual" | "installation_manual" | "parts_list">("user_manual");

  const utils = trpc.useUtils();

  // Get manuals for this model
  const manuals$ = trpc.manuals.byModel.useQuery(
    { modelId: modelId! },
    { enabled: !!modelId }
  );

  // Save manual mutation
  const saveManual = trpc.manuals.save.useMutation({
    onSuccess: (data) => {
      if (data.cached) {
        toast.info("Manual already exists in database");
      } else {
        toast.success("Manual saved successfully!");
      }
      utils.manuals.byModel.invalidate();
      setManualUrl("");
      setManualTitle("");
    },
    onError: (error) => {
      toast.error("Failed to save manual: " + error.message);
    },
  });

  // Track access mutation
  const trackAccess = trpc.manuals.trackAccess.useMutation();

  const handleSaveManual = () => {
    if (!manualUrl || !manualTitle) {
      toast.error("Please provide both URL and title");
      return;
    }

    saveManual.mutate({
      url: manualUrl,
      title: manualTitle,
      source: manualSource,
      modelId,
      brand,
      equipmentTypes: equipmentType ? [equipmentType] : undefined,
    });
  };

  const handleViewManual = (docId: number, url: string) => {
    // Track that this manual was accessed
    trackAccess.mutate({ docId });
    
    // Open in new tab
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Add New Manual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Manual Reference</CardTitle>
          <CardDescription>
            Save a manual URL for future reference
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="manual-url">Manual URL</Label>
            <Input
              id="manual-url"
              placeholder="https://example.com/manual.pdf"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="manual-title">Title</Label>
            <Input
              id="manual-title"
              placeholder="e.g., User Manual - Carrier 58MCA"
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="manual-type">Type</Label>
            <select
              id="manual-type"
              className="w-full border rounded-md px-3 py-2"
              value={manualSource}
              onChange={(e) => setManualSource(e.target.value as any)}
            >
              <option value="user_manual">User Manual</option>
              <option value="service_manual">Service Manual</option>
              <option value="installation_manual">Installation Manual</option>
              <option value="parts_list">Parts List</option>
            </select>
          </div>

          <Button
            onClick={handleSaveManual}
            disabled={saveManual.isPending || !manualUrl || !manualTitle}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Save Manual
          </Button>
        </CardContent>
      </Card>

      {/* Existing Manuals */}
      {manuals$.data?.manuals && manuals$.data.manuals.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Saved Manuals</h3>
          <div className="space-y-3">
            {manuals$.data.manuals.map((manual) => (
              <Card key={manual.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold">{manual.title}</h4>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline">
                          {manual.source?.replace(/_/g, " ")}
                        </Badge>
                        {manual.accessCount && manual.accessCount > 0 && (
                          <Badge variant="secondary" className="gap-1">
                            <Eye className="h-3 w-3" />
                            {manual.accessCount} views
                          </Badge>
                        )}
                        {manual.lastAccessedAt && (
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(manual.lastAccessedAt).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>

                      {manual.brand && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Brand: {manual.brand}
                        </p>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleViewManual(manual.id, manual.url || manual.blobUrl || "")}
                    >
                      <ExternalLink className="h-4 w-4" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {manuals$.data?.manuals && manuals$.data.manuals.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No manuals saved yet</h3>
            <p className="text-muted-foreground">
              Add manual references above to build your knowledge base
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

