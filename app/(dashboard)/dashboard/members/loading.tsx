import MembersTableSkeleton from "./MembersTableSkeleton";

export default function Loading() {
  return (
    <main
      className="relative grid-bg"
      style={{ minHeight: "calc(100vh - 52px)", paddingTop: "2.5rem", paddingBottom: "4rem" }}
    >
      <div className="noise-overlay" />
      <MembersTableSkeleton />
    </main>
  );
}
