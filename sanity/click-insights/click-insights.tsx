"use client";

import { useEffect, useState } from "react";
import { Button, Card, Container, Flex, Heading, Spinner, Text } from "@sanity/ui";
import { useStudioSessionToken } from "@/sanity/lib/use-studio-session-token";
import styles from "./click-insights.module.css";

type DailyInsight = { date: string; clicks: number };
type ProductInsight = { id: string; name: string; slug: string; clicks: number };
type MerchantInsight = { id: string; name: string; clicks: number };
type SurfaceInsight = { surface: "hero" | "mobile_tray" | "comparison"; clicks: number };
type Insights = {
  totalClicks: number;
  productCount: number;
  merchantCount: number;
  daily: DailyInsight[];
  topProducts: ProductInsight[];
  merchants: MerchantInsight[];
  surfaces: SurfaceInsight[];
};

const periods = [7, 30, 90] as const;
const surfaceLabels: Record<SurfaceInsight["surface"], string> = {
  hero: "Hero shortcuts",
  mobile_tray: "Mobile tray",
  comparison: "Offer comparison",
};

function RankingList({ items }: { items: Array<{ id: string; name: string; clicks: number }> }) {
  const maximum = Math.max(...items.map((item) => item.clicks), 1);
  if (items.length === 0) return <Text muted>No clicks recorded in this period.</Text>;

  return <div className={styles.ranking}>{items.map((item) => (
    <div key={item.id} className={styles.rankingItem}>
      <Flex justify="space-between" gap={3}>
        <Text weight="semibold">{item.name}</Text>
        <Text muted>{item.clicks.toLocaleString()}</Text>
      </Flex>
      <div className={styles.barTrack}><div className={styles.bar} style={{ width: `${Math.max((item.clicks / maximum) * 100, 2)}%` }} /></div>
    </div>
  ))}</div>;
}

export function ClickInsights() {
  const studioToken = useStudioSessionToken();
  const [days, setDays] = useState<(typeof periods)[number]>(30);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!studioToken) return;

    const controller = new AbortController();

    fetch(`/api/studio/click-insights?days=${days}`, {
      headers: { Authorization: `Bearer ${studioToken}` },
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json() as { insights?: Insights; error?: string };
        if (!response.ok || !result.insights) throw new Error(result.error || "Click insights could not be loaded.");
        setInsights(result.insights);
      })
      .catch((caughtError) => {
        if (!controller.signal.aborted) {
          setInsights(null);
          setError(caughtError instanceof Error ? caughtError.message : "Click insights could not be loaded.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [days, studioToken]);

  const dailyMaximum = Math.max(...(insights?.daily.map((item) => item.clicks) ?? []), 1);
  const surfaceItems = (insights?.surfaces ?? []).map((item) => ({
    id: item.surface,
    name: surfaceLabels[item.surface] ?? item.surface,
    clicks: item.clicks,
  }));
  const displayedError = studioToken === null
    ? "Your Studio session token is unavailable. Refresh Studio and sign in again."
    : error;
  const displayedLoading = studioToken === undefined || (Boolean(studioToken) && loading);

  function changePeriod(period: (typeof periods)[number]) {
    if (period === days) return;
    setLoading(true);
    setError("");
    setDays(period);
  }

  return (
    <Container width={5} padding={4}>
      <div className={styles.stackLarge}>
        <Card padding={4} radius={3} tone="primary">
          <Flex align="center" justify="space-between" gap={4} wrap="wrap">
            <div className={styles.stackSmall}>
              <Text size={1} weight="bold">OWNER REPORT</Text>
              <Heading size={3}>Merchant Click Insights</Heading>
              <Text muted>Anonymous outbound clicks on curated MishBaby product offers.</Text>
            </div>
            <Flex gap={2} wrap="wrap">
              {periods.map((period) => (
                <Button
                  key={period}
                  mode={days === period ? "default" : "ghost"}
                  tone="primary"
                  text={`${period} days`}
                  onClick={() => changePeriod(period)}
                />
              ))}
            </Flex>
          </Flex>
        </Card>

        {displayedLoading && <Card padding={5} radius={3}><Flex align="center" gap={3}><Spinner /><Text>Loading click insights…</Text></Flex></Card>}
        {displayedError && !displayedLoading && <Card padding={4} radius={3} tone="critical"><Text>{displayedError}</Text></Card>}

        {insights && !displayedLoading && !displayedError && (
          <>
            <div className={styles.summaryGrid}>
              <Card padding={4} radius={3} shadow={1}>
                <div className={styles.stackSmall}><Text muted>Total outbound clicks</Text><Heading size={4}>{insights.totalClicks.toLocaleString()}</Heading><Text size={1} muted>Last {days} UTC days</Text></div>
              </Card>
              <Card padding={4} radius={3} shadow={1}>
                <div className={styles.stackSmall}><Text muted>Products clicked</Text><Heading size={4}>{insights.productCount.toLocaleString()}</Heading><Text size={1} muted>Up to ten shown below</Text></div>
              </Card>
              <Card padding={4} radius={3} shadow={1}>
                <div className={styles.stackSmall}><Text muted>Merchants clicked</Text><Heading size={4}>{insights.merchantCount.toLocaleString()}</Heading><Text size={1} muted>Curated offers only</Text></div>
              </Card>
            </div>

            <Card padding={4} radius={3} shadow={1}>
              <div className={styles.stackLarge}>
                <Heading size={2}>Daily clicks</Heading>
                {insights.daily.length === 0 ? <Text muted>No clicks recorded in this period.</Text> : (
                  <div className={styles.chart}>
                    {insights.daily.map((item) => (
                      <div key={item.date} className={styles.chartColumn} title={`${item.date}: ${item.clicks} clicks`}>
                        <Text size={1} muted>{item.clicks}</Text>
                        <div className={styles.chartBar} style={{ height: `${Math.max((item.clicks / dailyMaximum) * 120, 4)}px` }} />
                        <Text size={0} muted>{item.date.slice(5)}</Text>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            <div className={styles.detailGrid}>
              <Card padding={4} radius={3} shadow={1}><div className={styles.stackLarge}><Heading size={2}>Top products</Heading><RankingList items={insights.topProducts} /></div></Card>
              <Card padding={4} radius={3} shadow={1}><div className={styles.stackLarge}><Heading size={2}>Merchants</Heading><RankingList items={insights.merchants} /></div></Card>
              <Card padding={4} radius={3} shadow={1}><div className={styles.stackLarge}><Heading size={2}>Button locations</Heading><RankingList items={surfaceItems} /></div></Card>
            </div>
          </>
        )}
      </div>
    </Container>
  );
}
