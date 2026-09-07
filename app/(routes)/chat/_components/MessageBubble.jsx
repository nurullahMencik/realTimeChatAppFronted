const MessageBubble = ({ message, isOwn }) => {
  if (message.system) {
    return (
      <p className="text-center text-xs text-slate-400 bg-slate-200 rounded-full px-3 py-1 my-3 mx-auto w-fit max-w-[80%]">
        {message.text}
      </p>
    );
  }

  return (
    <div
      className={`max-w-[80%] w-fit min-w-24 flex flex-col my-2 px-3 py-2 rounded-2xl text-white break-words ${
        isOwn
          ? "bg-emerald-700 ml-auto rounded-br-sm"
          : "bg-slate-700 mr-auto rounded-bl-sm"
      }`}
    >
      {!isOwn && (
        <span className="text-xs font-semibold text-emerald-300 mb-1">
          {message.username}
        </span>
      )}
      <span className="whitespace-pre-wrap">{message.text}</span>
      <span className="text-[10px] text-white/60 self-end mt-1">
        {message.time}
      </span>
    </div>
  );
};

export default MessageBubble;
