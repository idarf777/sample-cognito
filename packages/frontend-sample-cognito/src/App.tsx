import { useState, useEffect } from 'react';
import { trpcClient } from './trpc-client';
import LoadingSection from './components/LoadingSection';
import LoginSection from './components/LoginSection';
import MainSection from './components/MainSection';
import type { AuthProvider } from 'shared-types';

function App() {
  const [section, setSection] = useState<'loading' | 'login' | 'main'>('loading');
  const [userName, setUserName] = useState<string>('ユーザー');

  useEffect(() => {
    init().then(() => {});
  }, []);

  async function init() {
    setSection('loading');

    // URLパラメータからコードやエラーを取得
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    // Cognitoからのリダイレクト処理
    if (code) {
      await handleCognitoCallback(code);
      return;
    }

    if (error) {
      console.error('認証エラー:', error);
      alert(`認証に失敗しました: ${error}`);
      // URLパラメータをクリア
      window.history.replaceState({}, document.title, window.location.pathname);
      setSection('login');
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

  async function handleCognitoCallback(code: string) {
    try {
      // URLパラメータからstateを取得
      const urlParams = new URLSearchParams(window.location.search);
      const receivedState = urlParams.get('state');
      
      // Cookieからstateを取得
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);
      const storedState = cookies['oauth_state'];

      // stateを検証
      if (!receivedState || !storedState || receivedState !== storedState) {
        console.error('State mismatch - CSRF攻撃の可能性');
        alert('認証エラー: 不正なリクエストです');
        setSection('login');
        return;
      }

      // stateのCookieを削除
      document.cookie = 'oauth_state=; path=/; max-age=0';
      
      // URLパラメータをクリア
      window.history.replaceState({}, document.title, window.location.pathname);

      // 認証コードでトークンを取得
      const result = await trpcClient.auth.authorizeCodeForToken.mutate({ code });
      if (result) {
        console.log('トークン取得成功');
        
        // ユーザー情報を取得してメイン画面へ
        await loadUserInfo();
        setSection('main');
      } else {
        setSection('login');
        alert('トークン取得に失敗しました。もう一度お試しください。');
      }
    } catch (error) {
      console.error('コールバック処理エラー:', error);
      setSection('login');
      alert('認証処理中にエラーが発生しました。');
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

  async function handleLoginWithProvider(provider: AuthProvider) {
    try {
      setSection('loading');
      const result = await trpcClient.auth.loginWithProvider.query({ provider });

      if (result.redirectUrl && result.state) {
        // stateをCookieに保存
        document.cookie = `oauth_state=${result.state}; path=/; max-age=600; secure; samesite=lax`;
        
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

  return (
    <div id="app">
      {section === 'loading' && <LoadingSection />}
      {section === 'login' && (
        <LoginSection
          onLoginWithProvider={handleLoginWithProvider}
        />
      )}
      {section === 'main' && (
        <MainSection userName={userName} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
