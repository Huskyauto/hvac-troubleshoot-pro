import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, Search, MapPin, DollarSign, Package } from "lucide-react";
import { Link } from "wouter";

export default function PartsLocator() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const partsSearch$ = trpc.parts.search.useQuery(
    { query: activeSearch },
    { enabled: activeSearch.length > 2 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery);
  };

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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">HVAC Parts Locator</h1>
            <p className="text-muted-foreground">
              Search for HVAC parts and find them in stock at nearby supply houses
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Search Parts</CardTitle>
              <CardDescription>
                Enter part number, description, or equipment model
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="e.g., CAP-35/5uF, Honeywell thermostat, compressor"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={searchQuery.length < 3} className="gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Search Results */}
          {partsSearch$.isLoading && (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Searching parts...</p>
            </div>
          )}

          {partsSearch$.data?.parts && partsSearch$.data.parts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                Found {partsSearch$.data.parts.length} parts
              </h2>
              {partsSearch$.data.parts.map((part) => (
                <Card key={part.id} className="diagnostic-card">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{part.description}</CardTitle>
                        <CardDescription className="mt-1">
                          {part.mfr} • Part #{part.oemPartNo}
                        </CardDescription>
                      </div>
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {part.equipmentTypes && part.equipmentTypes.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {part.equipmentTypes.map((type: string, idx: number) => (
                          <Badge key={idx} variant="secondary">{type}</Badge>
                        ))}
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Availability
                      </h4>
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <p className="text-sm text-muted-foreground">
                          Sign in to view real-time inventory and pricing from nearby supply houses
                        </p>
                        <Button variant="link" className="mt-2">
                          View Inventory →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {partsSearch$.data?.parts && partsSearch$.data.parts.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No parts found</h3>
                <p className="text-muted-foreground">
                  Try a different search term or part number
                </p>
              </CardContent>
            </Card>
          )}

          {!activeSearch && (
            <div className="space-y-6">
              {/* Popular Searches */}
              <Card>
                <CardHeader>
                  <CardTitle>Popular Parts</CardTitle>
                  <CardDescription>
                    Commonly searched HVAC parts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Capacitor",
                      "Thermostat",
                      "Contactor",
                      "Blower Motor",
                      "Ignitor",
                      "Pressure Switch",
                      "Flame Sensor",
                      "Transformer",
                    ].map((term) => (
                      <Button
                        key={term}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchQuery(term);
                          setActiveSearch(term);
                        }}
                      >
                        {term}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <MapPin className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-base">Location-Based</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Find parts at supply houses near you with distance and driving time
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <DollarSign className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-base">Price Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Compare prices across multiple distributors to get the best deal
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Package className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-base">Real-Time Stock</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Live inventory updates so you know what's available right now
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

