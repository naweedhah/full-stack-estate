import { useContext, useEffect, useRef, useState } from "react";
import "./chat.scss";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import { format } from "timeago.js";
import { SocketContext } from "../../context/SocketContext";

function Chat({ chats, initialChatId = null }) {
  const [chat, setChat] = useState(null);
  const [isOpeningChat, setIsOpeningChat] = useState(false);
  const [isChatDismissed, setIsChatDismissed] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const messageEndRef = useRef();

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleOpenChat = async (id, receiver) => {
    setIsChatDismissed(false);
    setIsOpeningChat(true);
    setChat((prev) => ({
      id,
      receiver,
      messages: prev?.id === id ? prev.messages || [] : [],
    }));

    try {
      const res = await apiRequest("/chats/" + id);
      setChat({ ...res.data, receiver });
    } catch (err) {
      console.log(err);
      setChat((prev) => ({
        id,
        receiver,
        messages: prev?.messages || [],
      }));
    } finally {
      setIsOpeningChat(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const text = formData.get("text");

    if (!text) return;
    try {
      const res = await apiRequest.post("/messages/" + chat.id, { text });
      setChat((prev) => ({ ...prev, messages: [...prev.messages, res.data] }));
      e.target.reset();
      socket.emit("sendMessage", {
        receiverId: chat.receiver.id,
        data: res.data,
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (
      !initialChatId ||
      !chats?.length ||
      chat?.id === initialChatId ||
      isChatDismissed
    ) {
      return;
    }

    const matchedChat = chats.find((item) => item.id === initialChatId);
    if (matchedChat) {
      handleOpenChat(matchedChat.id, matchedChat.receiver);
    }
  }, [initialChatId, chats, chat?.id, isChatDismissed]);

  useEffect(() => {
    if (!chats?.length || chat || isChatDismissed) return;

    if (initialChatId) {
      const matchedChat = chats.find((item) => item.id === initialChatId);
      if (matchedChat) return;
    }

    if (chats.length === 1) {
      handleOpenChat(chats[0].id, chats[0].receiver);
    }
  }, [chats, chat, initialChatId, isChatDismissed]);

  useEffect(() => {
    const read = async () => {
      try {
        await apiRequest.put("/chats/read/" + chat.id);
      } catch (err) {
        console.log(err);
      }
    };

    if (chat && socket) {
      socket.on("getMessage", (data) => {
        if (chat.id === data.chatId) {
          setChat((prev) => ({ ...prev, messages: [...prev.messages, data] }));
          read();
        }
      });
    }
    return () => {
      socket.off("getMessage");
    };
  }, [socket, chat]);

  return (
    <div className="chat">
      <div className="messages">
        {chats?.map((c) => (
          <div
            className={`message ${chat?.id === c.id ? "active" : ""}`}
            key={c.id}
            style={{
              backgroundColor:
                c.seenBy.includes(currentUser.id) || chat?.id === c.id
                  ? "white"
                  : "#fecd514e",
            }}
            onClick={() => handleOpenChat(c.id, c.receiver)}
          >
            <img src={c.receiver.avatar || "/noavatar.jpg"} alt="" />
            <span>{c.receiver.username}</span>
            <p>{c.lastMessage}</p>
          </div>
        ))}
      </div>
      <div className={`chatBox ${chat ? "active" : "empty"}`}>
        {chat ? (
          <>
            <div className="top">
              <div className="user">
                <img src={chat.receiver.avatar || "/noavatar.jpg"} alt="" />
                <div className="identity">
                  <strong>{chat.receiver.fullName || chat.receiver.username}</strong>
                  <span>@{chat.receiver.username}</span>
                </div>
              </div>
              <button
                type="button"
                className="close"
                onClick={() => {
                  setIsChatDismissed(true);
                  setChat(null);
                }}
              >
                Close
              </button>
            </div>
            <div className="center">
              {chat.messages?.length ? chat.messages.map((message) => {
                const isOwnMessage = message.userId === currentUser.id;

                return (
                  <div
                    className={`chatMessage ${isOwnMessage ? "own" : ""}`}
                    key={message.id}
                  >
                    <p>{message.text}</p>
                    <span>{format(message.createdAt)}</span>
                  </div>
                );
              }) : (
                <div className="emptyConversation">
                  <strong>
                    {isOpeningChat ? "Opening conversation..." : "No messages yet"}
                  </strong>
                  <p>
                    {isOpeningChat
                      ? "Loading your latest messages."
                      : "Send the first message to start the conversation."}
                  </p>
                </div>
              )}
              <div ref={messageEndRef}></div>
            </div>
            <form onSubmit={handleSubmit} className="bottom">
              <textarea
                name="text"
                placeholder="Type your message here..."
              ></textarea>
              <button>Send</button>
            </form>
          </>
        ) : (
          <div className="emptyChatState">
            <strong>Select a conversation</strong>
            <p>
              Open a saved chat or message a roommate match to start talking here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
