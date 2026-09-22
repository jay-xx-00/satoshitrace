import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Plus, CheckCircle2, Lock } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/st/AppShell";

export const Route = createFileRoute("/whitelist")({
  head: () => ({
    meta: [
      { title: "Exchange Whitelist — SatoshiTrace" },
      {
        name: "description",
        content: "Known cryptocurrency exchange and mining pool hot-wallet registry for false-positive prevention.",
      },
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

export function WhitelistPage() {
  return (
    <AppShell title="Exchange Whitelist" breadcrumb="HQ / ENTITY REGISTRY / 500+ VERIFIED HUBS (FPR < 3.2%)">
      <div className="h-full overflow-y-auto p-4 space-y-3 font-mono select-none">
        {/* Whitelist Banner */}
        <div className="flex flex-wrap items-start justify-between gap-4 rounded border border-[#1C232E] bg-[#0D1117] p-3.5">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded border border-[#39FF88]/40 bg-[#39FF88]/10 text-[#39FF88]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#E6EDF3]">
                  EXCHANGE HOT-WALLET REGISTRY // FALSE POSITIVE GATE
                </h2>
                <span className="rounded bg-[#39FF88]/15 px-2 py-0.2 text-[9px] font-bold text-[#39FF88] border border-[#39FF88]/30">
                  500+ PRE-TAGGED HUBS
                </span>
              </div>
              <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-[#7D8590]">
                High-volume exchanges, custodial settlement pools, and registered mining networks are excluded from false accusation scoring. This foundational layer reduces our verified false-positive rate to 3.2% while protecting innocent retail crypto users.
              </p>
            </div>
          </div>
          <button
            onClick={() => toast.info("Whitelist entity registration requires authorized supervisor PIN.")}
            className="flex items-center gap-1.5 rounded border border-[#39FF88]/40 bg-[#39FF88]/15 px-3 py-1.5 text-xs font-bold text-[#39FF88] hover:bg-[#39FF88]/25 transition-all"
          >
            <Plus size={13} />
            <span>ADD VERIFIED EXCHANGE HUB</span>
          </button>
        </div>

        {/* Entities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {WHITELIST_ENTITIES.map((ent) => (
            <div
              key={ent.name}
              className="rounded border border-[#1C232E] bg-[#0D1117] p-3 space-y-2.5"
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-[#1C232E]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#39FF88] shrink-0" />
                  <h3 className="text-xs font-bold text-[#E6EDF3]">{ent.name}</h3>
                </div>
                <span className="rounded bg-[#0A0E14] px-1.5 py-0.2 text-[9px] font-mono text-[#7D8590] border border-[#1C232E]">
                  {ent.category}
                </span>
              </div>

              <div className="text-[10px] text-[#7D8590] flex items-center gap-1.5">
                <Lock size={11} className="text-[#39FF88]" />
                <span>JURISDICTION:</span>
                <span className="text-[#E6EDF3] font-semibold">{ent.jurisdiction}</span>
              </div>

              <div className="space-y-1 rounded border border-[#1C232E] bg-[#0A0E14] p-2">
                <div className="text-[9px] text-[#7D8590] mb-1">PRE-TAGGED HOT WALLET ADDRESSES:</div>
                {ent.addresses.map((addr) => (
                  <div
                    key={addr}
                    className="font-mono text-[10px] text-[#39FF88] truncate flex items-center justify-between"
                  >
                    <span className="truncate">{addr}</span>
                    <span className="rounded bg-[#1C232E] px-1 py-0.2 text-[8px] text-[#7D8590] ml-2 shrink-0">
                      EXCLUDED
                    </span>
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
export default WhitelistPage;
