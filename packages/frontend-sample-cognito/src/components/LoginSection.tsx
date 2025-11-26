interface LoginSectionProps {
  onLoginClicked: () => void;
}

function LoginSection({ onLoginClicked }: LoginSectionProps) {
  return (
    <div id="login-section">
      <h1>AWS Amplify Authentication</h1>
      <div className="social-login-buttons">
        <button
          id="login-btn"
          className="social-btn signin-btn"
          onClick={() => onLoginClicked()}
        >
          サインイン
        </button>
      </div>
    </div>
  );
}

export default LoginSection;
