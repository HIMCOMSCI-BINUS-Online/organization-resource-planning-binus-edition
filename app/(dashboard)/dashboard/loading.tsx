import StatsSkeleton from "./StatsSkeleton";

export default function Loading() {
  return (
    <main
      className="relative grid-bg"
      style={{ minHeight: "calc(100vh - 52px)", paddingTop: "3rem", paddingBottom: "4rem" }}
    >
      <div className="noise-overlay" />
      <StatsSkeleton />
    </main>
  );
}
