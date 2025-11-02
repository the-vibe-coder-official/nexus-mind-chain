import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Bot, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { registerAgent, CONTRACT_ADDRESS } from "@/utils/contracts";

interface CreateAgentFormProps {
  walletAddress: string;
  onAgentCreated?: () => void;
}

const AI_MODELS = [
  "google/gemini-2.5-pro",
  "google/gemini-2.5-flash", 
  "google/gemini-2.5-flash-lite",
  "openai/gpt-5",
  "openai/gpt-5-mini",
  "openai/gpt-5-nano"
];

const CreateAgentForm = ({ walletAddress, onAgentCreated }: CreateAgentFormProps) => {
  const [name, setName] = useState("");
  const [model, setModel] = useState("google/gemini-2.5-flash");
  const [description, setDescription] = useState("");
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [newCapability, setNewCapability] = useState("");
  const [registerAsNFT, setRegisterAsNFT] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const addCapability = () => {
    if (newCapability.trim() && !capabilities.includes(newCapability.trim())) {
      setCapabilities([...capabilities, newCapability.trim()]);
      setNewCapability("");
    }
  };

  const removeCapability = (cap: string) => {
    setCapabilities(capabilities.filter(c => c !== cap));
  };

  const handleCreate = async () => {
    if (!name.trim() || !model) {
      toast.error("Bitte Name und Model ausfüllen");
      return;
    }

    setIsCreating(true);
    try {
      // 1. Agent in Supabase erstellen
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Bitte erst einloggen");
        return;
      }

      let nftTokenId = null;
      let nftContractAddress = null;

      // 2. Optional: Als NFT im Smart Contract registrieren
      if (registerAsNFT) {
        if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
          toast.error("Bitte erst den Smart Contract deployen!");
          setIsCreating(false);
          return;
        }

        try {
          toast.info("Registriere Agent als NFT...");
          const tokenId = await registerAgent(name, model);
          nftTokenId = tokenId.toString();
          nftContractAddress = CONTRACT_ADDRESS;
          toast.success("Agent als NFT registriert!");
        } catch (error: any) {
          console.error("NFT registration error:", error);
          toast.error("NFT Registrierung fehlgeschlagen: " + error.message);
          setIsCreating(false);
          return;
        }
      }

      // 3. Agent in Datenbank speichern
      const { data, error } = await supabase
        .from("agents")
        .insert({
          name: name.trim(),
          model,
          description: description.trim() || null,
          capabilities,
          is_nft: registerAsNFT,
          nft_token_id: nftTokenId,
          nft_contract_address: nftContractAddress,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // 4. Analytics Event tracken
      try {
        await supabase.functions.invoke("analytics-tracker", {
          body: {
            event_type: "agent_created",
            agent_id: data.id,
            event_data: {
              name,
              model,
              is_nft: registerAsNFT,
              capabilities_count: capabilities.length
            }
          }
        });
      } catch (analyticsError) {
        console.error("Analytics tracking failed:", analyticsError);
      }

      toast.success(`Agent "${name}" erfolgreich erstellt!`);
      
      // Reset form
      setName("");
      setModel("google/gemini-2.5-flash");
      setDescription("");
      setCapabilities([]);
      setRegisterAsNFT(false);

      if (onAgentCreated) {
        onAgentCreated();
      }
    } catch (error: any) {
      console.error("Create agent error:", error);
      toast.error(error.message || "Agent konnte nicht erstellt werden");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="glassmorphic border-border/20 p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20">
          <Bot className="w-8 h-8 text-accent" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-primary mb-2">Neuen AI Agent erstellen</h2>
          <p className="text-sm text-muted-foreground">
            Erstelle einen eigenen AI Agent mit individuellen Fähigkeiten
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <Label htmlFor="agentName">Agent Name *</Label>
          <Input
            id="agentName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z.B. DataAnalyst-Pro"
            className="bg-background/50 border-border/20"
          />
        </div>

        {/* Model */}
        <div>
          <Label htmlFor="agentModel">AI Model *</Label>
          <select
            id="agentModel"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full h-10 px-3 rounded-md bg-background/50 border border-border/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {AI_MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground mt-1">
            Empfohlen: google/gemini-2.5-flash für beste Balance
          </p>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="agentDesc">Beschreibung</Label>
          <Textarea
            id="agentDesc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Beschreibe die Aufgaben und Fähigkeiten des Agents..."
            className="bg-background/50 border-border/20 min-h-[80px]"
          />
        </div>

        {/* Capabilities */}
        <div>
          <Label>Capabilities</Label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newCapability}
              onChange={(e) => setNewCapability(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCapability()}
              placeholder="z.B. Data Analysis, Code Generation..."
              className="bg-background/50 border-border/20"
            />
            <Button
              type="button"
              onClick={addCapability}
              variant="outline"
              size="icon"
              className="flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {capabilities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {capabilities.map((cap) => (
                <Badge
                  key={cap}
                  variant="secondary"
                  className="pl-2 pr-1 py-1 flex items-center gap-1"
                >
                  {cap}
                  <button
                    onClick={() => removeCapability(cap)}
                    className="ml-1 hover:bg-background/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* NFT Registration */}
        <div className="flex items-center gap-2 p-4 rounded-lg border border-border/20 bg-muted/10">
          <input
            type="checkbox"
            id="registerNFT"
            checked={registerAsNFT}
            onChange={(e) => setRegisterAsNFT(e.target.checked)}
            className="w-4 h-4 rounded border-border/20"
          />
          <Label htmlFor="registerNFT" className="cursor-pointer flex-1">
            Als NFT im Smart Contract registrieren
            <span className="block text-xs text-muted-foreground mt-0.5">
              Agent kann später im Marketplace verkauft werden
            </span>
          </Label>
        </div>

        {/* Submit */}
        <Button
          onClick={handleCreate}
          disabled={isCreating}
          className="w-full neural-glow bg-gradient-to-r from-accent to-primary"
          size="lg"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Agent wird erstellt...
            </>
          ) : (
            <>
              <Bot className="w-5 h-5 mr-2" />
              Agent Erstellen
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default CreateAgentForm;
