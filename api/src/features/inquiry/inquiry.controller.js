let inquiries = [];

exports.createInquiry = (req, res) => {
  const { postId, ownerId, type } = req.body;

  const inquiry = {
    id: Date.now().toString(),
    studentId: req.user?.id || "student1",
    ownerId,
    postId,
    type,
    status: "pending",
    chatId: null
  };

  inquiries.push(inquiry);

  res.json(inquiry);
};


exports.createInquiry = (req, res) => {
  const { postId, ownerId, type } = req.body;

  const inquiry = {
    id: Date.now().toString(),
    studentId: req.user?.id || "student1",
    ownerId,
    postId,
    type,
    status: "pending",
    chatId: null
  };

  inquiries.push(inquiry);

  res.json(inquiry);
};