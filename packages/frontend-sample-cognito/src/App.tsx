import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { signInWithRedirect, fetchAuthSession, getCurrentUser, signOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { configureAmplify } from './config/amplify';
import { trpcClient } from './trpc-client';
import LoadingSection from './components/LoadingSection';
import LoginSection from './components/LoginSection';
import MainSection from './components/MainSection';
import MyPage from './components/MyPage';

// Amplifyの設定を初期化
configureAmplify();

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string>('ユーザー');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    updateAuthState().then(() => {});

    // Amplifyの認証イベントをリッスン
    const dettachHubListener = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {  
        case 'signInWithRedirect':
          console.log('サインイン成功');
          updateAuthState().then(() => {});
          break;
        case 'signInWithRedirect_failure':
          console.error('サインイン失敗', payload.data);
          setIsLoading(false);
          setIsAuthenticated(false);
          navigate('/login');
          break;
      }
    });
    return () => dettachHubListener();
  }, []);

  async function updateAuthState() {
    setIsLoading(true);

    try {
      // Amplifyで認証状態を確認
      const user = await getCurrentUser();
      console.log('認証済みユーザー:', user);
      
      // ユーザー情報を取得
      await loadUserInfo();
      setIsAuthenticated(true);
      setIsLoading(false);
      
      // ログイン成功後、元のページか/mainにリダイレクト
      if (location.pathname === '/login' || location.pathname === '/') {
        navigate('/main');
      }
    } catch (error) {
      // 認証されていない
      console.log('未認証');
      setIsAuthenticated(false);
      setIsLoading(false);
      
      // 未認証の場合は/loginにリダイレクト
      if (location.pathname !== '/login') {
        navigate('/login');
      }
    }
  }

  async function loadUserInfo() {
    try {
      const user = await getCurrentUser();
      const session = await fetchAuthSession();
      
      setUserName(user.username || user.userId);
      
      console.log('ユーザー情報:', {
        username: user.username,
        userId: user.userId,
        tokens: session.tokens,
      });

      // バックエンドからプロフィールを取得（トークン検証を含む）
      try {
        const profile = await trpcClient.user.getUserInfo.query();
        console.log('プロフィール:', profile);
      } catch (error) {
        console.error('プロフィール取得エラー:', error);
      }
    } catch (error) {
      console.error('ユーザー情報取得エラー:', error);
      setUserName('ユーザー');
    }
  }

  async function handleLogout() {
    try {
      setIsLoading(true);
      await signOut();
      setIsAuthenticated(false);
      setIsLoading(false);
      navigate('/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
      alert('ログアウトに失敗しました。');
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <LoadingSection />;
  }

  return (
    <div id="app">
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? (
            <Navigate to="/main" replace />
          ) : (
            <LoginSection onLoginClicked={() => signInWithRedirect()} />
          )
        } />
        <Route path="/main" element={
          isAuthenticated ? (
            <MainSection 
              userName={userName} 
              onLogout={handleLogout}
              onNavigateToMyPage={() => navigate('/mypage')}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        <Route path="/mypage" element={
          isAuthenticated ? (
            <MyPage />
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        <Route path="/" element={
          <Navigate to={isAuthenticated ? "/main" : "/login"} replace />
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
