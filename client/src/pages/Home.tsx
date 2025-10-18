import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { Wrench, Search, ShoppingCart, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/diagnostics">
                  <Button variant="ghost">My Diagnostics</Button>
                </Link>
                <Link href="/parts">
                  <Button variant="ghost">Parts Locator</Button>
                </Link>
                <span className="text-sm text-muted-foreground">
                  {user?.name || user?.email}
                </span>
              </>
            ) : (
              <Button asChild>
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              AI-Powered HVAC Troubleshooting
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Get instant, equipment-specific diagnostic guidance for furnaces, A/C units, heat pumps, mini-splits, and more.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/diagnose">
                <Button size="lg" className="gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Start Diagnosis
                </Button>
              </Link>
              <Link href="/parts">
                <Button size="lg" variant="outline" className="gap-2">
                  <Search className="h-5 w-5" />
                  Find Parts
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 container">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>AI Diagnostics</CardTitle>
              <CardDescription>
                Describe your issue and get ranked causes with step-by-step troubleshooting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Model-specific solutions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Error code interpretation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Safety warnings included</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Parts Locator</CardTitle>
              <CardDescription>
                Find parts in stock at nearby supply houses with real-time pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Live inventory data</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Location-based search</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Price comparison</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Repair Reports</CardTitle>
              <CardDescription>
                Generate professional documentation for every diagnostic session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>PDF export</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Step-by-step documentation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Parts list included</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Supported Equipment */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h3 className="text-2xl font-bold text-center mb-8">Supported Equipment Types</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Furnaces",
              "Boilers",
              "Air Conditioners",
              "Heat Pumps",
              "Mini-Split Systems",
              "Geothermal Heat Pumps",
              "Tankless Water Heaters",
              "Humidifiers",
              "Dehumidifiers",
            ].map((type) => (
              <span key={type} className="equipment-badge">
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-lg mb-8 opacity-90">
              Sign in to access AI diagnostics, parts locator, and save your troubleshooting history
            </p>
            <Button size="lg" variant="secondary" asChild>
              <a href={getLoginUrl()}>Sign In Now</a>
            </Button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t py-8 mt-auto">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2025 {APP_TITLE}. All rights reserved.</p>
          <p className="mt-2">For HVAC professionals and homeowners</p>
        </div>
      </footer>
    </div>
  );
}

