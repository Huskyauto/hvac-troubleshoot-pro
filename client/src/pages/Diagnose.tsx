import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function Diagnose() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [symptom, setSymptom] = useState("");
  const [errorCodes, setErrorCodes] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const [selectedModelId, setSelectedModelId] = useState<number | undefined>();

  const startDiagnostic = trpc.diagnostics.start.useMutation({
    onSuccess: (data) => {
      toast.success("Diagnostic analysis complete!");
      setLocation(`/diagnostic/${data.sessionId}`);
    },
    onError: (error) => {
      toast.error("Failed to start diagnostic: " + error.message);
    },
  });

  const modelSearch$ = trpc.equipment.search.useQuery(
    { query: modelSearch },
    { enabled: modelSearch.length > 2 }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symptom.trim()) {
      toast.error("Please describe the issue");
      return;
    }

    const errorCodeArray = errorCodes
      .split(",")
      .map(c => c.trim())
      .filter(c => c.length > 0);

    startDiagnostic.mutate({
      symptom: symptom.trim(),
      errorCodes: errorCodeArray.length > 0 ? errorCodeArray : undefined,
      deviceId: selectedModelId,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to access the diagnostic tool
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Start HVAC Diagnosis</h1>
            <p className="text-muted-foreground">
              Describe your HVAC issue and our AI will provide step-by-step troubleshooting guidance
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Information (Optional)</CardTitle>
                <CardDescription>
                  Help us provide more accurate diagnostics by identifying your equipment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="model-search">Search Equipment Model</Label>
                  <Input
                    id="model-search"
                    placeholder="e.g., Carrier 58MCA, Mitsubishi MSZ-GL12NA"
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                  />
                  {modelSearch$.data?.models && modelSearch$.data.models.length > 0 && (
                    <div className="mt-2 border rounded-md divide-y">
                      {modelSearch$.data.models.map((model) => (
                        <button
                          key={model.id}
                          type="button"
                          className="w-full px-4 py-2 text-left hover:bg-muted transition-colors"
                          onClick={() => {
                            setSelectedModelId(model.id);
                            setModelSearch(`${model.brand} ${model.modelNumber}`);
                          }}
                        >
                          <div className="font-medium">{model.brand} {model.modelNumber}</div>
                          <div className="text-sm text-muted-foreground">{model.equipmentType}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Issue Description</CardTitle>
                <CardDescription>
                  Describe what's happening with your HVAC system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="symptom">Symptoms *</Label>
                  <Textarea
                    id="symptom"
                    placeholder="e.g., Furnace won't turn on, making clicking sounds. Thermostat shows power but no heat."
                    value={symptom}
                    onChange={(e) => setSymptom(e.target.value)}
                    rows={5}
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Be as specific as possible: sounds, error codes, when it happens, etc.
                  </p>
                </div>

                <div>
                  <Label htmlFor="error-codes">Error Codes (Optional)</Label>
                  <Input
                    id="error-codes"
                    placeholder="e.g., E3, F02 (comma-separated)"
                    value={errorCodes}
                    onChange={(e) => setErrorCodes(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-4">
              <Button
                type="submit"
                size="lg"
                disabled={startDiagnostic.isPending || !symptom.trim()}
                className="gap-2"
              >
                {startDiagnostic.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5" />
                    Start Diagnosis
                  </>
                )}
              </Button>
              <Link href="/">
                <Button type="button" variant="outline" size="lg">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Safety First
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Always turn off power before working on electrical components</li>
              <li>• Never work on gas lines without proper training</li>
              <li>• Refrigerant work requires EPA certification</li>
              <li>• When in doubt, call a licensed HVAC professional</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

