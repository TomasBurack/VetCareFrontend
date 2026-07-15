export function ErrorBanner({ messages }) {
  if (!messages || messages.length === 0) return null;

  if (messages.length === 1) {
    return <div className="error-banner">{messages[0]}</div>;
  }

  return (
    <div className="error-banner">
      <div>Revisá los siguientes datos:</div>
      <ul>
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
