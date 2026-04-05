import "../styles/sakith.css";
import { useState } from "react";

import { createReport } from "../services/sakithService";

export default function ReportButton({ messageId, postId }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReport = async () => {
    const reason = window.prompt(
      "Why are you reporting this message?",
      "Suspicious or scam-related message",
    );

    if (!reason?.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await createReport({
        targetId: messageId,
        targetType: "message",
        reason,
        postId,
      });
      window.alert("Report submitted successfully.");
    } catch (error) {
      window.alert(
        error.response?.data?.message || "Failed to submit your report.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      className="btn btn-danger mt-1"
      onClick={handleReport}
      disabled={isSubmitting || !messageId}
    >
      {isSubmitting ? "Reporting..." : "Report"}
    </button>
  );
}
