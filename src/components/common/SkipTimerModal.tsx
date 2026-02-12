import { formatTime } from "../../utils";

interface SkipTimerModalProps {
  timerLabel: string;
  timeLeft: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SkipTimerModal({ timerLabel, timeLeft, onConfirm, onCancel }: SkipTimerModalProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(60,45,30,0.4)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 24,
          padding: "28px 24px",
          maxWidth: 380,
          width: "100%",
          boxShadow: "0 16px 48px rgba(60,45,30,0.2)",
          animation: "slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <div style={{ fontSize: 28, textAlign: "center", marginBottom: 12 }}>⏱️</div>
        <div
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "var(--color-heading)",
            textAlign: "center",
            marginBottom: 10,
            fontFamily: "var(--font-display)",
          }}
        >
          Timer still running
        </div>
        <div
          style={{
            fontSize: 14,
            color: "var(--color-text)",
            textAlign: "center",
            lineHeight: 1.55,
            marginBottom: 8,
          }}
        >
          <strong>{timerLabel}</strong> still has <strong>{formatTime(timeLeft)}</strong> remaining.
        </div>
        <div
          style={{
            fontSize: 13,
            color: "var(--color-muted)",
            textAlign: "center",
            lineHeight: 1.5,
            marginBottom: 24,
          }}
        >
          Skipping may mean things are under-cooked. Are you sure?
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              background: "transparent",
              border: "2px solid var(--color-border)",
              borderRadius: 14,
              padding: "12px 16px",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--color-text)",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
            }}
          >
            Keep waiting
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              background: "#D4875E",
              border: "none",
              borderRadius: 14,
              padding: "12px 16px",
              fontSize: 14,
              fontWeight: 600,
              color: "white",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
            }}
          >
            Skip anyway
          </button>
        </div>
      </div>
    </div>
  );
}
