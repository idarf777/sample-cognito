import { useState, useEffect } from 'react';
import { trpcClient } from './trpc-client';
import LoadingSection from './components/LoadingSection';
import LoginSection from './components/LoginSection';
import MainSection from './components/MainSection';

function App() {
  const [section, setSection] = useState<'loading' | 'login' | 'main'>('loading');
  const [userName, setUserName] = useState<string>('ユーザー');

  useEffect(() => {
    init();
  }, []);

  async function init() {
    setSection('loading');

    // URLパラメータからトークンを取得
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    // マジックリンクトークンが存在する場合は検証
    if (token) {
      await handleMagicLinkVerification(token);
      return;
    }

    try {
      const isAuth = await trpcClient.auth.isAuthenticated.query();

      if (isAuth) {
        await loadUserInfo();
        setSection('main');
      } else {
        setSection('login');
      }
    } catch (error) {
      console.error('初期化エラー:', error);
      setSection('login');
    }
  }

  async function handleMagicLinkVerification(token: string) {
    try {
      const result = await trpcClient.auth.verifyMagicLink.mutate({ token });

      if (result.success) {
        // URLからトークンパラメータを削除
        window.history.replaceState({}, document.title, window.location.pathname);
        await loadUserInfo();
        setSection('main');
      } else {
        setSection('login');
        alert('認証に失敗しました。もう一度お試しください。');
      }
    } catch (error) {
      console.error('マジックリンク認証エラー:', error);
      setSection('login');
      alert('認証に失敗しました');
    }
  }

  async function loadUserInfo() {
    try {
      const userInfo = await trpcClient.auth.getUserInfo.query();
      if (userInfo && userInfo.user) {
        setUserName(userInfo.user);
      }
    } catch (error) {
      console.error('ユーザー情報取得エラー:', error);
    }
  }

  async function handleLoginWithProvider(provider: 'Google' | 'Facebook' | 'LINE') {
    try {
      setSection('loading');
      const result = await trpcClient.auth.loginWithProvider.query({ provider });

      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      }
    } catch (error) {
      console.error(`${provider}ログインエラー:`, error);
      alert(`${provider}でのログインに失敗しました。もう一度お試しください。`);
      setSection('login');
    }
  }

  async function handleLogout() {
    try {
      setSection('loading');
      await trpcClient.auth.logout.mutate();
      setSection('login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
      alert('ログアウトに失敗しました。');
      setSection('main');
    }
  }

  async function handleSendMagicLink(email: string) {
    try {
      const result = await trpcClient.auth.sendMagicLink.mutate({ email });
      return { success: true, message: result.message };
    } catch (error) {
      console.error('マジックリンク送信エラー:', error);
      const errorMessage = error instanceof Error ? error.message : 'メール送信に失敗しました';
      return { success: false, message: errorMessage };
    }
  }

  return (
    <div id="app">
      {section === 'loading' && <LoadingSection />}
      {section === 'login' && (
        <LoginSection
          onLoginWithProvider={handleLoginWithProvider}
          onSendMagicLink={handleSendMagicLink}
        />
      )}
      {section === 'main' && (
        <MainSection userName={userName} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
