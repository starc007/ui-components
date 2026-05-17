"use client";

import { DollarSign, Users, ShoppingCart, Activity } from "lucide-react";
import { StatCard } from "@/components/data-nav/stat-card";

export function StatCardPreview() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Revenue" value={45290} format={(n) => `$${Math.round(n).toLocaleString()}`} delta={12.4} icon={DollarSign} />
      <StatCard label="Users" value={2841} delta={4.1} icon={Users} />
      <StatCard label="Orders" value={319} delta={-2.6} icon={ShoppingCart} />
      <StatCard label="Active now" value={128} hint="Updated every minute" icon={Activity} />
    </div>
  );
}
