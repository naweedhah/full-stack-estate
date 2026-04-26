import { useState } from "react";
import "./bookingModal.scss";

function BookingModal({ onConfirm, onClose, initialName = "", initialPhone = "", loading }) {
  const [form, setForm] = useState({
    applicantName: initialName,
    applicantPhone: initialPhone,
    applicantAddress: "",
    applicantNIC: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.applicantName.trim()) errs.applicantName = "Full name is required";
    if (!form.applicantPhone.trim()) errs.applicantPhone = "Phone number is required";
    if (!form.applicantAddress.trim()) errs.applicantAddress = "Permanent address is required";
    if (!form.applicantNIC.trim()) errs.applicantNIC = "NIC number is required";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onConfirm(form);
  };

  return (
    <div className="bookingModalOverlay" onClick={onClose}>
      <div className="bookingModal" onClick={(e) => e.stopPropagation()}>
        <button className="modalClose" onClick={onClose} type="button">&times;</button>
        <h2>Booking Application</h2>
        <p className="modalSubtitle">Please provide your details so the owner can review your request.</p>

        <form onSubmit={handleSubmit}>
          <div className="modalField">
            <label>Full Name</label>
            <input
              name="applicantName"
              value={form.applicantName}
              onChange={handleChange}
              placeholder="Your full name"
            />
            {errors.applicantName && <span className="modalErr">{errors.applicantName}</span>}
          </div>

          <div className="modalField">
            <label>Phone Number</label>
            <input
              name="applicantPhone"
              value={form.applicantPhone}
              onChange={handleChange}
              placeholder="e.g. 077 123 4567"
            />
            {errors.applicantPhone && <span className="modalErr">{errors.applicantPhone}</span>}
          </div>

          <div className="modalField">
            <label>Permanent Address</label>
            <textarea
              name="applicantAddress"
              value={form.applicantAddress}
              onChange={handleChange}
              placeholder="Your permanent home address"
              rows={3}
            />
            {errors.applicantAddress && <span className="modalErr">{errors.applicantAddress}</span>}
          </div>

          <div className="modalField">
            <label>NIC Number</label>
            <input
              name="applicantNIC"
              value={form.applicantNIC}
              onChange={handleChange}
              placeholder="e.g. 200012345678 or 981234567V"
            />
            {errors.applicantNIC && <span className="modalErr">{errors.applicantNIC}</span>}
          </div>

          <div className="modalActions">
            <button type="button" className="modalCancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="modalSubmit" disabled={loading}>
              {loading ? "Sending..." : "Submit Booking Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookingModal;
