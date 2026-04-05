import "../styles/sakith.css";

export default function ScamWarning({ text, scamFlag }) {
  if (!text && !scamFlag) return null;

  if (scamFlag === "danger") {
    return <p className="warning">High-risk language detected. Avoid payments before verification.</p>;
  }

  if (scamFlag === "warning") {
    return <p className="warning warning-soft">This message looks a little risky. Double-check details.</p>;
  }

  const msg = text?.toLowerCase() || "";

  if (msg.includes("send money") || msg.includes("advance payment")) {
    return <p className="warning">High-risk language detected. Avoid payments before verification.</p>;
  }

  return null;
}
