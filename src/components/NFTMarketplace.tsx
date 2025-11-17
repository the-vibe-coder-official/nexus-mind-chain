import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Store, Sparkles, TrendingUp, Eye, Loader2 } from "lucide-react";
import { purchaseAgentNFT, getPlatformFee } from "@/utils/contracts";
import { listingSchema } from "@/lib/validationSchemas";

interface NFTMarketplaceProps {
  walletAddress: string;
  onBack: () => void;
}

const NFTMarketplace = ({ walletAddress, onBack }: NFTMarketplaceProps) => {
  const [listings, setListings] = useState<any[]>([]);
  const [myAgents, setMyAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [platformFee, setPlatformFee] = useState<number>(2);
  const { toast } = useToast();

  useEffect(() => {
    fetchListings();
    fetchMyAgents();
    loadPlatformFee();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('marketplace-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marketplace_listings'
        },
        () => {
          fetchListings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadPlatformFee = async () => {
    try {
      const fee = await getPlatformFee();
      setPlatformFee(fee);
    } catch (error) {
      console.error('Error loading platform fee:', error);
    }
  };

  const fetchListings = async () => {
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select(`
        *,
        agents (
          id,
          name,
          model,
          description,
          performance_score,
          total_tasks,
          successful_tasks,
          nft_token_id
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching listings:', error);
    } else {
      setListings(data || []);
    }
  };

  const fetchMyAgents = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching agents:', error);
    } else {
      setMyAgents(data || []);
    }
  };

  const handleCreateListing = async () => {
    if (!selectedAgent || !price) {
      toast({
        title: "Missing Information",
        description: "Please select an agent and enter a price",
        variant: "destructive",
      });
      return;
    }

    // Validate input using Zod schema
    const validation = listingSchema.safeParse({
      agentId: selectedAgent,
      price: parseFloat(price),
    });

    if (!validation.success) {
      toast({
        title: "Invalid Input",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update agent to NFT status
      const { error: agentError } = await supabase
        .from('agents')
        .update({
          is_nft: true,
          nft_token_id: `NFT-${Date.now()}`,
        })
        .eq('id', selectedAgent);

      if (agentError) throw agentError;

      // Create marketplace listing
      const { error: listingError } = await supabase
        .from('marketplace_listings')
        .insert({
          agent_id: selectedAgent,
          seller_id: user.id,
          price: validation.data.price,
        });

      if (listingError) throw listingError;

      // Track analytics
      await supabase.functions.invoke('analytics-tracker', {
        body: {
          eventType: 'nft_listing_created',
          eventData: { price: parseFloat(price) },
          agentId: selectedAgent,
        },
      });

      toast({
        title: "Success!",
        description: "Your agent is now listed on the NFT marketplace",
      });

      setSelectedAgent("");
      setPrice("");
      fetchListings();
      fetchMyAgents();
    } catch (error: any) {
      console.error('Listing error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create listing",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewListing = async (listingId: string) => {
    // Track analytics
    await supabase.functions.invoke('analytics-tracker', {
      body: {
        eventType: 'nft_listing_viewed',
        eventData: { listingId },
      },
    });

    // Refresh listings to show updated view count
    fetchListings();
  };

  const handlePurchaseNFT = async (listing: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!window.ethereum) {
      toast({
        title: "MetaMask Required",
        description: "Please install MetaMask to purchase NFTs",
        variant: "destructive",
      });
      return;
    }

    setPurchasingId(listing.id);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if user is trying to buy their own NFT
      if (listing.seller_id === user.id) {
        throw new Error("You cannot purchase your own NFT");
      }

      // Execute blockchain transaction
      toast({
        title: "Transaction Started",
        description: "Please confirm the transaction in MetaMask...",
      });

      const agentId = parseInt(listing.agents.nft_token_id.replace('NFT-', ''));
      const purchaseResult = await purchaseAgentNFT(agentId, listing.price.toString());

      // Update marketplace listing
      const { error: updateError } = await supabase
        .from('marketplace_listings')
        .update({
          is_active: false,
          sold_at: new Date().toISOString(),
        })
        .eq('id', listing.id);

      if (updateError) throw updateError;

      // Update agent ownership in database
      const { error: agentError } = await supabase
        .from('agents')
        .update({
          user_id: user.id,
        })
        .eq('id', listing.agent_id);

      if (agentError) throw agentError;

      // Track analytics
      await supabase.functions.invoke('analytics-tracker', {
        body: {
          eventType: 'nft_purchased',
          eventData: { 
            price: listing.price,
            agentId: listing.agent_id,
            transactionHash: purchaseResult.transactionHash 
          },
          agentId: listing.agent_id,
        },
      });

      toast({
        title: "Purchase Successful!",
        description: `You now own ${listing.agents.name}. Platform fee: ${platformFee}%`,
      });

      fetchListings();
      fetchMyAgents();
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to complete purchase",
        variant: "destructive",
      });
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="grid gap-6">
        <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              NFT Agent Marketplace
            </CardTitle>
            <CardDescription>
              Trade AI agents as NFTs on the blockchain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">List Your Agent as NFT</h3>
              
              <div className="space-y-2">
                <Label>Select Agent</Label>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  <option value="">Choose an agent...</option>
                  {myAgents.filter(a => !a.is_nft).map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} - {agent.model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Price (ETH)</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.1"
                />
              </div>

              <Button
                onClick={handleCreateListing}
                disabled={loading || !selectedAgent || !price}
                className="w-full"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                List as NFT
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Card
              key={listing.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleViewListing(listing.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{listing.agents.name}</CardTitle>
                    <CardDescription>{listing.agents.model}</CardDescription>
                  </div>
                  <Badge variant="secondary">
                    <Sparkles className="h-3 w-3 mr-1" />
                    NFT
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {listing.agents.description || "AI agent available for purchase"}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    {listing.views} views
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    Score: {listing.agents.performance_score}
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Price</span>
                    <span className="text-xl font-bold">
                      {listing.price} {listing.currency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Platform Fee ({platformFee}%)</span>
                    <span>{(listing.price * platformFee / 100).toFixed(4)} ETH</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>Seller Receives</span>
                    <span>{(listing.price * (100 - platformFee) / 100).toFixed(4)} ETH</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  variant="default"
                  onClick={(e) => handlePurchaseNFT(listing, e)}
                  disabled={purchasingId === listing.id || listing.seller_id === walletAddress}
                >
                  {purchasingId === listing.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : listing.seller_id === walletAddress ? (
                    "Your Listing"
                  ) : (
                    "Buy Now"
                  )}
                </Button>

                <div className="text-xs text-center text-muted-foreground">
                  Token ID: {listing.agents.nft_token_id}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {listings.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No NFT listings available yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NFTMarketplace;