import { useState, useRef, useEffect } from 'react';
import { aiService } from '../../services/aiService';

const FALLBACK_WELCOME = '👋 Hi! I\'m your UniPathway AI Advisor. Ask me anything about university admissions!';

function renderMarkdown(text) {
  return text
    .split('\n')
    .map((line, i) => {
      // Heading ##
      if (line.startsWith('## ')) return <h3 key={i} className="ai-md-h3">{line.slice(3)}</h3>;
      if (line.startsWith('# '))  return <h2 key={i} className="ai-md-h2">{line.slice(2)}</h2>;
      // Bullet
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={i} className="ai-md-li">{inlineFormat(line.slice(2))}</li>;
      }
      // Empty line
      if (line.trim() === '') return <br key={i} />;
      // Normal paragraph
      return <p key={i} className="ai-md-p">{inlineFormat(line)}</p>;
    });
}

function inlineFormat(text) {
  // Bold **text** and *italic*
  const parts = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|✅|❌|🎓|👋|📚|🏛️)/g;
  let last = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[0].startsWith('**')) parts.push(<strong key={match.index}>{match[2]}</strong>);
    else if (match[0].startsWith('*')) parts.push(<em key={match.index}>{match[3]}</em>);
    else parts.push(match[0]);
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function ChatBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`ai-bubble-wrap ${isUser ? 'ai-bubble-wrap--user' : 'ai-bubble-wrap--model'}`}>
      {!isUser && <div className="ai-avatar">🎓</div>}
      <div className={`ai-bubble ${isUser ? 'ai-bubble--user' : 'ai-bubble--model'}`}>
        {isUser
          ? <p>{msg.text}</p>
          : <div className="ai-md">{renderMarkdown(msg.text)}</div>
        }
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="ai-bubble-wrap ai-bubble-wrap--model">
      <div className="ai-avatar">🎓</div>
      <div className="ai-bubble ai-bubble--model ai-bubble--typing">
        <span /><span /><span />
      </div>
    </div>
  );
}

export default function AIChatView({ messages, setMessages }) {
  const [input, setInput]           = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState('');
  const bottomRef = useRef(null);

  // Load welcome message only once (when messages is null)
  useEffect(() => {
    if (messages !== null) return;
    aiService.getWelcome()
      .then(data => setMessages([{ role: 'model', text: data.message }]))
      .catch(() => setMessages([{ role: 'model', text: FALLBACK_WELCOME }]));
  }, [messages, setMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg = { role: 'user', text };
    const history = messages
      .map(m => ({ role: m.role, text: m.text }));

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setError('');
    setIsLoading(true);

    try {
      const data = await aiService.chat(text, history);
      setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
    } catch (err) {
      setError('Failed to get a response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleClear() {
    setMessages(null);
    setError('');
  }

  return (
    <div className="ai-chat">
      <div className="ai-chat__header">
        <span className="ai-chat__title">🤖 UniPathway AI Advisor</span>
        <button type="button" className="ai-chat__clear" onClick={handleClear}>
          Clear chat
        </button>
      </div>

      <div className="ai-chat__messages">
        {(messages ?? []).map((msg, i) => <ChatBubble key={i} msg={msg} />)}
        {isLoading && <TypingIndicator />}
        {error && <p className="ai-chat__error">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <div className="ai-chat__input-row">
        <textarea
          className="ai-chat__input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me about universities, departments, or your Sekem score..."
          rows={2}
          disabled={isLoading}
        />
        <button
          type="button"
          className="ai-chat__send"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? '...' : '➤'}
        </button>
      </div>
    </div>
  );
}