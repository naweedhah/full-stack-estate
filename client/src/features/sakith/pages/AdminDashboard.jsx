import "../styles/sakith.css";
import { useEffect, useState } from "react";
import {
  getReports,
  resolveReport,
  warnUser
} from "../services/sakithService";

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [busyReportId, setBusyReportId] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await getReports();
      setReports(res.data);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to load reports.",
      );
    }
  };

  const handleResolve = async (reportId, status = "resolved") => {
    try {
      setBusyReportId(reportId);
      setErrorMessage("");
      const res = await resolveReport(reportId, { status });
      setStatusMessage(res.data.message || "Report updated.");
      await load();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to update report.",
      );
    } finally {
      setBusyReportId("");
    }
  };

  const handleWarn = async (reportId) => {
    try {
      setBusyReportId(reportId);
      setErrorMessage("");
      const res = await warnUser(reportId);
      setStatusMessage(res.data.message || "Warning sent.");
      await load();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to warn user.",
      );
    } finally {
      setBusyReportId("");
    }
  };

  return (
    <div className="sakith-page">
      <div className="card">
        <h2>Admin Moderation Dashboard</h2>
        <p className="text-muted">
          Review reports, warn reported users, and close or dismiss cases.
        </p>
        {statusMessage && <p className="success-text mt-2">{statusMessage}</p>}
        {errorMessage && <p className="error-text mt-2">{errorMessage}</p>}
      </div>

      <div className="card">
        {reports.length === 0 ? (
          <p className="text-muted">No reports available.</p>
        ) : (
          <div className="stack">
            {reports.map((report) => (
              <div key={report.id} className="inquiry-item">
                <div>
                  <strong>{report.reason}</strong>
                  <p className="text-muted">
                    Status: {report.status} • Target: {report.targetType}
                  </p>
                  <p className="text-muted">
                    Reporter: {report.reporter?.fullName || report.reporter?.username || "Unknown"}
                  </p>
                  {report.post?.title && (
                    <p className="text-muted">Listing: {report.post.title}</p>
                  )}
                  {report.description && (
                    <p className="text-muted">{report.description}</p>
                  )}
                  {report.reputation && (
                    <p className="text-muted">
                      Target history: {report.reputation.openCount} open, {report.reputation.resolvedCount} resolved, {report.reputation.dismissedCount} dismissed
                    </p>
                  )}
                </div>

                <div className="action-row">
                  <button
                    className="btn btn-teal"
                    onClick={() => handleWarn(report.id)}
                    disabled={busyReportId === report.id}
                  >
                    {busyReportId === report.id ? "Updating..." : "Warn User"}
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleResolve(report.id, "resolved")}
                    disabled={busyReportId === report.id}
                  >
                    Resolve
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleResolve(report.id, "dismissed")}
                    disabled={busyReportId === report.id}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
