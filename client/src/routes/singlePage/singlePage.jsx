import "./singlePage.scss";
import Slider from "../../components/slider/Slider";
import Map from "../../components/map/Map";
import { Link, useNavigate, useLoaderData } from "react-router-dom";
import DOMPurify from "dompurify";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";

function SinglePage() {
  const post = useLoaderData();
  const [saved, setSaved] = useState(post.isSaved);
  const [bookingStatus, setBookingStatus] = useState(post.bookingRequestStatus);
  const [remainingSlots, setRemainingSlots] = useState(post.remainingSlots);
  const [bookingError, setBookingError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const bookingLocked =
    ["pending", "approved", "paymentPending", "confirmed"].includes(
      bookingStatus || ""
    );

  const canBook =
    currentUser &&
    currentUser.role === "student" &&
    currentUser.id !== post.ownerId &&
    post.status === "available" &&
    remainingSlots > 0 &&
    !bookingLocked;

  const handleSave = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setSaved((prev) => !prev);
    try {
      await apiRequest.post("/users/save", { postId: post.id });
    } catch (err) {
      console.log(err);
      setSaved((prev) => !prev);
    }
  };

  const handleBooking = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (currentUser.role !== "student") {
      setBookingError("Only students can send booking requests.");
      return;
    }

    setBookingError("");
    setBookingLoading(true);

    try {
      const res = await apiRequest.post(`/posts/${post.id}/book`);
      const nextStatus = res.data.bookingRequest?.status || "pending";
      setBookingStatus(nextStatus);
      setRemainingSlots((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.log(err);
      setBookingError(
        err.response?.data?.message || "Failed to send booking request"
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const bookingButtonLabel = (() => {
    if (bookingLoading) return "Sending Request...";
    if (!currentUser) return "Login to Book";
    if (currentUser.role !== "student") return "Students Only";
    if (currentUser.id === post.ownerId) return "Your Listing";
    if (bookingStatus === "pending") return "Request Pending";
    if (bookingStatus === "approved") return "Approved by Owner";
    if (bookingStatus === "paymentPending") return "Payment Pending";
    if (bookingStatus === "confirmed") return "Booking Confirmed";
    if (post.status !== "available") return "Currently Unavailable";
    if (remainingSlots < 1) return "No Slots Available";
    return "Book Now";
  })();

  return (
    <div className="singlePage">
      <div className="details">
        <div className="wrapper">
          <Slider images={post.images} />
          <div className="info">
            <div className="top">
              <div className="post">
                <h1>{post.title}</h1>
                <div className="address">
                  <img src="/pin.png" alt="" />
                  <span>
                    {post.address}
                    {post.area ? `, ${post.area}` : ""}
                  </span>
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
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.postDetail.description),
              }}
            ></div>
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
                <p>
                  {post.postDetail.mealsProvided
                    ? "Meals provided"
                    : "Meals not provided"}
                </p>
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
          <p className="title">Nearby Places</p>
          <div className="listHorizontal">
            <div className="feature">
              <img src="/school.png" alt="" />
              <div className="featureText">
                <span>Campus</span>
                <p>
                  {post.postDetail.nearestCampus || "Campus"}
                  {post.postDetail.distanceToCampus
                    ? ` • ${post.postDetail.distanceToCampus > 999
                        ? post.postDetail.distanceToCampus / 1000 + "km"
                        : post.postDetail.distanceToCampus + "m"} away`
                    : ""}
                </p>
              </div>
            </div>
            <div className="feature">
              <img src="/pet.png" alt="" />
              <div className="featureText">
                <span>Bus Stop</span>
                <p>
                  {post.postDetail.distanceToBusStop
                    ? `${post.postDetail.distanceToBusStop}m away`
                    : "Check with owner"}
                </p>
              </div>
            </div>
            <div className="feature">
              <img src="/fee.png" alt="" />
              <div className="featureText">
                <span>Town Center</span>
                <p>
                  {post.postDetail.distanceToTown
                    ? `${post.postDetail.distanceToTown}m away`
                    : "Check with owner"}
                </p>
              </div>
            </div>
          </div>
          <p className="title">Location</p>
          <div className="mapContainer">
            <Map items={[post]} />
          </div>
          <div className="buttons">
            <button
              onClick={handleBooking}
              disabled={!canBook || bookingLoading}
              className={!canBook || bookingLoading ? "disabledAction" : ""}
            >
              <img src="/chat.png" alt="" />
              {bookingButtonLabel}
            </button>
            <button
              onClick={handleSave}
              style={{
                backgroundColor: saved ? "#fece51" : "white",
              }}
            >
              <img src="/save.png" alt="" />
              {saved ? "Listing Saved" : "Save Listing"}
            </button>
          </div>
          {currentUser && currentUser.role === "student" && currentUser.id !== post.ownerId && (
            <div className="buttons">
              <Link
                to={`/sakith/inquiry?postId=${post.id}&ownerId=${post.ownerId}&title=${encodeURIComponent(post.title)}&type=view`}
              >
                <button>
                  <img src="/chat.png" alt="" />
                  Send Inquiry
                </button>
              </Link>
            </div>
          )}
          {bookingError && <p className="bookingError">{bookingError}</p>}
        </div>
      </div>
    </div>
  );
}

export default SinglePage;
