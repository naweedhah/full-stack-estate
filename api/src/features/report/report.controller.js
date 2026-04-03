exports.createReport = async (req, res) => {
  try {
    const report = {
      reporter: req.user.id,
      targetId: req.body.targetId,
      reason: req.body.reason,
      status: "pending"
    };

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.reviewReport = async (req, res) => {
  res.json({ message: "Report reviewed" });
};


let reports = [];

exports.createReport = (req, res) => {
  const { targetId, reason } = req.body;

  const report = {
    id: Date.now().toString(),
    targetId,
    reason,
    status: "pending"
  };

  reports.push(report);

  res.json(report);
};

exports.warnUser = (req, res) => {
  const { userId } = req.body;

  // In real system this will go to DB / notifications
  console.log(`⚠️ Warning sent to user: ${userId}`);

  res.json({
    message: `Warning issued to user ${userId}`
  });
};

exports.resolveReport = (req, res) => {
  const { id } = req.params;

  const report = reports.find(r => r.id === id);

  if (!report) {
    return res.status(404).json({ message: "Not found" });
  }

  report.status = "resolved";

  // 🔥 NEW LOGIC
  if (report.reason.toLowerCase().includes("scam")) {
    console.log("⚠️ Scam detected → warning user");

    // simulate warning
    console.log(`⚠️ Warning sent to owner of target: ${report.targetId}`);
  }

  res.json({
    message: "Report resolved and action taken",
    report
  });
};