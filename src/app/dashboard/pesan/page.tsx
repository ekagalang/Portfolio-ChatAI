import Link from "next/link";
import { CreditCard, MessageCircle } from "lucide-react";
import { requireUser } from "@/lib/session";
import { services } from "@/data/services";
import { profile } from "@/data/profile";
import { formatIDR } from "@/lib/utils";
import { getLang } from "@/lib/i18n.server";
import { t } from "@/lib/i18n";
import { PageHeader, Panel, btnPrimary, btnGhost } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pesan Jasa", robots: { index: false } };

export default async function DashboardPesanPage() {
  await requireUser();
  const tt = t(await getLang());

  return (
    <>
      <PageHeader title={tt.pesan.title} subtitle={tt.pesan.subtitle} />

      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((s) => (
          <Panel key={s.id} className="flex flex-col p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl leading-none">{s.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{s.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.description}</p>
              </div>
            </div>

            {s.stack.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {s.stack.slice(0, 5).map((t) => (
                  <span
                    key={t}
                    className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-accent"
                  >
                    {t}
                  </span>
                ))}
                {s.stack.length > 5 && (
                  <span className="px-1 py-0.5 font-mono text-[10px] text-muted-foreground">
                    +{s.stack.length - 5}
                  </span>
                )}
              </div>
            )}

            <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-border pt-4">
              <div>
                <p className="font-mono text-sm font-semibold text-accent">
                  {tt.pesan.startFrom} {formatIDR(s.pricing.starting)}
                  <span className="text-[11px] font-normal text-muted-foreground">/{s.pricing.unit}</span>
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">⏱ {s.duration}</p>
              </div>
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/${profile.contact.whatsapp}?text=Halo, saya tertarik dengan jasa ${encodeURIComponent(s.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={btnGhost}
                >
                  <MessageCircle className="size-3.5" /> {tt.pesan.ask}
                </a>
                <Link href={`/order/new?service=${s.id}`} className={btnPrimary}>
                  <CreditCard className="size-3.5" /> {tt.pesan.order}
                </Link>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}
