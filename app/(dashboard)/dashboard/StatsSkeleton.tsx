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

export default function StatsSkeleton() {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
      <div style={{ position: "relative", zIndex: 10 }}>
        <div style={cx}>
          {/* Greeting skeleton */}
          <div style={{ marginBottom: "2.5rem" }}>
            <Shimmer height="10px" width="160px" style={{ marginBottom: "0.75rem" }} />
            <Shimmer height="42px" width="280px" />
          </div>

          <Shimmer height="1px" style={{ marginBottom: "2.5rem" }} />

          {/* Stat cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1px",
              background: "rgba(255,255,255,0.07)",
              marginBottom: "3rem",
            }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ background: "#000", padding: "1.75rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <Shimmer height="10px" width="100px" style={{ marginBottom: "1rem" }} />
                <Shimmer height="48px" width="80px" style={{ marginBottom: "0.5rem" }} />
                <Shimmer height="10px" width="120px" />
              </div>
            ))}
          </div>

          {/* Module grid */}
          <Shimmer height="10px" width="80px" style={{ marginBottom: "1.25rem" }} />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1px",
              background: "rgba(255,255,255,0.07)",
              marginBottom: "3rem",
            }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ background: "#000", padding: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <Shimmer height="18px" width="140px" style={{ marginBottom: "0.75rem" }} />
                <Shimmer height="11px" style={{ marginBottom: "0.4rem" }} />
                <Shimmer height="11px" width="70%" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
