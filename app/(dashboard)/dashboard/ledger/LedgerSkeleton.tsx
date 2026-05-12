const cx: React.CSSProperties = { maxWidth: "1280px", marginLeft: "auto", marginRight: "auto", paddingLeft: "clamp(1.25rem,4vw,3rem)", paddingRight: "clamp(1.25rem,4vw,3rem)", width: "100%" };
function Sh({ w, h, s }: { w?: string; h: string; s?: React.CSSProperties }) {
  return <div style={{ height: h, width: w ?? "100%", background: "rgba(255,255,255,0.06)", position: "relative", overflow: "hidden", ...s }}><div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)", animation: "shimmer 1.6s infinite" }} /></div>;
}
export default function LedgerSkeleton() {
  return (
    <>
      <style>{`@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}`}</style>
      <div style={{ position: "relative", zIndex: 10 }}><div style={cx}>
        <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div><Sh h="10px" w="80px" s={{ marginBottom: "0.75rem" }} /><Sh h="42px" w="200px" /></div>
          <Sh h="38px" w="110px" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", background: "rgba(255,255,255,0.07)", marginBottom: "2rem" }}>
          {[0, 1, 2].map((i) => <div key={i} style={{ background: "#000", padding: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}><Sh h="10px" w="100px" s={{ marginBottom: "1rem" }} /><Sh h="36px" w="160px" /></div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "0.75rem", marginBottom: "1rem" }}><Sh h="40px" /><Sh h="40px" w="120px" /><Sh h="40px" w="140px" /></div>
        <div style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}><Sh h="10px" w="60%" /></div>
          {Array.from({ length: 8 }).map((_, i) => <div key={i} style={{ padding: "0.85rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "grid", gridTemplateColumns: "1fr 2fr 1fr 1.2fr 1fr auto", gap: "1rem", alignItems: "center" }}><Sh h="11px" w="80%" /><Sh h="14px" w="90%" /><Sh h="11px" w="70%" /><Sh h="14px" w="80%" /><Sh h="18px" w="60px" /><Sh h="24px" w="60px" /></div>)}
        </div>
      </div></div>
    </>
  );
}
