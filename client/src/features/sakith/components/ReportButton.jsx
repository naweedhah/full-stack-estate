import { createReport } from "../services/sakithService";

export default function ReportButton({ chatId }) {
  const report = async () => {
    await createReport({
      targetId: chatId,
      reason: "scam message"
    });

    alert("Reported");
  };

  return (
    <button style={{ background: "var(--error)", color: "#fff" }}>
      Report
    </button>
  );
}