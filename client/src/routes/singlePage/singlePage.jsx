import "./singlePage.scss";
import Slider from "../../components/slider/Slider";
import Map from "../../components/map/Map";
import { Link, useNavigate, useLoaderData } from "react-router-dom";
import DOMPurify from "dompurify";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import BookingModal from "../../features/booking/components/BookingModal";

const demandLabelMap = {
  high: "High demand",
  medium: "Medium demand",
  low: "Low demand",
};

function SinglePage() {
  const post = useLoaderData();
  const [saved, setSaved] = useState(post.isSaved);
  const [bookingStatus, setBookingStatus] = useState(post.bookingRequestStatus);
  const [bookingRequestId, setBookingRequestId] = useState(post.bookingRequestId);
  const [remainingSlots, setRemainingSlots] = useState(post.remainingSlots);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMsg, setReviewMsg] = useState("");
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    apiRequest.get(`/posts/${post.id}/reviews`).then((res) => {
      setReviews(res.data.reviews);
      setAvgRating(res.data.avgRating);
      const mine = res.data.reviews.find((r) => r.userId === currentUser?.id);
      if (mine) { setMyRating(mine.rating); setMyComment(mine.comment || ""); }
    }).catch(() => {});
  }, [post.id, currentUser?.id]);
  const navigate = useNavigate();

  const bookingLocked = ["pending", "approved", "confirmed"].includes(bookingStatus || "");

  const canBook =
    currentUser &&
    currentUser.role === "student" &&
    currentUser.id !== post.ownerId &&
    post.status === "available" &&
    remainingSlots > 0 &&
    !bookingLocked;

  const handleSave = async () => {
    if (!currentUser) { navigate("/login"); return; }
    setSaved((prev) => !prev);
    try {
      await apiRequest.post("/users/save", { postId: post.id });
    } catch (err) {
      console.log(err);
      setSaved((prev) => !prev);
    }
  };

  const handleBookNowClick = () => {
    if (!currentUser) { navigate("/login"); return; }
    if (currentUser.role !== "student") {
      setBookingError("Only students can send booking requests.");
      return;
    }
    setBookingError("");
    setShowBookingModal(true);
  };

  const handleBooking = async (kycData) => {
    setBookingLoading(true);
    try {
      const res = await apiRequest.post(`/posts/${post.id}/book`, kycData);
      const br = res.data.bookingRequest;
      setBookingStatus(br?.status || "pending");
      setBookingRequestId(br?.id || null);
      setRemainingSlots((prev) => Math.max(0, prev - 1));
      setShowBookingModal(false);
    } catch (err) {
      console.log(err);
      setBookingError(err.response?.data?.message || "Failed to send booking request");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleOpenChat = async () => {
    if (!currentUser) { navigate("/login"); return; }
    setChatLoading(true);
    try {
      const res = await apiRequest.post("/chats", { receiverId: post.ownerId });
      navigate(`/sakith/chat/${res.data.id}`);
    } catch (err) {
      console.log(err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!myRating) { setReviewMsg("Please select a rating."); return; }
    setReviewLoading(true);
    setReviewMsg("");
    try {
      const res = await apiRequest.post(`/posts/${post.id}/reviews`, { rating: myRating, comment: myComment });
      const updated = res.data.review;
      setReviews((prev) => {
        const exists = prev.find((r) => r.userId === currentUser.id);
        return exists
          ? prev.map((r) => (r.userId === currentUser.id ? updated : r))
          : [updated, ...prev];
      });
      const all = reviews.filter((r) => r.userId !== currentUser.id);
      const allRatings = [...all.map((r) => r.rating), myRating];
      setAvgRating(Math.round((allRatings.reduce((s, r) => s + r, 0) / allRatings.length) * 10) / 10);
      setReviewMsg("Review saved!");
    } catch (err) {
      setReviewMsg(err.response?.data?.message || "Failed to save review.");
    } finally {
      setReviewLoading(false);
    }
  };

  const bookingButtonLabel = (() => {
    if (bookingLoading) return "Sending...";
    if (!currentUser) return "Login to Book";
    if (currentUser.role !== "student") return "Students Only";
    if (currentUser.id === post.ownerId) return "Your Listing";
    if (bookingStatus === "pending") return "Request Pending";
    if (bookingStatus === "approved") return "Booking Approved";
    if (bookingStatus === "confirmed") return "Booking Confirmed";
    if (post.status !== "available") return "Currently Unavailable";
    if (remainingSlots < 1) return "No Slots Available";
    return "Book Now";
  })();

  const showChatButton =
    currentUser &&
    currentUser.role === "student" &&
    currentUser.id !== post.ownerId &&
    ["pending", "approved", "confirmed"].includes(bookingStatus || "");

  return (
    <div className="singlePage">
      <div className="details">
        <div className="wrapper">
          <Slider images={post.images} />
          <div className="info">
            <div className="top">
              <div className="post">
                <h1>{post.title}</h1>
                <div className={`demandPill ${post.demandLevel || "low"}`}>
                  <strong>{demandLabelMap[post.demandLevel] || "Low demand"}</strong>
                  <span>
                    {post.savedCount || 0} saves &bull; {post.inquiryCount || 0} inquiries &bull; {post.bookingCount || 0} bookings
                  </span>
                </div>
                <div className="address">
                  <img src="/pin.png" alt="" />
                  <span>{post.address}{post.area ? `, ${post.area}` : ""}</span>
                </div>
                <div className="price">LKR {post.rent}/month</div>
              </div>
              <div className="user">
                <img src={post.owner.avatar || "/noavatar.jpg"} alt="" />
                <span>{post.owner.username}</span>
              </div>
            </div>

            <div
              className="bottom"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.postDetail.description) }}
            />

            <div className="actions">
              <div className="buttons">
                <button
                  onClick={handleBookNowClick}
                  disabled={!canBook || bookingLoading}
                  className={!canBook || bookingLoading ? "disabledAction" : ""}
                >
                  <img src="/chat.png" alt="" />
                  {bookingButtonLabel}
                </button>
                <button onClick={handleSave} style={{ backgroundColor: saved ? "#fece51" : "white" }}>
                  <img src="/save.png" alt="" />
                  {saved ? "Listing Saved" : "Save Listing"}
                </button>
              </div>

              {showChatButton && (
                <div className="buttons">
                  <button onClick={handleOpenChat} disabled={chatLoading} className="chatOwnerBtn">
                    <img src="/chat.png" alt="" />
                    {chatLoading ? "Opening..." : "Message Owner"}
                  </button>
                </div>
              )}

              {currentUser && currentUser.role === "student" && currentUser.id !== post.ownerId && (
                <div className="buttons">
                  <Link to={`/sakith/inquiry?postId=${post.id}&ownerId=${post.ownerId}&title=${encodeURIComponent(post.title)}&type=view`}>
                    <button>
                      <img src="/chat.png" alt="" />
                      Send Inquiry
                    </button>
                  </Link>
                </div>
              )}

              {bookingStatus === "approved" && currentUser?.role === "student" && (
                <div className="approvedNotice">
                  Your booking was approved! Message the owner to arrange visit and payment details.
                </div>
              )}

              {bookingError && <p className="bookingError">{bookingError}</p>}
            </div>

            <div className="reviewsSection">
              <div className="reviewsHeader">
                <h3>Reviews &amp; Ratings</h3>
                {avgRating && (
                  <div className="avgRating">
                    <span className="stars">{"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))}</span>
                    <strong>{avgRating}</strong>
                    <span className="reviewCount">({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>
                  </div>
                )}
              </div>

              {currentUser?.role === "student" && currentUser.id !== post.ownerId && (
                <form className="reviewForm" onSubmit={handleReviewSubmit}>
                  <p className="reviewFormLabel">Leave your rating</p>
                  <div className="starPicker">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`starBtn ${myRating >= star ? "filled" : ""}`}
                        onClick={() => setMyRating(star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    placeholder="Write a comment (optional)..."
                    value={myComment}
                    onChange={(e) => setMyComment(e.target.value)}
                    rows={2}
                  />
                  {reviewMsg && (
                    <p className={reviewMsg === "Review saved!" ? "reviewSuccess" : "reviewError"}>
                      {reviewMsg}
                    </p>
                  )}
                  <button type="submit" className="submitReviewBtn" disabled={reviewLoading}>
                    {reviewLoading ? "Saving..." : "Submit Review"}
                  </button>
                </form>
              )}

              <div className="reviewList">
                {reviews.length === 0 ? (
                  <p className="noReviews">No reviews yet. Be the first to leave one!</p>
                ) : (
                  reviews.map((r) => (
                    <div className="reviewCard" key={r.id}>
                      <div className="reviewCardTop">
                        <img src={r.user.avatar || "/noavatar.jpg"} alt="" />
                        <div>
                          <strong>{r.user.fullName || r.user.username}</strong>
                          <span className="reviewStars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                        </div>
                        <span className="reviewDate">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      {r.comment && <p className="reviewComment">{r.comment}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="features">
        <div className="wrapper">
          <p className="title">General</p>
          <div className="listVertical">
            <div className="feature">
              <img src="/utility.png" alt="" />
              <div className="featureText">
                <span>Wi-Fi</span>
                <p>{post.postDetail.wifi ? "Available" : "Not available"}</p>
              </div>
            </div>
            <div className="feature">
              <img src="/pet.png" alt="" />
              <div className="featureText">
                <span>Meals</span>
                <p>{post.postDetail.mealsProvided ? "Meals provided" : "Meals not provided"}</p>
              </div>
            </div>
            <div className="feature">
              <img src="/fee.png" alt="" />
              <div className="featureText">
                <span>Rules</span>
                <p>{post.postDetail.rules || "Contact owner for details"}</p>
              </div>
            </div>
          </div>

          <p className="title">Sizes</p>
          <div className="sizes">
            <div className="size">
              <img src="/size.png" alt="" />
              <span>{post.boardingType}</span>
            </div>
            <div className="size">
              <img src="/bed.png" alt="" />
              <span>{remainingSlots} available slots</span>
            </div>
            <div className="size">
              <img src="/bath.png" alt="" />
              <span>{post.bathroomCount || 0} bathrooms</span>
            </div>
          </div>

          <p className="title">Demand Intelligence</p>
          <div className="demandInsightBox">
            <strong>{demandLabelMap[post.demandLevel] || "Low demand"} listing</strong>
            <p>This score is based on how many students saved, inquired about, and tried to book this boarding.</p>
            <div className="demandStats">
              <span>{post.savedCount || 0} saves</span>
              <span>{post.inquiryCount || 0} inquiries</span>
              <span>{post.bookingCount || 0} bookings</span>
            </div>
          </div>

          <p className="title">Nearby Places</p>
          <div className="listHorizontal">
            <div className="feature">
              <img src="/school.png" alt="" />
              <div className="featureText">
                <span>Campus</span>
                <p>
                  {post.postDetail.nearestCampus || "Campus"}
                  {post.postDetail.distanceToCampus
                    ? ` • ${post.postDetail.distanceToCampus > 999 ? post.postDetail.distanceToCampus / 1000 + "km" : post.postDetail.distanceToCampus + "m"} away`
                    : ""}
                </p>
              </div>
            </div>
            <div className="feature">
              <img src="/pet.png" alt="" />
              <div className="featureText">
                <span>Bus Stop</span>
                <p>{post.postDetail.distanceToBusStop ? `${post.postDetail.distanceToBusStop}m away` : "Check with owner"}</p>
              </div>
            </div>
            <div className="feature">
              <img src="/fee.png" alt="" />
              <div className="featureText">
                <span>Town Center</span>
                <p>{post.postDetail.distanceToTown ? `${post.postDetail.distanceToTown}m away` : "Check with owner"}</p>
              </div>
            </div>
          </div>

          <p className="title">Location</p>
          <div className="mapContainer">
            <Map items={[post]} focusSingleItem />
          </div>
        </div>
      </div>

      {showBookingModal && (
        <BookingModal
          onConfirm={handleBooking}
          onClose={() => { setShowBookingModal(false); setBookingError(""); }}
          initialName={currentUser?.fullName || currentUser?.username || ""}
          initialPhone={currentUser?.phone || ""}
          loading={bookingLoading}
        />
      )}
    </div>
  );
}

export default SinglePage;
