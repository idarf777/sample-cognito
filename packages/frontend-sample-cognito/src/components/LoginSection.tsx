import { useState } from 'react';
import type { FormEvent } from 'react';

interface LoginSectionProps {
  onLoginWithProvider: (provider: 'Google' | 'Facebook' | 'LINE') => void;
  onSendMagicLink: (email: string) => Promise<{ success: boolean; message: string }>;
}

function LoginSection({ onLoginWithProvider, onSendMagicLink }: LoginSectionProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    if (!email.trim()) {
      setMessage({ text: 'メールアドレスを入力してください', type: 'error' });
      return;
    }

    const result = await onSendMagicLink(email);
    setMessage({ text: result.message, type: result.success ? 'success' : 'error' });

    if (result.success) {
      setEmail('');
    }
  };

  return (
    <div id="login-section">
      <h1>AWS Amplify Authentication</h1>
      <div className="social-login-buttons">
        <button
          id="login-google-btn"
          className="social-btn google-btn"
          onClick={() => onLoginWithProvider('Google')}
        >
          <span className="btn-icon">G</span>
          Googleでサインイン
        </button>
        <button
          id="login-facebook-btn"
          className="social-btn facebook-btn"
          onClick={() => onLoginWithProvider('Facebook')}
        >
          <span className="btn-icon">f</span>
          Facebookでサインイン
        </button>
        <button
          id="login-line-btn"
          className="social-btn line-btn"
          onClick={() => onLoginWithProvider('LINE')}
        >
          <span className="btn-icon">LINE</span>
          LINEでサインイン
        </button>
      </div>

      <div className="divider">
        <span>または</span>
      </div>

      <div className="magic-link-section">
        <h3>メールアドレスでサインイン</h3>
        <form id="magic-link-form" onSubmit={handleSubmit}>
          <input
            type="email"
            id="magic-link-email"
            placeholder="メールアドレスを入力"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="magic-link-btn">
            サインインリンクを送信
          </button>
        </form>
        {message && (
          <div id="magic-link-message" className={message.type}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginSection;
