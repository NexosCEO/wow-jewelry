import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { BraceletTemplate, Charm, BraceletBead } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, X, Sparkles } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { SiInstagram, SiTiktok } from "react-icons/si";

const MAX_BEADS = 4;
const MAX_CHARMS = 3;

interface BraceletBuilderProps {
  onAddToCart: (customBracelet: any) => void;
}

export default function BraceletBuilder({ onAddToCart }: BraceletBuilderProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [selectedTemplate, setSelectedTemplate] = useState<BraceletTemplate | null>(null);
  const [selectedBeads, setSelectedBeads] = useState<BraceletBead[]>([]);
  const [selectedCharms, setSelectedCharms] = useState<Charm[]>([]);

  const { data: templates = [], isLoading: loadingTemplates } = useQuery<BraceletTemplate[]>({
    queryKey: ["/api/bracelet-templates"],
  });

  const { data: charms = [], isLoading: loadingCharms } = useQuery<Charm[]>({
    queryKey: ["/api/charms"],
  });

  const { data: beads = [], isLoading: loadingBeads } = useQuery<BraceletBead[]>({
    queryKey: ["/api/bracelet-beads"],
  });

  const totalSlots = selectedTemplate?.maxSlots || (MAX_BEADS + MAX_CHARMS);
  const usedSlots = selectedBeads.length + selectedCharms.length;
  const remainingSlots = totalSlots - usedSlots;
  const canAddMore = remainingSlots > 0;

  const calculateTotalPrice = () => {
    let total = 0;
    if (selectedTemplate) {
      total += parseFloat(selectedTemplate.basePrice);
    }
    selectedBeads.forEach(bead => {
      total += parseFloat(bead.price);
    });
    selectedCharms.forEach(charm => {
      total += parseFloat(charm.price);
    });
    return total;
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setSelectedBeads([]);
      setSelectedCharms([]);
    }
  };

  const handleAddBead = (beadId: string) => {
    if (selectedBeads.length >= MAX_BEADS) {
      toast({
        title: "Maximum Beads Reached",
        description: `You can only add up to ${MAX_BEADS} beads per bracelet.`,
        variant: "destructive",
      });
      return;
    }
    if (!canAddMore) {
      toast({
        title: "Maximum Slots Reached",
        description: `This bracelet can only hold ${totalSlots} items total.`,
        variant: "destructive",
      });
      return;
    }
    const bead = beads.find(b => b.id === beadId);
    if (bead) {
      setSelectedBeads([...selectedBeads, bead]);
    }
  };

  const handleRemoveBead = (index: number) => {
    setSelectedBeads(selectedBeads.filter((_, i) => i !== index));
  };

  const handleAddCharm = (charmId: string) => {
    if (selectedCharms.length >= MAX_CHARMS) {
      toast({
        title: "Maximum Charms Reached",
        description: `You can only add up to ${MAX_CHARMS} charms per bracelet.`,
        variant: "destructive",
      });
      return;
    }
    if (!canAddMore) {
      toast({
        title: "Maximum Slots Reached",
        description: `This bracelet can only hold ${totalSlots} items total.`,
        variant: "destructive",
      });
      return;
    }
    const charm = charms.find(c => c.id === charmId);
    if (charm) {
      setSelectedCharms([...selectedCharms, charm]);
    }
  };

  const handleRemoveCharm = (index: number) => {
    setSelectedCharms(selectedCharms.filter((_, i) => i !== index));
  };

  const handleAddToCart = () => {
    if (!selectedTemplate) {
      toast({
        title: "Select a Bracelet",
        description: "Please select a bracelet base first.",
        variant: "destructive",
      });
      return;
    }

    const beadCounts: Record<string, number> = {};
    selectedBeads.forEach(bead => {
      beadCounts[bead.name] = (beadCounts[bead.name] || 0) + 1;
    });

    const charmCounts: Record<string, number> = {};
    selectedCharms.forEach(charm => {
      charmCounts[charm.name] = (charmCounts[charm.name] || 0) + 1;
    });

    const customBracelet = {
      configId: `custom-bracelet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "custom-bracelet",
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      charmNames: Object.entries(charmCounts).map(([name, count]) => count > 1 ? `${name} (${count})` : name),
      beadNames: Object.entries(beadCounts).map(([name, count]) => count > 1 ? `${name} (${count})` : name),
      price: calculateTotalPrice().toFixed(2),
      quantity: 1,
    };

    onAddToCart(customBracelet);
    
    toast({
      title: "Added to Cart!",
      description: "Your custom bracelet has been added to cart.",
    });

    setLocation("/");
  };

  const handleReset = () => {
    setSelectedTemplate(null);
    setSelectedBeads([]);
    setSelectedCharms([]);
  };

  if (loadingTemplates || loadingCharms || loadingBeads) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-muted-foreground">Loading builder...</p>
        </div>
      </div>
    );
  }

  const availableBeads = beads.filter(b => b.inStock);
  const availableCharms = charms.filter(c => c.inStock);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4" data-testid="text-builder-title">
            Build Your Own Bracelet
          </h1>
          <p className="text-muted-foreground text-lg">
            Create a unique piece just for you in 3 simple steps
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 font-serif text-2xl">
              <Sparkles className="w-6 h-6 text-primary" />
              Customize Your Bracelet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            
            {/* Step 1: Choose Bracelet Base */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h3 className="font-semibold text-lg">Choose Your Bracelet</h3>
              </div>
              <Select onValueChange={handleTemplateSelect} value={selectedTemplate?.id || ""}>
                <SelectTrigger className="w-full" data-testid="select-bracelet-base">
                  <SelectValue placeholder="Select a bracelet style..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id} data-testid={`option-template-${template.id}`}>
                      <div className="flex justify-between items-center w-full gap-4">
                        <span>{template.name} - {template.description}</span>
                        <span className="font-semibold text-primary">${parseFloat(template.basePrice).toFixed(2)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTemplate && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Selected</Badge>
                    <span className="font-medium">{selectedTemplate.name}</span>
                    <span className="text-muted-foreground">- ${parseFloat(selectedTemplate.basePrice).toFixed(2)}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {usedSlots}/{totalSlots} slots used
                  </Badge>
                </div>
              )}
            </div>

            {/* Step 2: Add Beads */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h3 className="font-semibold text-lg">Add Beads (Max {MAX_BEADS})</h3>
                <Badge variant="outline" className="ml-auto">{selectedBeads.length}/{MAX_BEADS}</Badge>
              </div>
              <Select 
                onValueChange={handleAddBead} 
                value=""
                disabled={!selectedTemplate || selectedBeads.length >= MAX_BEADS || !canAddMore}
              >
                <SelectTrigger className="w-full" data-testid="select-bead">
                  <SelectValue placeholder={!selectedTemplate ? "Select a bracelet first" : selectedBeads.length >= MAX_BEADS ? "Maximum beads reached" : !canAddMore ? "Bracelet is full" : "Add a bead..."} />
                </SelectTrigger>
                <SelectContent>
                  {availableBeads.map((bead) => (
                    <SelectItem key={bead.id} value={bead.id} data-testid={`option-bead-${bead.id}`}>
                      <div className="flex justify-between items-center w-full gap-4">
                        <span>{bead.name} ({bead.color})</span>
                        <span className="font-semibold text-primary">${parseFloat(bead.price).toFixed(2)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedBeads.length > 0 && (
                <div className="space-y-2">
                  {selectedBeads.map((bead, index) => (
                    <div key={`${bead.id}-${index}`} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{index + 1}</Badge>
                        <span>{bead.name}</span>
                        <span className="text-muted-foreground text-sm">({bead.color})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">${parseFloat(bead.price).toFixed(2)}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRemoveBead(index)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          data-testid={`button-remove-bead-${index}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step 3: Add Charms */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h3 className="font-semibold text-lg">Add Charms (Max {MAX_CHARMS})</h3>
                <Badge variant="outline" className="ml-auto">{selectedCharms.length}/{MAX_CHARMS}</Badge>
              </div>
              <Select 
                onValueChange={handleAddCharm} 
                value=""
                disabled={!selectedTemplate || selectedCharms.length >= MAX_CHARMS || !canAddMore}
              >
                <SelectTrigger className="w-full" data-testid="select-charm">
                  <SelectValue placeholder={!selectedTemplate ? "Select a bracelet first" : selectedCharms.length >= MAX_CHARMS ? "Maximum charms reached" : !canAddMore ? "Bracelet is full" : "Add a charm..."} />
                </SelectTrigger>
                <SelectContent>
                  {availableCharms.map((charm) => (
                    <SelectItem key={charm.id} value={charm.id} data-testid={`option-charm-${charm.id}`}>
                      <div className="flex justify-between items-center w-full gap-4">
                        <span>{charm.name}</span>
                        <span className="font-semibold text-primary">${parseFloat(charm.price).toFixed(2)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCharms.length > 0 && (
                <div className="space-y-2">
                  {selectedCharms.map((charm, index) => (
                    <div key={`${charm.id}-${index}`} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{index + 1}</Badge>
                        <span>{charm.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">${parseFloat(charm.price).toFixed(2)}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRemoveCharm(index)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          data-testid={`button-remove-charm-${index}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="font-serif text-xl">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedTemplate && (
              <div className="flex justify-between">
                <span>Bracelet Base: {selectedTemplate.name}</span>
                <span className="font-medium">${parseFloat(selectedTemplate.basePrice).toFixed(2)}</span>
              </div>
            )}
            
            {selectedBeads.length > 0 && (
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Beads:</p>
                {selectedBeads.map((bead, index) => (
                  <div key={`summary-bead-${index}`} className="flex justify-between pl-4">
                    <span className="text-sm">{bead.name}</span>
                    <span className="text-sm">${parseFloat(bead.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {selectedCharms.length > 0 && (
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Charms:</p>
                {selectedCharms.map((charm, index) => (
                  <div key={`summary-charm-${index}`} className="flex justify-between pl-4">
                    <span className="text-sm">{charm.name}</span>
                    <span className="text-sm">${parseFloat(charm.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">Total:</span>
                <span className="text-2xl font-bold text-primary" data-testid="text-total-price">
                  ${calculateTotalPrice().toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="flex-1"
                data-testid="button-reset"
              >
                Start Over
              </Button>
              <Button 
                onClick={handleAddToCart}
                disabled={!selectedTemplate}
                className="flex-1 bg-gradient-to-r from-rose-gold via-gold-primary to-gold-secondary text-charcoal-dark font-semibold"
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/">
            <Button variant="link" className="text-muted-foreground" data-testid="link-back-to-shop">
              ← Back to Shop
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer with Social Media */}
      <footer className="bg-charcoal-dark text-white py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <h3 className="font-serif text-2xl mb-2">WOW by Dany</h3>
              <p className="text-gray-400">Handcrafted with love</p>
            </div>
            
            <div className="flex items-center gap-6">
              <a 
                href="https://www.instagram.com/wowbydany?igsh=MXFnbmlxc3N4YXd5NA==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                data-testid="link-instagram"
              >
                <SiInstagram className="w-6 h-6" />
                <span>Instagram</span>
              </a>
              <a 
                href="https://www.tiktok.com/@wowbydany?_t=ZT-8wqUKGzMzky&_r=1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                data-testid="link-tiktok"
              >
                <SiTiktok className="w-6 h-6" />
                <span>TikTok</span>
              </a>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>© 2024 WOW by Dany. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
