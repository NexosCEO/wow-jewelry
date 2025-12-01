import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { BraceletTemplate, Charm, BraceletBead } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Plus, Minus, ShoppingCart, ArrowRight, ArrowLeft } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { SiInstagram, SiTiktok } from "react-icons/si";

type BuilderStep = "select-string" | "add-charms" | "review";

type BeadSize = string; // Sizes now come from database

interface SelectedCharm {
  charm: Charm;
  quantity: number;
}

interface SelectedBead {
  bead: BraceletBead;
  quantity: number;
  size?: BeadSize;
}

interface BraceletBuilderProps {
  onAddToCart: (customBracelet: any) => void;
}

export default function BraceletBuilder({ onAddToCart }: BraceletBuilderProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<BuilderStep>("select-string");
  const [selectedTemplate, setSelectedTemplate] = useState<BraceletTemplate | null>(null);
  const [selectedCharms, setSelectedCharms] = useState<SelectedCharm[]>([]);
  const [selectedBeads, setSelectedBeads] = useState<SelectedBead[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedBeadSizes, setSelectedBeadSizes] = useState<Record<string, string>>({}); // beadName -> selectedSize

  const { data: templates = [], isLoading: loadingTemplates } = useQuery<BraceletTemplate[]>({
    queryKey: ["/api/bracelet-templates"],
  });

  const { data: charms = [], isLoading: loadingCharms } = useQuery<Charm[]>({
    queryKey: ["/api/charms"],
  });

  const { data: beads = [], isLoading: loadingBeads } = useQuery<BraceletBead[]>({
    queryKey: ["/api/bracelet-beads"],
  });

  const availableCategories = ["All", "String", "Beaded"];
  
  // Filter templates to only show in-stock ones
  const availableTemplates = templates.filter(t => t.inStock);
  const filteredTemplates = selectedCategory === "All" 
    ? availableTemplates 
    : availableTemplates.filter(t => t.category === selectedCategory);
  
  // Filter charms to only show in-stock ones with inventory
  const availableCharms = charms.filter(c => c.inStock && c.stockQuantity > 0);

  const totalCharmSlots = selectedTemplate?.maxSlots || 0;
  const totalCharmsSelected = selectedCharms.reduce((sum, sc) => sum + sc.quantity, 0);
  const usedSlots = totalCharmsSelected + selectedBeads.reduce((sum, sb) => sum + sb.quantity, 0);
  const remainingSlots = totalCharmSlots - usedSlots;
  const isCharmLimitReached = totalCharmsSelected >= 3;

  // Group beads by name to handle sized variants
  // Filter out beads that are out of stock or have zero inventory
  const groupedBeads = beads.reduce((groups, bead) => {
    if (!bead.inStock || bead.stockQuantity <= 0) return groups;
    const key = `${bead.name}-${bead.color}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(bead);
    return groups;
  }, {} as Record<string, BraceletBead[]>);

  // Check if a bead group has size variants
  const hasSizeVariants = (beadGroup: BraceletBead[]) => beadGroup.some(b => b.size);

  // Get the bead entry for a specific size, or the default bead if no size
  const getBeadForSize = (beadGroup: BraceletBead[], size?: string): BraceletBead | undefined => {
    if (size) {
      return beadGroup.find(b => b.size === size);
    }
    return beadGroup.find(b => !b.size) || beadGroup[0];
  };

  // Get available sizes for a bead group, sorted
  const getAvailableSizes = (beadGroup: BraceletBead[]): string[] => {
    return beadGroup
      .filter(b => b.size)
      .map(b => b.size!)
      .sort((a, b) => {
        const sizeA = parseInt(a);
        const sizeB = parseInt(b);
        return sizeB - sizeA; // Sort descending (6mm, 5mm, 4mm)
      });
  };

  // Get default selected size for a bead group
  const getDefaultSize = (beadGroup: BraceletBead[]): string => {
    const sizes = getAvailableSizes(beadGroup);
    return sizes[0] || '';
  };

  const getBeadPrice = (sb: SelectedBead): number => {
    return parseFloat(sb.bead.price);
  };

  const calculateTotalPrice = () => {
    if (!selectedTemplate) return 0;
    const basePrice = parseFloat(selectedTemplate.basePrice);
    const charmsPrice = selectedCharms.reduce(
      (sum, sc) => sum + parseFloat(sc.charm.price) * sc.quantity,
      0
    );
    const beadsPrice = selectedBeads.reduce(
      (sum, sb) => sum + getBeadPrice(sb) * sb.quantity,
      0
    );
    return basePrice + charmsPrice + beadsPrice;
  };

  const handleTemplateSelect = (template: BraceletTemplate) => {
    setSelectedTemplate(template);
    setCurrentStep("add-charms");
  };

  const handleAddCharm = (charm: Charm) => {
    if (isCharmLimitReached) {
      toast({
        title: "Maximum Charms Reached",
        description: "You can only add up to 3 charms per bracelet.",
        variant: "destructive",
      });
      return;
    }

    if (remainingSlots <= 0) {
      toast({
        title: "Maximum Slots Reached",
        description: `This bracelet can only hold ${totalCharmSlots} items.`,
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

  const handleAddBead = (bead: BraceletBead) => {
    if (remainingSlots <= 0) {
      toast({
        title: "Maximum Slots Reached",
        description: `This bracelet can only hold ${totalCharmSlots} items total.`,
        variant: "destructive",
      });
      return;
    }

    setSelectedBeads((prev) => {
      // Match by bead id (each size is now a separate bead entry)
      const existing = prev.find((sb) => sb.bead.id === bead.id);
      if (existing) {
        return prev.map((sb) =>
          sb.bead.id === bead.id ? { ...sb, quantity: sb.quantity + 1 } : sb
        );
      }
      return [...prev, { bead, quantity: 1, size: bead.size || undefined }];
    });
  };

  const handleRemoveBead = (beadId: string) => {
    setSelectedBeads((prev) => {
      const existing = prev.find((sb) => sb.bead.id === beadId);
      if (!existing) return prev;
      
      if (existing.quantity === 1) {
        return prev.filter((sb) => sb.bead.id !== beadId);
      }
      
      return prev.map((sb) =>
        sb.bead.id === beadId ? { ...sb, quantity: sb.quantity - 1 } : sb
      );
    });
  };

  const handleContinueToReview = () => {
    if (selectedCharms.length === 0 && selectedBeads.length === 0) {
      toast({
        title: "Add Customizations",
        description: "Please add at least one charm or bead to your bracelet.",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep("review");
  };

  const handleAddToCart = () => {
    if (!selectedTemplate) return;

    const customBracelet = {
      configId: `custom-bracelet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "custom-bracelet",
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      charmNames: selectedCharms.map((sc) => `${sc.charm.name} (${sc.quantity})`),
      beadNames: selectedBeads.map((sb) => {
        const sizeSuffix = sb.size ? ` - ${sb.size}` : "";
        return `${sb.bead.name}${sizeSuffix} (${sb.quantity})`;
      }),
      price: calculateTotalPrice().toFixed(2),
      quantity: 1,
    };

    onAddToCart(customBracelet);
    
    toast({
      title: "Added to Cart",
      description: "Custom bracelet added to cart",
      duration: 3000,
    });

    setLocation("/");
  };

  if (loadingTemplates || loadingCharms || loadingBeads) {
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
          <div className={`flex items-center gap-2 ${currentStep === "select-string" ? "text-primary font-semibold" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === "select-string" ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
              1
            </div>
            <span className="hidden sm:inline">Choose Base</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <div className={`flex items-center gap-2 ${currentStep === "add-charms" ? "text-primary font-semibold" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === "add-charms" ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
              2
            </div>
            <span className="hidden sm:inline">Customize</span>
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
          <h2 className="text-2xl font-serif font-bold mb-6 text-center">Choose Your Bracelet Base</h2>
          
          <div className="flex justify-center mb-8">
            <div className="flex flex-wrap gap-3 justify-center">
              {availableCategories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 text-sm font-semibold hover-elevate active-elevate-2"
                  onClick={() => setSelectedCategory(category)}
                  data-testid={`badge-category-${category.toLowerCase()}`}
                >
                  {category === "All" ? "All Bases" : category === "String" ? "Plain Strings" : "Beaded Bracelets"}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card 
                key={template.id} 
                className="hover-elevate cursor-pointer group overflow-hidden"
                onClick={() => handleTemplateSelect(template)}
                data-testid={`card-bracelet-template-${template.id}`}
              >
                <CardHeader className="relative">
                  <div className="aspect-square overflow-hidden rounded-lg mb-4">
                    <img
                      src={encodeURI(template.imageUrl) + '?v=' + Date.now()}
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
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xl font-semibold">${parseFloat(template.basePrice).toFixed(2)}</p>
                    <Badge variant="secondary">{template.category}</Badge>
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-rose-gold via-gold-primary to-gold-secondary text-charcoal-dark font-semibold hover-elevate active-elevate-2" 
                    onClick={() => handleTemplateSelect(template)}
                    data-testid={`button-select-template-${template.id}`}
                  >
                    Select This Base
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
              Change Base
            </Button>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="font-serif">Selected Base: {selectedTemplate.name}</CardTitle>
                <CardDescription>Base Price: ${parseFloat(selectedTemplate.basePrice).toFixed(2)} • {selectedTemplate.category}</CardDescription>
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

          <h2 className="text-2xl font-serif font-bold mb-6 text-center">Customize Your Bracelet</h2>
          <p className="text-center text-muted-foreground mb-8">Add charms and beads to personalize your bracelet</p>
          
          {(selectedCharms.length > 0 || selectedBeads.length > 0) && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="font-serif">Selected Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedCharms.map((sc) => (
                    <div key={sc.charm.id} className="flex items-center justify-between p-4 rounded-lg bg-muted">
                      <div className="flex items-center gap-4">
                        <img
                          src={encodeURI(sc.charm.imageUrl)}
                          alt={sc.charm.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <div>
                          <p className="font-semibold">{sc.charm.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ${parseFloat(sc.charm.price).toFixed(2)} each • Charm
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
                          disabled={remainingSlots === 0 || isCharmLimitReached}
                          data-testid={`button-add-charm-${sc.charm.id}`}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {selectedBeads.map((sb) => {
                    const beadPrice = getBeadPrice(sb);
                    const beadKey = sb.size ? `${sb.bead.id}-${sb.size}` : sb.bead.id;
                    const displayName = sb.size ? `${sb.bead.name} - ${sb.size}` : sb.bead.name;
                    
                    return (
                      <div key={beadKey} className="flex items-center justify-between p-4 rounded-lg bg-muted">
                        <div className="flex items-center gap-4">
                          <img
                            src={encodeURI(sb.bead.imageUrl)}
                            alt={sb.bead.name}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                          <div>
                            <p className="font-semibold">{displayName}</p>
                            <p className="text-sm text-muted-foreground">
                              ${beadPrice.toFixed(2)} each • Bead
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleRemoveBead(sb.bead.id)}
                            data-testid={`button-remove-bead-${beadKey}`}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-semibold">{sb.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleAddBead(sb.bead)}
                            disabled={remainingSlots === 0}
                            data-testid={`button-add-bead-${beadKey}`}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
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
                    data-testid="button-continue-review"
                  >
                    Continue to Review
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {availableCharms.map((charm) => {
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
                        src={encodeURI(charm.imageUrl)}
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
                      disabled={remainingSlots === 0 || isCharmLimitReached}
                      data-testid={`button-select-charm-${charm.id}`}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      {isCharmLimitReached ? "Max 3 Charms" : "Add"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <h3 className="text-xl font-serif font-bold mt-12 mb-6 text-center">Add Beads</h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(groupedBeads).map(([groupKey, beadGroup]) => {
              const firstBead = beadGroup[0];
              const hasSize = hasSizeVariants(beadGroup);
              const availableSizes = getAvailableSizes(beadGroup);
              const currentSize = selectedBeadSizes[groupKey] || (hasSize ? getDefaultSize(beadGroup) : '');
              const currentBead = hasSize ? getBeadForSize(beadGroup, currentSize) : firstBead;
              
              if (!currentBead) return null;
              
              const selected = selectedBeads.find((sb) => sb.bead.id === currentBead.id);
              
              return (
                <Card 
                  key={groupKey} 
                  className={`hover-elevate ${selected ? "border-primary" : ""}`}
                  data-testid={`card-bead-${currentBead.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="relative">
                      <img
                        src={encodeURI(firstBead.imageUrl)}
                        alt={firstBead.name}
                        className="w-full h-32 object-cover rounded-md"
                      />
                      {selected && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-sm mt-2">{firstBead.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {hasSize ? (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold">${currentBead.price}</span>
                          <Badge variant="outline" className="text-xs">{firstBead.color}</Badge>
                        </div>
                        <div className="mb-2">
                          <p className="text-xs text-muted-foreground mb-1">Select your size:</p>
                          <Select 
                            value={currentSize} 
                            onValueChange={(v) => setSelectedBeadSizes(prev => ({ ...prev, [groupKey]: v }))}
                          >
                            <SelectTrigger className="w-full" data-testid={`select-bead-size-${groupKey}`}>
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableSizes.map(size => {
                                const beadForSize = getBeadForSize(beadGroup, size);
                                return (
                                  <SelectItem key={size} value={size}>
                                    {size} - ${beadForSize?.price || '0.00'}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => currentBead && handleAddBead(currentBead)}
                          disabled={remainingSlots === 0}
                          data-testid={`button-select-bead-${currentBead.id}`}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add {currentSize}
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold">${currentBead.price}</span>
                          <Badge variant="outline" className="text-xs">{firstBead.color}</Badge>
                        </div>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => handleAddBead(currentBead)}
                          disabled={remainingSlots === 0}
                          data-testid={`button-select-bead-${currentBead.id}`}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </>
                    )}
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
                    src={encodeURI(selectedTemplate.imageUrl)}
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

              {selectedCharms.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Selected Charms ({selectedCharms.reduce((sum, sc) => sum + sc.quantity, 0)})</h3>
                  <div className="space-y-2">
                    {selectedCharms.map((sc) => (
                      <div key={sc.charm.id} className="flex items-center gap-3 bg-muted/30 p-3 rounded-md">
                        <img
                          src={encodeURI(sc.charm.imageUrl)}
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
              )}

              {selectedBeads.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Selected Beads ({selectedBeads.reduce((sum, sb) => sum + sb.quantity, 0)})</h3>
                  <div className="space-y-2">
                    {selectedBeads.map((sb) => {
                      const beadPrice = getBeadPrice(sb);
                      const beadKey = sb.size ? `${sb.bead.id}-${sb.size}` : sb.bead.id;
                      const displayName = sb.size ? `${sb.bead.name} - ${sb.size}` : sb.bead.name;
                      
                      return (
                        <div key={beadKey} className="flex items-center gap-3 bg-muted/30 p-3 rounded-md">
                          <img
                            src={encodeURI(sb.bead.imageUrl)}
                            alt={sb.bead.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{displayName}</p>
                            <p className="text-sm text-muted-foreground">Quantity: {sb.quantity}</p>
                          </div>
                          <span className="font-bold">${(beadPrice * sb.quantity).toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Base Bracelet</span>
                  <span>${selectedTemplate.basePrice}</span>
                </div>
                {selectedCharms.length > 0 && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">Charms ({selectedCharms.reduce((sum, sc) => sum + sc.quantity, 0)})</span>
                    <span>
                      ${selectedCharms.reduce((sum, sc) => sum + parseFloat(sc.charm.price) * sc.quantity, 0).toFixed(2)}
                    </span>
                  </div>
                )}
                {selectedBeads.length > 0 && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">Beads ({selectedBeads.reduce((sum, sb) => sum + sb.quantity, 0)})</span>
                    <span>
                      ${selectedBeads.reduce((sum, sb) => sum + getBeadPrice(sb) * sb.quantity, 0).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>$5.99</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Tax (8.75%)</span>
                  <span>${((calculateTotalPrice() + 5.99) * 0.0875).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-2xl font-bold pt-4 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary" data-testid="text-total-price">
                    ${(calculateTotalPrice() + 5.99 + (calculateTotalPrice() + 5.99) * 0.0875).toFixed(2)}
                  </span>
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
              Back to Customize
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-rose-gold via-gold-primary to-gold-secondary text-charcoal-dark font-semibold hover-elevate active-elevate-2"
              onClick={handleAddToCart}
              data-testid="button-add-to-cart"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      )}

      {/* Footer - matching main page */}
      <footer className="border-t border-border py-12 md:py-16 px-4 mt-16" style={{ background: '#0f0d0b', color: '#fff' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div>
              <h3 className="font-serif text-xl font-bold mb-3">Follow Us on Social Media</h3>
              <p className="mb-4 max-w-md" style={{ color: '#f0e7d6' }}>
                Join our community for exclusive behind-the-scenes content, new collection launches, and special offers!
              </p>
              <div className="flex gap-4 mb-4">
                <a 
                  href="https://www.instagram.com/wow_bydany?igsh=MXFsZXZpbDVqaGp4dQ%3D%3D&utm_source=qr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  aria-label="Follow us on Instagram"
                  data-testid="link-instagram-builder"
                >
                  <SiInstagram size={24} style={{ color: '#caa55b' }} />
                </a>
                <a 
                  href="http://www.tiktok.com/@wow_bydany" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  aria-label="Follow us on TikTok"
                  data-testid="link-tiktok-builder"
                >
                  <SiTiktok size={24} style={{ color: '#caa55b' }} />
                </a>
              </div>
              <p className="text-xs" style={{ color: '#c9c0b0' }}>
                &copy; {new Date().getFullYear()} WOW by Dany. All rights reserved.
              </p>
            </div>
            <div className="text-right">
              <h3 className="font-serif text-xl font-bold mb-3">Quick Links</h3>
              <div className="flex flex-col gap-2">
                <Link href="/" className="hover:opacity-80 transition-opacity" style={{ color: '#f0e7d6' }}>
                  Shop All Jewelry
                </Link>
                <Link href="/privacy" className="hover:opacity-80 transition-opacity" style={{ color: '#f0e7d6' }}>
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
