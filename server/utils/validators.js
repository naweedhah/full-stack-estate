const nameRegex = /^[A-Za-z\s]+$/;
const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
const phoneRegex = /^07\d{8}$/;
/** 12 digits (new) or 10 digits + V/v (legacy) */
const nicRegex = /^(?:\d{12}|\d{10}[Vv])$/;

export function validateBookingPayload(body) {
  const errors = [];

  if (!body.fullName || !nameRegex.test(String(body.fullName).trim())) {
    errors.push("Full name must contain letters and spaces only.");
  }

  if (!body.gmail || !gmailRegex.test(String(body.gmail).trim())) {
    errors.push("Email must be a valid Gmail address ending with @gmail.com.");
  }

  if (!body.gender || !["male", "female"].includes(body.gender)) {
    errors.push("Gender must be male or female.");
  }

  if (!body.phone || !phoneRegex.test(String(body.phone).trim())) {
    errors.push("Phone must be 10 digits starting with 07.");
  }

  const nic = String(body.nic || "").trim().replace(/\s+/g, "");
  if (!nic || !nicRegex.test(nic)) {
    errors.push(
      "NIC must be 12 digits, or 10 digits followed by V or v."
    );
  }

  if (!body.address || !String(body.address).trim()) {
    errors.push("Address is required.");
  }

  const months = Number(body.monthsStay);
  if (!Number.isInteger(months) || months <= 0) {
    errors.push("Months to stay must be a positive whole number.");
  }

  const age = Number(body.age);
  if (!Number.isInteger(age) || age <= 0) {
    errors.push("Age must be a positive whole number.");
  }

  if (!body.rulesAcknowledgement || !String(body.rulesAcknowledgement).trim()) {
    errors.push("You must acknowledge the owner rules in the chat box.");
  }

  if (!body.roomType || !["single", "sharing"].includes(body.roomType)) {
    errors.push("Invalid room type.");
  }

  return errors;
}