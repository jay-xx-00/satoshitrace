import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Plus, CheckCircle2, Lock } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/st/AppShell";

export const Route = createFileRoute("/whitelist")({
  head: () => ({
    meta: [
      { title: "Exchange Whitelist — SatoshiTrace" },
      { name: "description", content: "Known cryptocurrency exchange and mining pool hot-wallet registry for false-positive prevention." },
      { property: "og:title", content: "Exchange Whitelist — SatoshiTrace" },
    ],
  }),
  component: WhitelistPage,
});

const WHITELIST_ENTITIES = [
  {
    name: "WazirX India (Hot Wallet Hub)",
    category: "EXCHANGE_IN",
    addresses: ["bc1qwazirx_hot_primary_98213", "bc1qwazirx_deposit_pool_38102", "3Kzh9WazirX_MainVault_4819"],
    jurisdiction: "India (FIU-IND Registered)",
    status: "ACTIVE_VERIFIED",
  },
  {
    name: "CoinDCX India (Settlement Vault)",
    category: "EXCHANGE_IN",
    addresses: ["bc1qcoindcx_settle_main_1029", "1A1zPCoinDCX_Reserve_9921"],
    jurisdiction: "India (FIU-IND Registered)",
    status: "ACTIVE_VERIFIED",
  },
  {
    name: "CoinSwitch Kuber (Customer Deposit)",
    category: "EXCHANGE_IN",
    addresses: ["bc1qcoinswitch_dep_88291", "3J98tCoinSwitch_Cold_771"],
    jurisdiction: "India (FIU-IND Registered)",
    status: "ACTIVE_VERIFIED",
  },
  {
    name: "Binance Global (Primary Cold Vault)",
    category: "EXCHANGE_GLOBAL",
    addresses: ["34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo", "bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h"],
    jurisdiction: "Global Custody",
    status: "ACTIVE_VERIFIED",
  },
  {
    name: "Coinbase Prime (Institutional Vault)",
    category: "EXCHANGE_GLOBAL",
    addresses: ["3QJmnhF2t6jGeWbeum979xpLpnDxic6aHp", "bc1qgdjqv0av3q56jvd82tkdjpy7gdp9ut8tlqmgrpmv24sq90ecnvqqjwvw97"],
    jurisdiction: "US SEC Regulated",
    status: "ACTIVE_VERIFIED",
  },
  {
    name: "Foundry USA Mining Pool (Block Reward Payouts)",
    category: "MINING_POOL",
    addresses: ["bc1qfoundry_pool_payout_master_1", "1KFHE7w2BhaVoT2u539W82P8m7a1k9"],
    jurisdiction: "Mining Infrastructure",
    status: "ACTIVE_VERIFIED",
  },
];

function WhitelistPage() {
  return (
    <AppShell title="Exchange Whitelist Manager" breadcrumb="HOME / ENTITY REGISTRY / 500+ VERIFIED HUBS">
      <div className="h-full overflow-y-auto p-5 space-y-5">
        <div className="glass flex items-start justify-between p-5">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-400">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-bold tracking-wide text-foreground">
                  Known Entity & Exchange Hot-Wallet Registry
                </h2>
                <span className="mono-xs rounded bg-cyan-500/20 px-2 py-0.5 font-semibold text-cyan-400 ring-1 ring-cyan-500/30">
                  500+ Pre-Tagged Hubs
                </span>
              </div>
              <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
                High-volume exchanges, custodial settlement pools, and registered mining networks are excluded from false accusation scoring. This foundational layer reduces our verified false-positive rate to 3.2% while protecting innocent retail crypto users.
              </p>
            </div>
          </div>
          <button
            onClick={() => toast.info("Whitelist entity registration requires authorized supervisor PIN.")}
            className="flex items-center gap-2 rounded-md bg-signal px-4 py-2.5 text-[12px] font-bold text-signal-foreground shadow-lg hover:bg-signal/90"
          >
            <Plus size={15} /> Add Verified Exchange Hub
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {WHITELIST_ENTITIES.map((ent) => (
            <div key={ent.name} className="glass p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <h3 className="text-[14px] font-bold text-foreground">{ent.name}</h3>
                </div>
                <span className="mono-xs rounded bg-cyan-500/15 px-2 py-0.5 font-mono text-cyan-400 font-semibold">
                  {ent.category}
                </span>
              </div>

              <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <Lock size={12} className="text-signal" /> Jurisdiction: <span className="text-foreground">{ent.jurisdiction}</span>
              </div>

              <div className="space-y-1 rounded bg-background/50 p-2.5">
                <div className="mono-xs text-muted-foreground mb-1">Pre-Tagged Hot Wallet Addresses:</div>
                {ent.addresses.map((addr) => (
                  <div key={addr} className="font-mono text-[10.5px] text-emerald-400 truncate flex items-center justify-between">
                    <span className="truncate">{addr}</span>
                    <span className="text-[9px] text-muted-foreground ml-2">EXCLUDED</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
