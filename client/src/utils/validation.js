export const nameLettersOnly = (v) => /^[A-Za-z\s]+$/.test(String(v).trim());

export const gmailValid = (v) =>
  /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(String(v).trim());

export const phoneValid = (v) => /^07\d{8}$/.test(String(v).trim());

/** 12 digits (new NIC) or 10 digits + V/v (old format) */
export const nicValid = (v) => {
  const value = String(v).trim().replace(/\s+/g, "");
  return /^(?:\d{12}|\d{10}[Vv])$/.test(value);
};

export const positiveInt = (v) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0;
};