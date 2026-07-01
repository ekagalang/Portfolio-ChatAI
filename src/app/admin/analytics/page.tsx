import { requireAdmin } from "@/lib/session";
import { getAnalytics } from "@/lib/analytics";
import { getLang } from "@/lib/i18n.server";
import { t } from "@/lib/i18n";
import { PageHeader } from "@/components/dashboard/ui";
import { AnalyticsView } from "@/components/admin/AnalyticsView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics", robots: { index: false } };

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const [data, lang] = await Promise.all([getAnalytics(), getLang()]);
  const tt = t(lang);

  return (
    <>
      <PageHeader title={tt.analytics.title} subtitle={tt.analytics.subtitle} />
      <AnalyticsView data={data} lang={lang} />
    </>
  );
}
