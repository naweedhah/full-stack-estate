import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import {
  acceptInquiry,
  createInquiry,
  getInquiries,
  updateInquiryStatus,
} from "../services/sakithService";
import "../styles/sakith.css";

export default function InquiryBox() {
  const [inquiries, setInquiries] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [busyInquiryId, setBusyInquiryId] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const postId = searchParams.get("postId");
  const ownerId = searchParams.get("ownerId");
  const postTitle = searchParams.get("title");
  const inquiryType = searchParams.get("type") || "view";

  const isOwnerView = currentUser?.role === "boardingOwner" || currentUser?.role === "admin";

  const loadInquiries = async () => {
    try {
      const res = await getInquiries();
      setInquiries(res.data);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to load inquiries.",
      );
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleCreate = async () => {
    if (!postId || !ownerId) {
      setErrorMessage("Open this page from a listing to create a new inquiry.");
      return;
    }

    try {
      setIsCreating(true);
      setErrorMessage("");
      const res = await createInquiry({
        postId,
        ownerId,
        type: inquiryType,
      });
      setStatusMessage(res.data.message || "Inquiry sent successfully.");
      await loadInquiries();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to create inquiry.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleAccept = async (inquiryId) => {
    try {
      setBusyInquiryId(inquiryId);
      setErrorMessage("");
      const res = await acceptInquiry(inquiryId);
      setStatusMessage(res.data.message || "Inquiry accepted.");
      await loadInquiries();
      navigate(`/sakith/chat/${res.data.chat.id}`);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to accept inquiry.",
      );
    } finally {
      setBusyInquiryId("");
    }
  };

  const handleStatusChange = async (inquiryId, status) => {
    try {
      setBusyInquiryId(inquiryId);
      setErrorMessage("");
      const res = await updateInquiryStatus(inquiryId, status);
      setStatusMessage(res.data.message || "Inquiry updated.");
      await loadInquiries();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to update inquiry.",
      );
    } finally {
      setBusyInquiryId("");
    }
  };

  return (
    <div className="sakith-page">
      <div className="card">
        <h2>{isOwnerView ? "Manage Inquiries" : "Inquiry Center"}</h2>
        <p className="text-muted">
          {isOwnerView
            ? "Review incoming inquiries, accept valid ones, and open chats with students."
            : "Send an inquiry for a listing and track when the owner opens the conversation."}
        </p>

        {!isOwnerView && (
          <div className="info-panel mt-2">
            <strong>{postTitle || "Selected listing"}</strong>
            <p className="text-muted">
              {postId
                ? "When the owner accepts, the chat will open automatically."
                : "Pick a listing first, then use the inquiry button from that listing page."}
            </p>
            <button
              className="btn btn-primary mt-2"
              onClick={handleCreate}
              disabled={isCreating || !postId}
            >
              {isCreating ? "Sending Inquiry..." : "Send Inquiry"}
            </button>
          </div>
        )}

        {statusMessage && <p className="success-text mt-2">{statusMessage}</p>}
        {errorMessage && <p className="error-text mt-2">{errorMessage}</p>}
      </div>

      <div className="card">
        <h3>{isOwnerView ? "Incoming Inquiries" : "My Inquiries"}</h3>

        {inquiries.length === 0 ? (
          <p className="text-muted">No inquiries yet.</p>
        ) : (
          <div className="stack">
            {inquiries.map((inquiry) => (
              <div className="inquiry-item" key={inquiry.id}>
                <div>
                  <strong>{inquiry.post?.title || "Listing inquiry"}</strong>
                  <p className="text-muted">
                    Status: {inquiry.status}
                    {inquiry.type ? ` • Type: ${inquiry.type}` : ""}
                  </p>
                  <p className="text-muted">
                    Student: {inquiry.student?.fullName || inquiry.student?.username || "Unknown"}
                  </p>
                  <p className="text-muted">
                    Owner: {inquiry.owner?.fullName || inquiry.owner?.username || "Unknown"}
                  </p>
                </div>

                <div className="action-row">
                  {inquiry.chat?.id && (
                    <Link className="btn btn-primary" to={`/sakith/chat/${inquiry.chat.id}`}>
                      Open Chat
                    </Link>
                  )}

                  {isOwnerView && inquiry.status === "pending" && (
                    <>
                      <button
                        className="btn btn-teal"
                        onClick={() => handleAccept(inquiry.id)}
                        disabled={busyInquiryId === inquiry.id}
                      >
                        {busyInquiryId === inquiry.id ? "Opening..." : "Accept"}
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleStatusChange(inquiry.id, "rejected")}
                        disabled={busyInquiryId === inquiry.id}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {!isOwnerView && inquiry.status === "pending" && (
                    <button
                      className="btn btn-danger"
                      onClick={() => handleStatusChange(inquiry.id, "cancelled")}
                      disabled={busyInquiryId === inquiry.id}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
