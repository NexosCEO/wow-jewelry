import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { BraceletTemplate, Charm } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Plus, Minus, ShoppingCart, ArrowRight, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

type BuilderStep = "select-base" | "add-charms" | "review";

interface SelectedCharm {
  charm: Charm;
  quantity: number;
}

interface BraceletBuilderProps {
  onAddToCart: (customBracelet: any) => void;
}

export default function BraceletBuilder({ onAddToCart }: BraceletBuilderProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<BuilderStep>("select-base");
  const [selectedTemplate, setSelectedTemplate] = useState<BraceletTemplate | null>(null);
  const [selectedCharms, setSelectedCharms] = useState<SelectedCharm[]>([]);

  const { data: templates = [], isLoading: loadingTemplates } = useQuery<BraceletTemplate[]>({
    queryKey: ["/api/bracelet-templates"],
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

  const handleTemplateSelect = (template: BraceletTemplate) => {
    setSelectedTemplate(template);
    setCurrentStep("add-charms");
  };

  const handleAddCharm = (charm: Charm) => {
    if (remainingSlots <= 0) {
      toast({
        title: "Maximum Slots Reached",
        description: `This bracelet can only hold ${totalCharmSlots} charms.`,
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
        description: "Please add at least one charm to your bracelet.",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep("review");
  };

  const handleAddToCart = () => {
    if (!selectedTemplate) return;

    const customBracelet = {
      type: "custom-bracelet",
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      charmNames: selectedCharms.map((sc) => `${sc.charm.name} (${sc.quantity})`),
      price: calculateTotalPrice().toFixed(2),
      quantity: 1,
    };

    onAddToCart(customBracelet);
    
    toast({
      title: "Added to Cart",
      description: "Your custom bracelet has been added to cart!",
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
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4" data-testid="text-builder-title">
          Build Your Own Bracelet
        </h1>
        <p className="text-muted-foreground text-lg">
          Create a unique piece just for you
        </p>
      </div>

      <div className="flex justify-center mb-12">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 ${currentStep === "select-base" ? "text-primary font-semibold" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === "select-base" ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
              1
            </div>
            <span className="hidden sm:inline">Choose Base</span>
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

      {currentStep === "select-base" && (
        <div>
          <h2 className="text-2xl font-serif font-bold mb-6 text-center">Select Your Base Bracelet</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card 
                key={template.id} 
                className="hover-elevate cursor-pointer" 
                onClick={() => handleTemplateSelect(template)}
                data-testid={`card-template-${template.id}`}
              >
                <CardHeader>
                  <img
                    src={template.imageUrl}
                    alt={template.name}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                  <CardTitle className="font-serif">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">${template.basePrice}</span>
                    <Badge variant="secondary">Up to {template.maxSlots} charms</Badge>
                  </div>
                  <Button className="w-full" data-testid={`button-select-template-${template.id}`}>
                    Select Base
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {currentStep === "add-charms" && selectedTemplate && (
        <div>
          <div className="mb-8 bg-card border border-border rounded-xl p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              <div className="flex gap-4 items-center">
                <img
                  src={selectedTemplate.imageUrl}
                  alt={selectedTemplate.name}
                  className="w-24 h-24 object-cover rounded-md"
                />
                <div>
                  <h3 className="font-serif text-xl font-bold">{selectedTemplate.name}</h3>
                  <p className="text-sm text-muted-foreground">${selectedTemplate.basePrice} base price</p>
                  <div className="mt-2">
                    <Badge variant={remainingSlots > 0 ? "default" : "destructive"}>
                      {usedSlots} / {totalCharmSlots} slots used
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentStep("select-base");
                  setSelectedCharms([]);
                }}
                data-testid="button-change-base"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Change Base
              </Button>
            </div>
          </div>

          <h2 className="text-2xl font-serif font-bold mb-6 text-center">Add Your Charms</h2>
          
          {selectedCharms.length > 0 && (
            <div className="mb-8 bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-4">Selected Charms</h3>
              <div className="space-y-3">
                {selectedCharms.map((sc) => (
                  <div key={sc.charm.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={sc.charm.imageUrl}
                        alt={sc.charm.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{sc.charm.name}</p>
                        <p className="text-sm text-muted-foreground">${sc.charm.price} each</p>
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
                        data-testid={`button-add-charm-${sc.charm.id}`}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-border flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Current Total</p>
                  <p className="text-3xl font-bold">${calculateTotalPrice().toFixed(2)}</p>
                </div>
                <Button onClick={handleContinueToReview} size="lg" data-testid="button-continue-review">
                  Continue to Review
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {charms.map((charm) => {
              const selected = selectedCharms.find((sc) => sc.charm.id === charm.id);
              return (
                <Card 
                  key={charm.id} 
                  className={`hover-elevate ${selected ? "border-primary" : ""}`}
                  data-testid={`card-charm-${charm.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="relative">
                      <img
                        src={charm.imageUrl}
                        alt={charm.name}
                        className="w-full h-32 object-cover rounded-md"
                      />
                      {selected && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-sm mt-2">{charm.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold">${charm.price}</span>
                      <Badge variant="outline" className="text-xs">{charm.category}</Badge>
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleAddCharm(charm)}
                      disabled={remainingSlots === 0}
                      data-testid={`button-select-charm-${charm.id}`}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
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
          <h2 className="text-2xl font-serif font-bold mb-6 text-center">Review Your Design</h2>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-serif">Your Custom Bracelet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Base Bracelet</h3>
                <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-md">
                  <img
                    src={selectedTemplate.imageUrl}
                    alt={selectedTemplate.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{selectedTemplate.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                  </div>
                  <span className="font-bold">${selectedTemplate.basePrice}</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Selected Charms ({usedSlots})</h3>
                <div className="space-y-2">
                  {selectedCharms.map((sc) => (
                    <div key={sc.charm.id} className="flex items-center gap-3 bg-muted/30 p-3 rounded-md">
                      <img
                        src={sc.charm.imageUrl}
                        alt={sc.charm.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{sc.charm.name}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {sc.quantity}</p>
                      </div>
                      <span className="font-bold">${(parseFloat(sc.charm.price) * sc.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Base Bracelet</span>
                  <span>${selectedTemplate.basePrice}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Charms ({usedSlots})</span>
                  <span>
                    ${selectedCharms.reduce((sum, sc) => sum + parseFloat(sc.charm.price) * sc.quantity, 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-2xl font-bold pt-4 border-t border-border">
                  <span>Total</span>
                  <span data-testid="text-total-price">${calculateTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setCurrentStep("add-charms")}
              data-testid="button-back-charms"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Charms
            </Button>
            <Button
              className="flex-1"
              onClick={handleAddToCart}
              data-testid="button-add-to-cart"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
