import { Await, Link, useLoaderData } from "react-router-dom";
import { Suspense, useState } from "react";
import apiRequest from "../../../lib/apiRequest";
import List from "../../../components/list/List";
import "./watchlistPage.scss";

const defaultAlertForm = {
  city: "",
  area: "",
  minBudget: "",
  maxBudget: "",
  preferredTenantGender: "",
  boardingType: "",
  minCapacity: "",
  wifiRequired: false,
  mealsRequired: false,
  attachedBathroomNeeded: false,
};

function WatchlistContent({ savedPosts, initialSearchAlerts, initialPreferences }) {
  const [searchAlerts, setSearchAlerts] = useState(initialSearchAlerts || []);
  const [preferences, setPreferences] = useState(initialPreferences || null);
  const [form, setForm] = useState(defaultAlertForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSavingAlert, setIsSavingAlert] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePreferenceChange = async (event) => {
    const { name, checked } = event.target;

    try {
      setIsSavingPreferences(true);
      setError("");
      const res = await apiRequest.put("/users/notifications/preferences", {
        [name]: checked,
      });
      setPreferences(res.data);
      setMessage("Notification preferences updated.");
    } catch (err) {
      console.log(err);
      setError(
        err.response?.data?.message || "Failed to update notification preferences.",
      );
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleCreateAlert = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSavingAlert(true);

    try {
      const res = await apiRequest.post("/users/watchlists/searches", form);
      setSearchAlerts((prev) => [res.data, ...prev]);
      setForm(defaultAlertForm);
      setMessage("Saved search alert created.");
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to save search alert.");
    } finally {
      setIsSavingAlert(false);
    }
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      await apiRequest.delete(`/users/watchlists/searches/${alertId}`);
      setSearchAlerts((prev) => prev.filter((item) => item.id !== alertId));
      setMessage("Saved search alert removed.");
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to delete saved alert.");
    }
  };

  return (
    <div className="watchlistPage">
      <section className="heroCard">
        <div>
          <p className="eyebrow">Quick Access</p>
          <h1>Your Watchlist</h1>
          <p className="heroText">
            Revisit saved boardings, build search alerts, and control which smart
            notifications reach you in real time.
          </p>
        </div>
        <div className="summaryCard">
          <strong>{savedPosts.length}</strong>
          <span>Saved boardings ready to review</span>
        </div>
      </section>

      {(message || error) && (
        <section className="feedbackRow">
          {message && <p className="successText">{message}</p>}
          {error && <p className="errorText">{error}</p>}
        </section>
      )}

      <section className="watchlistSection">
        <div className="sectionHeading">
          <div>
            <p className="eyebrow">Saved Boardings</p>
            <h2>Boardings You Are Tracking</h2>
          </div>
          <Link to="/list">Browse More</Link>
        </div>

        {savedPosts.length > 0 ? (
          <List posts={savedPosts} />
        ) : (
          <div className="emptyPanel">
            <p>
              Your watchlist is empty right now. Save boardings from the listing
              pages to see them here for quick access.
            </p>
            <Link to="/list">
              <button>Find Boardings</button>
            </Link>
          </div>
        )}
      </section>

      <section className="settingsGrid">
        <article className="settingsPanel">
          <div className="sectionHeading">
            <div>
              <p className="eyebrow">Search Alerts</p>
              <h2>Saved Search Notifications</h2>
            </div>
          </div>

          <form className="alertForm" onSubmit={handleCreateAlert}>
            <label>
              <span>City</span>
              <input name="city" value={form.city} onChange={handleFormChange} required />
            </label>
            <label>
              <span>Area</span>
              <input name="area" value={form.area} onChange={handleFormChange} />
            </label>
            <label>
              <span>Min Budget</span>
              <input name="minBudget" type="number" value={form.minBudget} onChange={handleFormChange} />
            </label>
            <label>
              <span>Max Budget</span>
              <input name="maxBudget" type="number" value={form.maxBudget} onChange={handleFormChange} />
            </label>
            <label>
              <span>Boarding Type</span>
              <select name="boardingType" value={form.boardingType} onChange={handleFormChange}>
                <option value="">Any</option>
                <option value="singleRoom">Single Room</option>
                <option value="sharedRoom">Shared Room</option>
                <option value="annex">Annex</option>
                <option value="hostel">Hostel</option>
                <option value="houseShare">House Share</option>
              </select>
            </label>
            <label>
              <span>Preferred Tenant Gender</span>
              <select
                name="preferredTenantGender"
                value={form.preferredTenantGender}
                onChange={handleFormChange}
              >
                <option value="">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="any">Any</option>
              </select>
            </label>
            <label className="checkboxLabel">
              <input
                type="checkbox"
                name="wifiRequired"
                checked={form.wifiRequired}
                onChange={handleFormChange}
              />
              <span>Wi-Fi required</span>
            </label>
            <label className="checkboxLabel">
              <input
                type="checkbox"
                name="mealsRequired"
                checked={form.mealsRequired}
                onChange={handleFormChange}
              />
              <span>Meals required</span>
            </label>
            <label className="checkboxLabel">
              <input
                type="checkbox"
                name="attachedBathroomNeeded"
                checked={form.attachedBathroomNeeded}
                onChange={handleFormChange}
              />
              <span>Attached bathroom</span>
            </label>
            <button disabled={isSavingAlert}>
              {isSavingAlert ? "Saving..." : "Save Search Alert"}
            </button>
          </form>

          <div className="savedAlertsList">
            {searchAlerts.length > 0 ? (
              searchAlerts.map((alert) => (
                <div className="savedAlertItem" key={alert.id}>
                  <div>
                    <strong>{alert.area || alert.city}</strong>
                    <span>
                      {alert.city}
                      {alert.minBudget || alert.maxBudget
                        ? ` • LKR ${alert.minBudget || 0} - ${alert.maxBudget || "Any"}`
                        : ""}
                    </span>
                  </div>
                  <button type="button" onClick={() => handleDeleteAlert(alert.id)}>
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <p className="emptyText">
                You have not created any saved search alerts yet.
              </p>
            )}
          </div>
        </article>

        <article className="settingsPanel">
          <div className="sectionHeading">
            <div>
              <p className="eyebrow">Preferences</p>
              <h2>Notification Controls</h2>
            </div>
          </div>

          <div className="preferenceList">
            {[
              ["inAppEnabled", "In-app notifications"],
              ["pushEnabled", "Push notifications"],
              ["bookingUpdates", "Booking and inquiry updates"],
              ["watchlistAlerts", "Watchlist alerts"],
              ["searchAlerts", "Saved search alerts"],
              ["priceAlerts", "Price drop alerts"],
              ["demandAlerts", "Demand spike alerts"],
              ["roommateAlerts", "Roommate match alerts"],
              ["safetyAlerts", "Safety alerts"],
            ].map(([key, label]) => (
              <label className="preferenceItem" key={key}>
                <div>
                  <strong>{label}</strong>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(preferences?.[key])}
                  onChange={handlePreferenceChange}
                  name={key}
                  disabled={isSavingPreferences}
                />
              </label>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function WatchlistPage() {
  const data = useLoaderData();

  return (
    <Suspense fallback={<p>Loading watchlist...</p>}>
      <Await
        resolve={Promise.all([
          data.postResponse,
          data.searchAlertResponse,
          data.preferenceResponse,
        ])}
        errorElement={<p>Failed to load watchlist!</p>}
      >
        {([postResponse, searchAlertResponse, preferenceResponse]) => (
          <WatchlistContent
            savedPosts={postResponse.data.savedPosts || []}
            initialSearchAlerts={searchAlertResponse.data || []}
            initialPreferences={preferenceResponse.data || null}
          />
        )}
      </Await>
    </Suspense>
  );
}

export default WatchlistPage;
