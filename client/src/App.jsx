import { useState } from "react";
import axios from "axios";

import layoutData from "./data/initialLayout.json";

import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import WireframePreview from "./components/WireframePreview";

function App() {

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I can edit your layout.",
    },
  ]);

  const [layout, setLayout] = useState(layoutData);

  const handleSend = async (text) => {

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
    ]);

    try {

      const response = await axios.post(
        "http://localhost:3001/api/chat",
        {
          message: text,
          layout: layout,
        }
      );

      const { reply, updatedLayout } = response.data;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ]);

      // IMPORTANT: always update layout if backend sends it
      if (updatedLayout) {
        setLayout(updatedLayout);
      }

    } catch (error) {

      console.log(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error talking to AI",
        },
      ]);
    }
  };

  return (
    <div className="h-screen bg-gray-100 p-4">

      <div className="grid grid-cols-3 gap-4 h-full">

        {/* CHAT */}
        <div className="bg-white rounded-2xl shadow p-4 flex flex-col">
          <h1 className="text-2xl font-bold mb-4">Chat</h1>

          <div className="flex-1 overflow-auto mb-4">
            <ChatWindow messages={messages} />
          </div>

          <ChatInput onSend={handleSend} />
        </div>

        {/* PREVIEW */}
        <div className="bg-white rounded-2xl shadow p-4 overflow-auto">
          <h1 className="text-2xl font-bold mb-4">Preview</h1>

          <WireframePreview
            layout={layout}
            setLayout={setLayout}
          />
        </div>

        {/* JSON */}
        <div className="bg-white rounded-2xl shadow p-4 overflow-auto">
          <h1 className="text-2xl font-bold mb-4">JSON</h1>

          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(layout, null, 2)}
          </pre>
        </div>

      </div>

    </div>
  );
}

export default App;