import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, FileText, AlertTriangle, CheckCircle, Wrench } from "lucide-react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function DiagnosticResults() {
  const { isAuthenticated } = useAuth();
  const params = useParams();
  const sessionId = params.id ? parseInt(params.id) : 0;

  const session$ = trpc.diagnostics.getSession.useQuery(
    { sessionId },
    { enabled: sessionId > 0 && isAuthenticated }
  );

  const generateReport = trpc.diagnostics.generateReport.useMutation({
    onSuccess: (data) => {
      // Create a blob and download
      const blob = new Blob([data.report], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hvac-diagnostic-${sessionId}.md`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Report downloaded!");
    },
    onError: (error) => {
      toast.error("Failed to generate report: " + error.message);
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to view diagnostic results
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

  if (session$.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading diagnostic results...</p>
        </div>
      </div>
    );
  }

  if (!session$.data?.session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Session Not Found</CardTitle>
            <CardDescription>
              The diagnostic session could not be found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/diagnose">
              <Button className="w-full">Start New Diagnosis</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { session, steps } = session$.data;
  const causes = session.resultRankedCauses as any[] || [];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "DIY":
        return "difficulty-diy";
      case "PRO":
        return "difficulty-pro";
      case "PARTS":
        return "difficulty-parts";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => generateReport.mutate({ sessionId })}
            disabled={generateReport.isPending}
          >
            {generateReport.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            Download Report
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Session Info */}
          <Card>
            <CardHeader>
              <CardTitle>Diagnostic Session</CardTitle>
              <CardDescription>
                Started: {session.startedAt ? new Date(session.startedAt).toLocaleString() : "N/A"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <h3 className="font-semibold mb-2">Reported Issue:</h3>
                <p className="text-muted-foreground">{session.symptom}</p>
              </div>
              {session.errorCodesInput && session.errorCodesInput.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Error Codes:</h3>
                  <div className="flex gap-2">
                    {session.errorCodesInput.map((code: string, idx: number) => (
                      <Badge key={idx} variant="outline">{code}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ranked Causes */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Possible Causes</h2>
            <div className="space-y-4">
              {causes.map((cause, idx) => (
                <Card key={idx} className="diagnostic-card">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl font-bold text-primary">#{idx + 1}</span>
                          <Badge className={getDifficultyColor(cause.difficulty)}>
                            {cause.difficulty}
                          </Badge>
                          <Badge variant="outline">
                            {Math.round(cause.probability * 100)}% likely
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">{cause.cause}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cause.notes && (
                      <p className="text-muted-foreground">{cause.notes}</p>
                    )}
                    
                    {cause.parts && cause.parts.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Wrench className="h-4 w-4" />
                          Required Parts:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {cause.parts.map((part: string, partIdx: number) => (
                            <Badge key={partIdx} variant="secondary">{part}</Badge>
                          ))}
                        </div>
                        <Link href="/parts">
                          <Button variant="link" className="mt-2 px-0">
                            Find parts nearby →
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Diagnostic Steps */}
          {steps && steps.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Troubleshooting Steps</h2>
              <div className="space-y-4">
                {steps.map((step, idx) => (
                  <Card key={step.id}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-semibold text-primary">{idx + 1}</span>
                        </div>
                        <CardTitle className="text-lg">Step {idx + 1}</CardTitle>
                        {step.outcome && (
                          <Badge variant={step.outcome === "pass" ? "default" : "secondary"}>
                            {step.outcome}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="prose prose-sm max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: step.instructionMd }} />
                      </div>
                      
                      {step.requiredTools && step.requiredTools.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Wrench className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Tools: {(step.requiredTools as string[]).join(", ")}
                          </span>
                        </div>
                      )}

                      {step.expectedReadings && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Expected: {JSON.stringify(step.expectedReadings)}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Safety Warning */}
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
                <AlertTriangle className="h-5 w-5" />
                Safety Reminder
              </CardTitle>
            </CardHeader>
            <CardContent className="text-orange-800 dark:text-orange-200">
              <ul className="space-y-1 text-sm">
                <li>• Always turn off power before working on electrical components</li>
                <li>• Never work on gas lines without proper training and certification</li>
                <li>• Refrigerant work requires EPA 608 certification</li>
                <li>• If you're unsure about any step, contact a licensed HVAC professional</li>
              </ul>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Link href="/diagnose">
              <Button variant="outline">Start New Diagnosis</Button>
            </Link>
            <Link href="/diagnostics">
              <Button variant="outline">View All Sessions</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

