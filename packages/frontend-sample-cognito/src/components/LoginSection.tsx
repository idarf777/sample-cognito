import type { AuthProvider } from "shared-types";

interface LoginSectionProps {
  onLoginWithProvider: (provider: AuthProvider) => void;
}

function LoginSection({ onLoginWithProvider }: LoginSectionProps) {
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
          <span className="btn-icon">L</span>
          LINEでサインイン
        </button>
        <button
          id="login-amazon-btn"
          className="social-btn amazon-btn"
          onClick={() => onLoginWithProvider('LoginWithAmazon')}
        >
          <span className="btn-icon">A</span>
          Amazonでサインイン
        </button>
        <button
          id="login-mail-btn"
          className="social-btn mail-btn"
          onClick={() => onLoginWithProvider('COGNITO')}
        >
          <span className="btn-icon">M</span>
          メールアドレスでサインイン
        </button>
      </div>
    </div>
  );
}

export default LoginSection;
