import { prisma } from "@/lib/db";

export interface MonthPoint {
  year: number;
  month: number; // 0-11
  revenue: number;
  orders: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface ServiceStat {
  title: string;
  count: number;
  revenue: number;
}

export interface Analytics {
  revenue: number;
  outstanding: number;
  totalOrders: number;
  completed: number;
  cancelled: number;
  conversionPct: number;
  avgOrderValue: number;
  totalUsers: number;
  newUsersThisMonth: number;
  months: MonthPoint[];
  byStatus: StatusCount[];
  topServices: ServiceStat[];
}

const ACTIVE = ["quoted", "dp_paid", "in_progress", "awaiting_settlement"];
const STATUS_ORDER = [
  "requested",
  "quoted",
  "dp_paid",
  "in_progress",
  "awaiting_settlement",
  "completed",
  "cancelled",
];

export async function getAnalytics(): Promise<Analytics> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [orders, totalUsers, newUsersThisMonth] = await Promise.all([
    prisma.order.findMany({ include: { payments: true } }),
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
  ]);

  const paidOf = (o: (typeof orders)[number]) =>
    o.payments.filter((p) => p.paidAt).reduce((s, p) => s + p.grossAmount, 0);

  const revenue = orders.reduce((s, o) => s + paidOf(o), 0);

  const outstanding = orders.reduce((s, o) => {
    if (o.agreedTotal != null && ACTIVE.includes(o.status)) {
      return s + Math.max(0, o.agreedTotal - paidOf(o));
    }
    return s;
  }, 0);

  const totalOrders = orders.length;
  const completed = orders.filter((o) => o.status === "completed").length;
  const cancelled = orders.filter((o) => o.status === "cancelled").length;
  const denom = totalOrders - cancelled;
  const conversionPct = denom > 0 ? Math.round((completed / denom) * 100) : 0;

  const priced = orders.filter((o) => o.agreedTotal != null);
  const avgOrderValue = priced.length
    ? Math.round(priced.reduce((s, o) => s + (o.agreedTotal ?? 0), 0) / priced.length)
    : 0;

  // Last 6 months
  const months: MonthPoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth(), revenue: 0, orders: 0 });
  }
  const bucket = (y: number, m: number) => months.findIndex((x) => x.year === y && x.month === m);

  for (const o of orders) {
    for (const p of o.payments) {
      if (!p.paidAt) continue;
      const d = new Date(p.paidAt);
      const i = bucket(d.getFullYear(), d.getMonth());
      if (i >= 0) months[i].revenue += p.grossAmount;
    }
    const cd = new Date(o.createdAt);
    const ci = bucket(cd.getFullYear(), cd.getMonth());
    if (ci >= 0) months[ci].orders += 1;
  }

  const byStatus = STATUS_ORDER.map((status) => ({
    status,
    count: orders.filter((o) => o.status === status).length,
  })).filter((s) => s.count > 0);

  const svc = new Map<string, { count: number; revenue: number }>();
  for (const o of orders) {
    const cur = svc.get(o.serviceTitle) ?? { count: 0, revenue: 0 };
    cur.count += 1;
    cur.revenue += paidOf(o);
    svc.set(o.serviceTitle, cur);
  }
  const topServices = [...svc.entries()]
    .map(([title, v]) => ({ title, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    revenue,
    outstanding,
    totalOrders,
    completed,
    cancelled,
    conversionPct,
    avgOrderValue,
    totalUsers,
    newUsersThisMonth,
    months,
    byStatus,
    topServices,
  };
}
