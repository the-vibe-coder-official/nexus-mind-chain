# Smart Contract Erstellen - Komplette Anleitung

## Übersicht

Diese Anleitung zeigt dir zwei Methoden, um den NeuraLinkAgent Smart Contract zu erstellen und zu deployen:
1. **Direkt in der App** (empfohlen für Anfänger)
2. **Mit Hardhat** (für fortgeschrittene Entwickler)

---

## Methode 1: Smart Contract Deployment direkt in der App ✨

### Voraussetzungen
- MetaMask Browser Extension installiert
- Testnet ETH auf deiner Wallet (für Gas Fees)
- Eine aktive Ethereum-Wallet-Adresse

### Schritt-für-Schritt Anleitung

#### 1. MetaMask vorbereiten
```
1. Installiere MetaMask: https://metamask.io
2. Erstelle/Importiere eine Wallet
3. Wechsle zum Sepolia Testnet:
   - Klicke auf das Netzwerk-Dropdown (oben)
   - Wähle "Testnetze anzeigen" in den Einstellungen
   - Wähle "Sepolia" aus
```

#### 2. Testnet ETH bekommen
Besuche einen Sepolia Faucet:
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia
- Gib deine Wallet-Adresse ein
- Warte auf die Testnet ETH (ca. 0.1-0.5 ETH)

#### 3. Contract in der App deployen
```
1. Öffne die App
2. Navigiere zum "Smart Contract" Tab
3. Klicke auf "Deploy Contract"
4. MetaMask öffnet sich automatisch
5. Bestätige die Transaktion
   - Gas Fee wird angezeigt
   - Überprüfe die Details
   - Klicke "Confirm"
6. Warte auf die Bestätigung (ca. 15-30 Sekunden)
7. Contract-Adresse wird angezeigt und gespeichert
```

#### 4. Contract-Adresse verwenden
Nach erfolgreichem Deployment:
- Die Contract-Adresse wird automatisch gespeichert
- Du kannst nun AI-Agents als NFTs erstellen
- Alle Funktionen sind sofort verfügbar

### Wichtige Hinweise
- **Gas Fees**: Jede Blockchain-Transaktion kostet Gas
- **Testnet zuerst**: Teste immer auf Sepolia bevor du auf Mainnet deployest
- **Contract-Adresse**: Speichere die Adresse sicher - sie ist permanent!

---

## Methode 2: Smart Contract mit Hardhat deployen

Für detaillierte Hardhat-Anweisungen siehe: [`deploy-instructions.md`](./deploy-instructions.md)

### Kurzübersicht Hardhat-Deployment

#### 1. Hardhat-Projekt initialisieren
```bash
mkdir neuralink-contracts
cd neuralink-contracts
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

#### 2. Contract kopieren
```bash
# Kopiere NeuraLinkAgent.sol in den contracts/ Ordner
cp ../contracts/NeuraLinkAgent.sol contracts/
```

#### 3. Hardhat konfigurieren
Erstelle `hardhat.config.js`:
```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

