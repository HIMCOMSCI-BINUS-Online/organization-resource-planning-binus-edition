"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { DashboardStats } from "@/app/lib/queries";
import { Users, UserCheck, Shield, ChevronRight, LayoutGrid, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// A simple React hook to animate numbers without relying on GSAP
function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    const duration = 1200; // 1.2s

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // ease-out-quart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      
      setDisplayValue(Math.floor(easeProgress * value));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    window.requestAnimationFrame(step);
  }, [value]);

  return <span>{displayValue}</span>;
}

const MODULE_LINKS = [
  {
    label: "Member Directory",
    description: "Browse, filter, and manage all organization members.",
    href: "/dashboard/members",
    ready: true,
  },
  {
    label: "Financial Ledger",
    description: "Income & expense tracker with live balance calculation.",
    href: "/dashboard/ledger",
    ready: true,
  },
  {
    label: "Kanban Board",
    description: "Project and task management across departments.",
    href: "/dashboard/tasks",
    ready: true, // Marking tasks as ready since it was migrated
  },
  {
    label: "Knowledge Base",
    description: "Internal rules, event records, and documentation vault.",
    href: "/dashboard/knowledge",
    ready: true, // Marking knowledge as ready since it was migrated
  },
];

export default function DashboardOverview({
  stats,
  userName,
}: {
  stats: DashboardStats;
  userName: string;
}) {
  const firstName = userName.split(" ")[0];

  return (
    <div className="relative z-10 p-6 md:p-12 max-w-7xl mx-auto space-y-10">
      {/* Greeting */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
          <LayoutGrid className="w-4 h-4" />
          <p className="font-mono text-xs tracking-widest uppercase">
            Overview
          </p>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none">
          Welcome, {firstName}.
        </h1>
      </div>

      {/* Divider */}
      <div className="h-px bg-border w-full animate-in fade-in zoom-in-95 duration-700 delay-150 fill-mode-both" />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Members", icon: Users, value: stats.totalMembers, label: "registered accounts", delay: "delay-[100ms]" },
          { title: "Active Members", icon: UserCheck, value: stats.activeMembers, label: "currently active", delay: "delay-[150ms]" },
          { title: "Roles", icon: Shield, value: stats.totalRoles, label: "permission groups", delay: "delay-[200ms]" },
        ].map((stat, i) => (
          <Card key={i} className={`animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both ${stat.delay}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold"><AnimatedNumber value={stat.value} /></div>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}

        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both delay-[250ms]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Newest Member</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">
              {stats.newestMember?.name ?? "—"}
            </div>
            {stats.newestMember && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {new Date(stats.newestMember.createdAt).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Module grid */}
      <div>
        <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-4 animate-in fade-in duration-700 delay-[300ms] fill-mode-both">
          Modules
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODULE_LINKS.map((m, i) => {
            const isReady = m.ready;
            const delayClasses = ["delay-[350ms]", "delay-[400ms]", "delay-[450ms]", "delay-[500ms]"];

            const card = (
              <Card className={`h-full flex flex-col transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 fill-mode-both ${delayClasses[i % delayClasses.length]} ${isReady ? "cursor-pointer hover:shadow-lg hover:border-primary/50 group" : "opacity-60 cursor-not-allowed"}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="transition-colors group-hover:text-primary">{m.label}</CardTitle>
                    {isReady && <Badge variant="secondary" className="transition-colors group-hover:bg-primary/10 group-hover:text-primary">Live</Badge>}
                  </div>
                  <CardDescription>{m.description}</CardDescription>
                </CardHeader>
                <div className="flex-1" />
                <CardFooter>
                  {isReady ? (
                    <div className="flex items-center text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
                      Open Module
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </div>
                  ) : (
                    <p className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
                      Coming next
                    </p>
                  )}
                </CardFooter>
              </Card>
            );

            return isReady ? (
              <Link key={m.href} href={m.href} className="block outline-none">
                {card}
              </Link>
            ) : (
              <div key={m.href} className="block outline-none">{card}</div>
            );
          })}
        </div>
      </div>

      {/* Recent activity placeholder */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-[600ms] fill-mode-both">
        <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-4">
          Recent Activity
        </p>
        <Card className="bg-muted/30 border-dashed border-2">
          <CardContent className="p-10 flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-3 bg-muted rounded-full">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Activity feed will populate as data is added across modules.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
