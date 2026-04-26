import { useEffect, useState, useContext } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import apiRequest from "../../../lib/apiRequest";
import "./bookingManagement.scss";

const STATUS_LABEL = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  expired: "Expired",
};

function BookingCard({ booking, onAction }) {
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const act = async (endpoint, method = "put") => {
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest[method](`/bookings/${booking.id}${endpoint}`);
      onAction(booking.id, res.data.booking);
    } catch (err) {
      setError(err.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    setChatLoading(true);
    try {
      const res = await apiRequest.post("/chats", { receiverId: booking.student.id });
      navigate(`/sakith/chat/${res.data.id}`);
    } catch (err) {
      setError("Failed to open chat");
    } finally {
      setChatLoading(false);
    }
  };

  const { post, student, status, createdAt, applicantName, applicantPhone, applicantAddress, applicantNIC } = booking;

  return (
    <article className={`bookingCard status-${status}`}>
      <div className="bookingCardHeader">
        <div className="bookingCardMain">
          <Link to={`/${post.id}`} className="postTitle">{post.title}</Link>
          <span className="postMeta">
            {post.city}{post.area ? `, ${post.area}` : ""} &bull; LKR {post.rent}/month
          </span>
        </div>
        <span className={`statusBadge ${status}`}>{STATUS_LABEL[status]}</span>
      </div>

      <div className="studentInfo">
        <img src={student.avatar || "/noavatar.jpg"} alt="" />
        <div>
          <strong>{student.fullName || student.username}</strong>
          {student.phone && <span>{student.phone}</span>}
          <span className="requestedAt">Requested {new Date(createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {(applicantName || applicantPhone || applicantAddress || applicantNIC) && (
        <div className="applicantDetails">
          <p className="applicantDetailsTitle">Applicant Details</p>
          <div className="applicantGrid">
            {applicantName && (
              <div className="applicantField">
                <span className="fieldLabel">Full Name</span>
                <span className="fieldValue">{applicantName}</span>
              </div>
            )}
            {applicantPhone && (
              <div className="applicantField">
                <span className="fieldLabel">Phone</span>
                <span className="fieldValue">{applicantPhone}</span>
              </div>
            )}
            {applicantNIC && (
              <div className="applicantField">
                <span className="fieldLabel">NIC Number</span>
                <span className="fieldValue">{applicantNIC}</span>
              </div>
            )}
            {applicantAddress && (
              <div className="applicantField wide">
                <span className="fieldLabel">Permanent Address</span>
                <span className="fieldValue">{applicantAddress}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bookingActions">
        {status === "pending" && (
          <>
            <button className="actionBtn approve" onClick={() => act("/approve")} disabled={loading}>
              Approve
            </button>
            <button className="actionBtn reject" onClick={() => act("/reject")} disabled={loading}>
              Reject
            </button>
          </>
        )}
        {["pending", "approved", "confirmed"].includes(status) && (
          <>
            <button
              className="actionBtn chat"
              onClick={handleChat}
              disabled={chatLoading}
            >
              {chatLoading ? "Opening..." : "Chat with Student"}
            </button>
            <button className="actionBtn cancel" onClick={() => act("/cancel")} disabled={loading}>
              Cancel
            </button>
          </>
        )}
      </div>

      {error && <p className="cardError">{error}</p>}
    </article>
  );
}

function BookingManagementPage() {
  const { currentUser } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    apiRequest
      .get("/bookings")
      .then((res) => setBookings(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  if (currentUser?.role !== "boardingOwner") {
    return <Navigate to="/profile" replace />;
  }

  const handleAction = (bookingId, updated) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, ...updated } : b))
    );
  };

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    approved: bookings.filter((b) => b.status === "approved").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
  };

  return (
    <div className="bookingManagementPage">
      <div className="pageHeader">
        <div>
          <p className="eyebrow">Owner Dashboard</p>
          <h1>Booking Requests</h1>
          <p className="subtext">
            Review, approve, and chat with students who requested your listings.
          </p>
        </div>
        <Link to="/boardings" className="backLink">&larr; My Listings</Link>
      </div>

      <div className="statsRow">
        {[
          ["all", "Total"],
          ["pending", "Pending"],
          ["approved", "Approved"],
          ["confirmed", "Confirmed"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={`statChip ${filter === key ? "active" : ""}`}
            onClick={() => setFilter(key)}
          >
            <strong>{counts[key]}</strong>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="loadingText">Loading bookings...</p>
      ) : filtered.length === 0 ? (
        <div className="emptyState">
          <p>
            {filter === "all"
              ? "No booking requests yet. Students will appear here once they request your listings."
              : `No bookings with status "${STATUS_LABEL[filter] || filter}".`}
          </p>
        </div>
      ) : (
        <div className="bookingsList">
          {filtered.map((booking) => (
            <BookingCard key={booking.id} booking={booking} onAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  );
}

export default BookingManagementPage;
