import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Rocket, Copy, CheckCircle2 } from "lucide-react";
import { ethers } from "ethers";

interface ContractDeploymentProps {
  onContractDeployed: (address: string) => void;
}

const ContractDeployment = ({ onContractDeployed }: ContractDeploymentProps) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState("");
  const [copied, setCopied] = useState(false);

  // NeuraLinkAgent Contract Bytecode und ABI
  const contractBytecode = "0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506002600381905550611a13806100676000396000f3fe6080604052600436106100e15760003560e01c80637b0472f01161007f578063bb8ad6b711610059578063bb8ad6b714610333578063c87b56dd14610370578063e985e9c5146103ad578063f2fde38b146103ea576100e1565b80637b0472f0146102a257806395d89b41146102cb578063a22cb465146102f6576100e1565b8063162094c4116100bb578063162094c4146101ec57806323b872dd1461021557806342842e0e146102385780636352211e14610261576100e1565b806301ffc9a7146100e657806306fdde0314610123578063081812fc1461014e575b600080fd5b3480156100f257600080fd5b5061010d60048036038101906101089190610f5e565b610413565b60405161011a9190610fa6565b60405180910390f35b34801561012f57600080fd5b50610138610495565b6040516101459190611051565b60405180910390f35b34801561015a57600080fd5b50610175600480360381019061017091906110a9565b610523565b60405161018291906110d6565b60405180910390f35b34801561019757600080fd5b506101b260048036038101906101ad919061121d565b610569565b005b3480156101c057600080fd5b506101db60048036038101906101d691906110a9565b6105ea565b005b3480156101f857600080fd5b50610213600480360381019061020e919061129e565b610670565b005b34801561022157600080fd5b5061023c600480360381019061023791906112fe565b6106f6565b005b34801561024457600080fd5b5061025f600480360381019061025a91906112fe565b610756565b005b34801561026d57600080fd5b50610288600480360381019061028391906110a9565b610776565b60405161029991906110d6565b60405180910390f35b3480156102ae57600080fd5b506102c960048036038101906102c49190611351565b610788565b005b3480156102d757600080fd5b506102e061087e565b6040516102ed9190611051565b60405180910390f35b34801561030257600080fd5b5061031d600480360381019061031891906113a4565b61090c565b60405161032a9190610fa6565b60405180910390f35b34801561033f57600080fd5b5061035a600480360381019061035591906110a9565b610a83565b6040516103679190611051565b60405180910390f35b34801561037c57600080fd5b50610397600480360381019061039291906110a9565b610b23565b6040516103a49190611051565b60405180910390f35b3480156103b957600080fd5b506103d460048036038101906103cf91906113e4565b610bca565b6040516103e19190610fa6565b60405180910390f35b3480156103f657600080fd5b50610411600480360381019061040c9190611424565b610c5e565b005b60007f80ac58cd000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916148061048e57507f5b5e139f000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916145b9050919050565b600580546104a290611480565b80601f01602080910402602001604051908101604052809291908181526020018280546104ce90611480565b801561051b5780601f106104f05761010080835404028352916020019161051b565b820191906000526020600020905b8154815290600101906020018083116104fe57829003601f168201915b505050505081565b600060046000838152602001908152602001600020600101549050919050565b6105728161076d565b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146105df576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105d6906114fd565b60405180910390fd5b6105e881610d2b565b50565b6105f38161076d565b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610660576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610657906114fd565b60405180910390fd5b61066981610d3f565b50565b6106798261076d565b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146106e6576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016106dd906114fd565b60405180910390fd5b6106ef82610d53565b5050565b6106ff81610776565b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461076c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610763906114fd565b60405180910390fd5b5050565b60006001600083815260200190815260200160002060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050919050565b60006107938361076d565b9050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603610804576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107fb90611569565b60405180910390fd5b3373ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603610872576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610869906115d5565b60405180910390fd5b61087b81610d67565b50565b6006805461088b90611480565b80601f01602080910402602001604051908101604052809291908181526020018280546108b790611480565b80156109045780601f106108d957610100808354040283529160200191610904565b820191906000526020600020905b8154815290600101906020018083116108e757829003601f168201915b505050505081565b6000336109188161076d565b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610985576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161097c906114fd565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff16036109f4576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016109eb90611641565b60405180910390fd5b83600460008281526020019081526020016000206000015f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550827f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a360019150509392505050565b60606000600460008481526020019081526020016000206000015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690508073ffffffffffffffffffffffffffffffffffffffff166352d1902d6040518163ffffffff1660e01b8152600401600060405180830381865afa158015610b0a573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f820116820180604052508101906100e1919061167d565b60606004600083815260200190815260200160002060000160159054906101000a900460ff1615610b8a576040518060400160405280600381526020017f4e46540000000000000000000000000000000000000000000000000000000000815250610bc3565b6040518060400160405280600381526020017f4e465400000000000000000000000000000000000000000000000000000000008152505b9050919050565b6000600760008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610cec576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ce3906116e9565b60405180910390fd5b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b50565b50565b50565b50565b565b";

  const deployContract = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask nicht installiert!");
      return;
    }

    setIsDeploying(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      toast.info("Deployment wird vorbereitet...");

      // Contract Factory erstellen
      const factory = new ethers.ContractFactory(
        [
          "constructor()",
          "function registerAgent(string memory _name, string memory _model) external returns (uint256)",
          "function purchaseAgent(uint256 _agentId) external payable",
          "function platformFeePercentage() external view returns (uint256)",
          "function agentCounter() external view returns (uint256)"
        ],
        contractBytecode,
        signer
      );

      // Contract deployen
      toast.info("Warte auf Bestätigung in MetaMask...");
      const contract = await factory.deploy();
      
      toast.info("Contract wird deployed... Bitte warten.");
      await contract.waitForDeployment();

      const address = await contract.getAddress();
      setDeployedAddress(address);
      
      toast.success(`Contract erfolgreich deployed!\n${address}`, {
        duration: 10000,
      });

      onContractDeployed(address);
    } catch (error: any) {
      console.error("Deployment error:", error);
      toast.error(error.message || "Deployment fehlgeschlagen");
    } finally {
      setIsDeploying(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(deployedAddress);
    setCopied(true);
    toast.success("Adresse kopiert!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="glassmorphic border-border/20 p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
          <Rocket className="w-8 h-8 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-primary mb-2">Contract Deployment</h2>
          <p className="text-sm text-muted-foreground">
            Deploye den NeuraLinkAgent Smart Contract auf die Blockchain
          </p>
        </div>
      </div>

      {deployedAddress ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-4 rounded-lg bg-accent/10 border border-accent/20">
            <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
            <div className="flex-1">
              <Label className="text-accent">Contract erfolgreich deployed!</Label>
              <p className="text-xs text-muted-foreground mt-1 break-all">
                {deployedAddress}
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={copyAddress}
              className="flex-shrink-0"
            >
              {copied ? (
                <CheckCircle2 className="w-4 h-4 text-accent" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            💡 Diese Adresse wurde automatisch in der App gespeichert und wird für alle Contract-Interaktionen verwendet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/10 border border-border/20">
            <h3 className="font-semibold mb-2">Was wird deployed?</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>NeuraLinkAgent Smart Contract</li>
              <li>Agent Registration System</li>
              <li>NFT Marketplace Funktionalität</li>
              <li>Task Management System</li>
              <li>2% Platform Fee System</li>
            </ul>
          </div>

          <Button
            onClick={deployContract}
            disabled={isDeploying}
            className="w-full neural-glow bg-gradient-to-r from-primary to-accent"
            size="lg"
          >
            {isDeploying ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Contract wird deployed...
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5 mr-2" />
                Contract Deployen
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            ⚠️ Stelle sicher, dass du genug ETH für Gas Fees hast
          </p>
        </div>
      )}
    </Card>
  );
};

export default ContractDeployment;
