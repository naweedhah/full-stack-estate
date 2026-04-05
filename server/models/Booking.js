import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    boardingId: { type: String, required: true },
    boardingTitle: { type: String, required: true },

    roomType: { type: String, enum: ["single", "sharing"], required: true },

    fullName: { type: String, required: true },
    attachmentUrl: { type: String, default: "" },
    gmail: { type: String, required: true },
    gender: { type: String, enum: ["male", "female"], required: true },

    phone: { type: String, required: true }, // student phone
    ownerPhone: { type: String, default: "" }, // ✅ NEW

    nic: { type: String, required: true },
    address: { type: String, required: true },
    monthsStay: { type: Number, required: true },
    age: { type: Number, required: true },
    rulesAcknowledgement: { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);