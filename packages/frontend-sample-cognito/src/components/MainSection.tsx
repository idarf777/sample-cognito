interface MainSectionProps {
  userName: string;
  onLogout: () => void;
}

function MainSection({ userName, onLogout }: MainSectionProps) {
  return (
    <div id="main-section">
      <div className="header">
        <h1>AWS Amplify Auth App</h1>
        <div className="user-info">
          <span id="user-name">{userName}</span>
          <button id="logout-btn" onClick={onLogout}>
            サインアウト
          </button>
        </div>
      </div>
      <div className="content">
        <h2>認証成功</h2>
        <p>AWS Amplifyでサインインしました。</p>
      </div>
    </div>
  );
}

export default MainSection;