#### 4. Deployment-Script erstellen
Erstelle `scripts/deploy.js`:
```javascript
const hre = require("hardhat");

async function main() {
  const NeuraLinkAgent = await hre.ethers.getContractFactory("NeuraLinkAgent");
  const agent = await NeuraLinkAgent.deploy();
  await agent.waitForDeployment();
  
  console.log("NeuraLinkAgent deployed to:", await agent.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

#### 5. Deployen
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

#### 6. Contract-Adresse in App eintragen
Nach dem Deployment:
1. Kopiere die Contract-Adresse aus der Console
2. Öffne die App
3. Die App erkennt automatisch den deployed Contract

---

## Smart Contract Funktionen

### Hauptfunktionen des NeuraLinkAgent Contracts

#### 1. **registerAgent**
```solidity
function registerAgent(string memory _name, string memory _model)
```
- Erstellt einen neuen AI-Agent
- Weist eine eindeutige Agent-ID zu
- Agent-Owner ist der Wallet-Besitzer

#### 2. **createTask**
```solidity
function createTask(uint256 _agentId, string memory _description)
```
- Erstellt eine Task für einen Agent
- Erfordert ETH-Reward als Payment
- Task-ID wird zurückgegeben

#### 3. **completeTask**
```solidity
function completeTask(uint256 _taskId)
```
- Markiert Task als erledigt
- Überweist Reward an Agent-Owner
- Nur Agent-Owner kann dies aufrufen

#### 4. **purchaseAgent**
```solidity
function purchaseAgent(uint256 _agentId)
```
- Kauft einen Agent als NFT
- ETH-Transfer an Verkäufer
- 2% Platform Fee wird abgezogen
- Ownership wird übertragen

#### 5. **toggleAgentStatus**
```solidity
function toggleAgentStatus(uint256 _agentId)
```
- Aktiviert/Deaktiviert einen Agent
- Nur Agent-Owner kann dies tun

---

## Monetarisierungs-Möglichkeiten

### Als Platform-Betreiber
1. **Platform Fees (2%)**
   - Verdiene 2% bei jedem NFT-Verkauf
   - Automatisch im Contract implementiert
   - Auszahlung via `withdrawPlatformFees()`

2. **Task Commissions**
   - Potentielle Erweiterung für Task-Gebühren
   - Könnte in zukünftigen Versionen implementiert werden

### Als Agent-Creator
1. **NFT-Verkäufe**
   - Erstelle hochwertige Agents
   - Setze eigene Preise
   - Verkaufe auf dem Marketplace

2. **Task Rewards**
   - Verdiene ETH durch Task-Completions
   - Je besser dein Agent, desto mehr Tasks
   - Automatische Auszahlung nach Completion

### Als Agent-Käufer
1. **Weiterverkauf**
   - Kaufe Agents günstig
   - Optimiere Performance
   - Verkaufe mit Gewinn

2. **Task Earnings**
   - Nutze gekaufte Agents für Tasks
   - Verdiene Rewards
   - Passive Income durch erfolgreiche Agents

---

## Sicherheit & Best Practices

### Vor dem Deployment
- ✅ Contract-Code auf Testnet testen
- ✅ Alle Funktionen durchspielen
- ✅ Gas-Kosten kalkulieren
- ✅ Private Keys NIEMALS teilen

### Nach dem Deployment
- ✅ Contract-Adresse sicher speichern
- ✅ Auf Etherscan verifizieren (optional)
- ✅ Backup der Deployment-Details
- ✅ Monitoring der Contract-Aktivität

### Testnet vs. Mainnet
| Aspekt | Testnet (Sepolia) | Mainnet |
|--------|------------------|---------|
| Kosten | Gratis (Testnet ETH) | Echtes Geld (ETH) |
| Risiko | Kein finanzielles Risiko | Hohes Risiko |
| Zweck | Testing & Development | Production |
| Empfohlen für | Anfänger, Testing | Production-Ready Apps |

---

## Troubleshooting

### Problem: MetaMask verbindet sich nicht
**Lösung**: 
- Browser-Cache leeren
- MetaMask Extension neu installieren
- Seite neu laden

### Problem: Deployment schlägt fehl
**Lösung**:
- Genug Testnet ETH vorhanden?
- Richtiges Netzwerk ausgewählt?
- Gas-Limit erhöhen in MetaMask

### Problem: Transaktion hängt
**Lösung**:
- Warte 2-3 Minuten
- Überprüfe auf Etherscan: `https://sepolia.etherscan.io`
- Bei Bedarf: Transaktion mit höherem Gas erneut senden

### Problem: Contract-Adresse nicht gespeichert
**Lösung**:
- Kopiere Adresse aus Deployment-Log
- Speichere manuell in der App
- Oder: Deploy erneut durchführen

---

## Nützliche Links

### Testnets & Faucets
- Sepolia Faucet: https://sepoliafaucet.com/
- Alchemy Faucet: https://www.alchemy.com/faucets/ethereum-sepolia
- Sepolia Explorer: https://sepolia.etherscan.io

### Dokumentation
- Hardhat Docs: https://hardhat.org/docs
- Ethers.js Docs: https://docs.ethers.org/
- Solidity Docs: https://docs.soliditylang.org/

### Tools
- MetaMask: https://metamask.io
- Remix IDE: https://remix.ethereum.org
- OpenZeppelin: https://docs.openzeppelin.com/contracts/

---

## Nächste Schritte

Nach erfolgreichem Contract-Deployment:

1. **Erstelle deinen ersten AI-Agent**
   - Nutze das "Create Agent" Formular
   - Wähle ein AI-Modell (z.B. gemini-2.5-pro)
   - Registriere als NFT auf dem Contract

2. **Erstelle Tasks**
   - Definiere Tasks für deinen Agent
   - Setze ETH-Rewards
   - Lasse Tasks von Agents erledigen

3. **Verkaufe Agents als NFTs**
   - Liste deinen Agent im Marketplace
   - Setze einen fairen Preis
   - Verdiene ETH durch Verkäufe

4. **Erweitere den Contract** (optional)
   - Füge neue Funktionen hinzu
   - Implementiere Royalty-System
   - Erstelle Staking-Mechanismen

---

## Support

Bei Fragen oder Problemen:
- Überprüfe diese Dokumentation
- Teste zuerst auf Sepolia Testnet
- Überprüfe Etherscan für Transaktions-Details
- Stelle sicher, dass MetaMask korrekt konfiguriert ist

**Viel Erfolg beim Deployen deines Smart Contracts! 🚀**
