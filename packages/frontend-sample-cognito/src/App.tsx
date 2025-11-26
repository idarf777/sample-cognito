import { useState, useEffect } from 'react';
import { signInWithRedirect, fetchAuthSession, getCurrentUser, signOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { configureAmplify } from './config/amplify';
import { trpcClient } from './trpc-client';
import LoadingSection from './components/LoadingSection';
import LoginSection from './components/LoginSection';
import MainSection from './components/MainSection';

// Amplifyの設定を初期化
configureAmplify();

function App() {
  const [section, setSection] = useState<'loading' | 'login' | 'main'>('loading');
  const [userName, setUserName] = useState<string>('ユーザー');

  useEffect(() => {
    init().then(() => {});

    // Amplifyの認証イベントをリッスン
    const hubListener = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signInWithRedirect':
          console.log('サインイン成功');
          init();
          break;
        case 'signInWithRedirect_failure':
          console.error('サインイン失敗', payload.data);
          setSection('login');
          break;
      }
    });

    return () => hubListener();
  }, []);

  async function init() {
    setSection('loading');

    try {
      // Amplifyで認証状態を確認
      const user = await getCurrentUser();
      console.log('認証済みユーザー:', user);
      
      // ユーザー情報を取得
      await loadUserInfo();
      setSection('main');
    } catch (error) {
      // 認証されていない
      console.log('未認証');
      setSection('login');
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
        const profile = await trpcClient.user.getProfile.query();
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
      setSection('loading');
      await signOut();
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
          onLoginClicked={() => signInWithRedirect()}
        />
      )}
      {section === 'main' && (
        <MainSection userName={userName} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
