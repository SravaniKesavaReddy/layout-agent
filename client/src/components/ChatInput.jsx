import { useState } from "react";

function ChatInput({ onSend }) {

  const [text, setText] = useState("");

  const handleSend = () => {

    if (!text.trim()) return;

    onSend(text);

    setText("");
  };

  return (
    <div className="flex gap-2">

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type instruction..."
        className="border p-2 rounded-lg flex-1"
      />

      <button
        onClick={handleSend}
        className="bg-black text-white px-4 rounded-lg"
      >
        Send
      </button>

    </div>
  );
}

export default ChatInput;