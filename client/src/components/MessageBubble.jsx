function MessageBubble({ role, content }) {
  return (
    <div
      className={`p-3 rounded-xl mb-2 max-w-[80%] ${
        role === "user"
          ? "bg-blue-500 text-white ml-auto"
          : "bg-gray-200 text-black"
      }`}
    >
      {content}
    </div>
  );
}

export default MessageBubble;