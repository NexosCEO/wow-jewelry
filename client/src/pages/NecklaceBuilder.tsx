import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { NecklaceTemplate, Charm } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Plus, Minus, ShoppingCart, ArrowRight, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

type BuilderStep = "select-string" | "add-charms" | "review";

interface SelectedCharm {
  charm: Charm;
  quantity: number;
}

interface NecklaceBuilderProps {
  onAddToCart: (customNecklace: any) => void;
}

export default function NecklaceBuilder({ onAddToCart }: NecklaceBuilderProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<BuilderStep>("select-string");
  const [selectedTemplate, setSelectedTemplate] = useState<NecklaceTemplate | null>(null);
  const [selectedCharms, setSelectedCharms] = useState<SelectedCharm[]>([]);

  const { data: templates = [], isLoading: loadingTemplates } = useQuery<NecklaceTemplate[]>({
    queryKey: ["/api/necklace-templates"],
  });

  const { data: charms = [], isLoading: loadingCharms } = useQuery<Charm[]>({
    queryKey: ["/api/charms"],
  });

  const totalCharmSlots = selectedTemplate?.maxSlots || 0;
  const usedSlots = selectedCharms.reduce((sum, sc) => sum + sc.quantity, 0);
  const remainingSlots = totalCharmSlots - usedSlots;

  const calculateTotalPrice = () => {
    if (!selectedTemplate) return 0;
    const basePrice = parseFloat(selectedTemplate.basePrice);
    const charmsPrice = selectedCharms.reduce(
      (sum, sc) => sum + parseFloat(sc.charm.price) * sc.quantity,
      0
    );
    return basePrice + charmsPrice;
  };

  const handleTemplateSelect = (template: NecklaceTemplate) => {
    setSelectedTemplate(template);
    setCurrentStep("add-charms");
  };

  const handleAddCharm = (charm: Charm) => {
    if (remainingSlots <= 0) {
      toast({
        title: "Maximum Slots Reached",
        description: `This necklace can only hold ${totalCharmSlots} charms.`,
        variant: "destructive",
      });
      return;
    }

    setSelectedCharms((prev) => {
      const existing = prev.find((sc) => sc.charm.id === charm.id);
      if (existing) {
        return prev.map((sc) =>
          sc.charm.id === charm.id ? { ...sc, quantity: sc.quantity + 1 } : sc
        );
      }
      return [...prev, { charm, quantity: 1 }];
    });
  };

  const handleRemoveCharm = (charmId: string) => {
    setSelectedCharms((prev) => {
      const existing = prev.find((sc) => sc.charm.id === charmId);
      if (!existing) return prev;
      
      if (existing.quantity === 1) {
        return prev.filter((sc) => sc.charm.id !== charmId);
      }
      
      return prev.map((sc) =>
        sc.charm.id === charmId ? { ...sc, quantity: sc.quantity - 1 } : sc
      );
    });
  };

  const handleContinueToReview = () => {
    if (selectedCharms.length === 0) {
      toast({
        title: "Add Some Charms",
        description: "Please add at least one charm to your necklace.",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep("review");
  };

  const handleAddToCart = () => {
    if (!selectedTemplate) return;

    const customNecklace = {
      type: "custom-necklace",
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      charmNames: selectedCharms.map((sc) => `${sc.charm.name} (${sc.quantity})`),
      price: calculateTotalPrice().toFixed(2),
      quantity: 1,
    };

    onAddToCart(customNecklace);
    
    toast({
      title: "Added to Cart",
      description: "Your custom necklace has been added to cart!",
    });

    setLocation("/");
  };

  if (loadingTemplates || loadingCharms) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-muted-foreground">Loading builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4" data-testid="text-necklace-builder-title">
          Build Your Own Necklace
        </h1>
        <p className="text-muted-foreground text-lg">
          Create a unique piece just for you
        </p>
      </div>

      <div className="flex justify-center mb-12">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 ${currentStep === "select-string" ? "text-primary font-semibold" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === "select-string" ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
              1
            </div>
            <span className="hidden sm:inline">Choose String</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <div className={`flex items-center gap-2 ${currentStep === "add-charms" ? "text-primary font-semibold" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === "add-charms" ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
              2
            </div>
            <span className="hidden sm:inline">Add Charms</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <div className={`flex items-center gap-2 ${currentStep === "review" ? "text-primary font-semibold" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === "review" ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
              3
            </div>
            <span className="hidden sm:inline">Review</span>
          </div>
        </div>
      </div>

      {currentStep === "select-string" && (
        <div>
          <h2 className="text-2xl font-serif font-bold mb-6 text-center">Select Your Necklace String Color</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card 
                key={template.id} 
                className="hover-elevate cursor-pointer group overflow-hidden"
                onClick={() => handleTemplateSelect(template)}
                data-testid={`card-necklace-template-${template.id}`}
              >
                <CardHeader className="relative">
                  <div className="aspect-square overflow-hidden rounded-lg mb-4">
                    <img
                      src={template.imageUrl}
                      alt={template.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      data-testid={`img-template-${template.id}`}
                    />
                  </div>
                  <CardTitle className="flex items-center justify-between">
                    <span className="font-serif">{template.name}</span>
                    {selectedTemplate?.id === template.id && (
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-semibold">${parseFloat(template.basePrice).toFixed(2)}</p>
                    <Badge variant="secondary">+ {template.maxSlots} charm slots</Badge>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-gradient-to-r from-rose-gold via-gold-primary to-gold-secondary text-charcoal-dark font-semibold hover-elevate active-elevate-2"
                    onClick={() => handleTemplateSelect(template)}
                    data-testid={`button-select-template-${template.id}`}
                  >
                    Select This String
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {currentStep === "add-charms" && selectedTemplate && (
        <div>
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => {
                setCurrentStep("select-string");
                setSelectedCharms([]);
              }}
              className="mb-4"
              data-testid="button-back-to-strings"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Change String
            </Button>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="font-serif">Selected String: {selectedTemplate.name}</CardTitle>
                <CardDescription>Base Price: ${parseFloat(selectedTemplate.basePrice).toFixed(2)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Charm Slots Used</span>
                      <span className="font-semibold">{usedSlots} / {totalCharmSlots}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-rose-gold to-gold-primary transition-all duration-300"
                        style={{ width: `${(usedSlots / totalCharmSlots) * 100}%` }}
                      />
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {remainingSlots} slots left
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-serif font-bold mb-6 text-center">Add Charms to Your Necklace</h2>
          
          {selectedCharms.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="font-serif">Selected Charms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedCharms.map((sc) => (
                    <div key={sc.charm.id} className="flex items-center justify-between p-4 rounded-lg bg-muted">
                      <div className="flex items-center gap-4">
                        <img
                          src={sc.charm.imageUrl}
                          alt={sc.charm.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <div>
                          <p className="font-semibold">{sc.charm.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ${parseFloat(sc.charm.price).toFixed(2)} each
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleRemoveCharm(sc.charm.id)}
                          data-testid={`button-remove-charm-${sc.charm.id}`}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{sc.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleAddCharm(sc.charm)}
                          disabled={remainingSlots === 0}
                          data-testid={`button-add-more-charm-${sc.charm.id}`}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <p className="ml-4 font-semibold w-20 text-right">
                          ${(parseFloat(sc.charm.price) * sc.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Total</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-rose-gold to-gold-primary bg-clip-text text-transparent">
                      ${calculateTotalPrice().toFixed(2)}
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-rose-gold via-gold-primary to-gold-secondary text-charcoal-dark font-semibold hover-elevate active-elevate-2 px-8"
                    onClick={handleContinueToReview}
                    data-testid="button-continue-to-review"
                  >
                    Continue to Review
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {charms.filter(c => c.inStock).map((charm) => {
              const selectedCharm = selectedCharms.find((sc) => sc.charm.id === charm.id);
              return (
                <Card 
                  key={charm.id} 
                  className="hover-elevate group overflow-hidden"
                  data-testid={`card-charm-${charm.id}`}
                >
                  <CardHeader className="relative">
                    <div className="aspect-square overflow-hidden rounded-lg mb-4">
                      <img
                        src={charm.imageUrl}
                        alt={charm.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        data-testid={`img-charm-${charm.id}`}
                      />
                    </div>
                    {selectedCharm && (
                      <div className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                        {selectedCharm.quantity}
                      </div>
                    )}
                    <CardTitle className="font-serif">{charm.name}</CardTitle>
                    <CardDescription>{charm.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xl font-semibold">${parseFloat(charm.price).toFixed(2)}</p>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-rose-gold via-gold-primary to-gold-secondary text-charcoal-dark font-semibold hover-elevate active-elevate-2"
                      onClick={() => handleAddCharm(charm)}
                      disabled={remainingSlots === 0}
                      data-testid={`button-add-charm-${charm.id}`}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Necklace
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {currentStep === "review" && selectedTemplate && (
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setCurrentStep("add-charms")}
            className="mb-6"
            data-testid="button-back-to-charms"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Edit Charms
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Review Your Custom Necklace</CardTitle>
              <CardDescription>Double-check your selection before adding to cart</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Necklace String</h3>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                  <img
                    src={selectedTemplate.imageUrl}
                    alt={selectedTemplate.name}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{selectedTemplate.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                  </div>
                  <p className="font-semibold">${parseFloat(selectedTemplate.basePrice).toFixed(2)}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Charms ({selectedCharms.length})</h3>
                <div className="space-y-3">
                  {selectedCharms.map((sc) => (
                    <div key={sc.charm.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                      <img
                        src={sc.charm.imageUrl}
                        alt={sc.charm.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{sc.charm.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ${parseFloat(sc.charm.price).toFixed(2)} × {sc.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">
                        ${(parseFloat(sc.charm.price) * sc.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between text-2xl font-bold">
                  <span>Total Price</span>
                  <span className="bg-gradient-to-r from-rose-gold to-gold-primary bg-clip-text text-transparent">
                    ${calculateTotalPrice().toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-rose-gold via-gold-primary to-gold-secondary text-charcoal-dark font-semibold hover-elevate active-elevate-2"
                onClick={handleAddToCart}
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
