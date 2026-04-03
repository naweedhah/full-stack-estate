const axios = require("axios");

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


exports.getInquiries = (req, res) => {
  res.json(inquiries);
};

exports.updateStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const inquiry = inquiries.find(i => i.id === id);
  if (!inquiry) return res.status(404).json({ message: "Not found" });

  inquiry.status = status;

  res.json({
    message: "Inquiry updated",
    inquiry
  });
};

exports.acceptInquiry = async (req, res) => {
  const { id } = req.params;

  const inquiry = inquiries.find(i => i.id === id);

  if (!inquiry) {
    return res.status(404).json({ message: "Inquiry not found" });
  }

  // update status
  inquiry.status = "accepted";

  try {
    const chatRes = await axios.post(
      "http://localhost:5000/api/sakith-chat/create",
      {
        inquiryId: id,
        studentId: inquiry.studentId,
        ownerId: inquiry.ownerId
      }
    );

    // link chat to inquiry
    inquiry.chatId = chatRes.data.id;

    res.json({
      message: "Inquiry approved and chat created",
      inquiry,
      chat: chatRes.data
    });

  } catch (error) {
    res.status(500).json({
      message: "Chat creation failed",
      error: error.message
    });
  }
};