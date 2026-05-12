const cx: React.CSSProperties = {
  maxWidth: "1280px",
  marginLeft: "auto",
  marginRight: "auto",
  paddingLeft: "clamp(1.25rem, 4vw, 3rem)",
  paddingRight: "clamp(1.25rem, 4vw, 3rem)",
  width: "100%",
};

function Shimmer({ width, height, style }: { width?: string; height: string; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        height,
        width: width ?? "100%",
        background: "rgba(255,255,255,0.06)",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
          animation: "shimmer 1.6s infinite",
        }}
      />
    </div>
  );
}

export default function MembersTableSkeleton() {
  return (
    <>
      <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
      <div style={{ position: "relative", zIndex: 10 }}>
        <div style={cx}>
          <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <Shimmer height="10px" width="100px" style={{ marginBottom: "0.75rem" }} />
              <Shimmer height="42px" width="200px" />
            </div>
            <Shimmer height="38px" width="120px" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <Shimmer height="40px" />
            <Shimmer height="40px" width="120px" />
            <Shimmer height="40px" width="120px" />
          </div>
          <div style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
              <Shimmer height="10px" width="60%" />
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ padding: "0.85rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 0.8fr", gap: "1rem", alignItems: "center" }}>
                <div>
                  <Shimmer height="14px" width="140px" style={{ marginBottom: "6px" }} />
                  <Shimmer height="10px" width="80px" />
                </div>
                <Shimmer height="11px" width="90%" />
                <Shimmer height="11px" width="60%" />
                <Shimmer height="18px" width="70px" />
                <Shimmer height="11px" width="50px" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
