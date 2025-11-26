interface MainSectionProps {
  userName: string;
  onLogout: () => void;
  onNavigateToMyPage: () => void;
}

function MainSection({ userName, onLogout, onNavigateToMyPage }: MainSectionProps) {
  return (
    <div id="main-section">
      <div className="header">
        <h1>AWS Amplify Auth App</h1>
        <div className="user-info">
          <span id="user-name">{userName}</span>
          <button id="mypage-btn" onClick={onNavigateToMyPage} style={{ marginRight: '10px' }}>
            マイページ
          </button>
          <button id="logout-btn" onClick={onLogout}>
            サインアウト
          </button>
        </div>
      </div>
      <div className="content">
        <h2>認証成功</h2>
        <p>AWS Amplifyでサインインしました。</p>
        <button onClick={onNavigateToMyPage} className="nav-button">
          マイページへ移動
        </button>
      </div>
    </div>
  );
}

export default MainSection;
