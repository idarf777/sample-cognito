import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAuthSession, getCurrentUser, signOut } from 'aws-amplify/auth';
import { trpcClient } from '../trpc-client';

interface UserProfile {
  userId: string;
  username: string;
  email?: string;
  scope?: string;
}

function MyPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError(null);

    try {
      // Amplifyからユーザー情報を取得
      const user = await getCurrentUser();
      const session = await fetchAuthSession();

      // バックエンドから検証済みプロフィールを取得
      const backendProfile = await trpcClient.user.getProfile.query();

      setProfile({
        userId: user.userId,
        username: user.username || backendProfile.username,
        email: session.tokens?.idToken?.payload.email as string | undefined,
        scope: backendProfile.scope,
      });
    } catch (error) {
      console.error('プロフィール取得エラー:', error);
      setError('プロフィールの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
      alert('ログアウトに失敗しました');
    }
  }

  if (loading) {
    return (
      <div className="mypage-container">
        <div className="mypage-loading">
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mypage-container">
        <div className="mypage-error">
          <h2>エラー</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={loadProfile}>再試行</button>
            <button onClick={() => navigate('/main')}>メインに戻る</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mypage-container">
      <div className="mypage-header">
        <button onClick={() => navigate('/main')} className="back-btn">
          ← 戻る
        </button>
        <h1>マイページ</h1>
        <button onClick={handleLogout} className="logout-btn">
          ログアウト
        </button>
      </div>

      <div className="mypage-content">
        <section className="profile-section">
          <h2>プロフィール情報</h2>
          <div className="profile-info">
            <div className="info-item">
              <label>ユーザーID:</label>
              <span>{profile?.userId}</span>
            </div>
            <div className="info-item">
              <label>ユーザー名:</label>
              <span>{profile?.username}</span>
            </div>
            {profile?.email && (
              <div className="info-item">
                <label>メールアドレス:</label>
                <span>{profile.email}</span>
              </div>
            )}
            {profile?.scope && (
              <div className="info-item">
                <label>スコープ:</label>
                <span>{profile.scope}</span>
              </div>
            )}
          </div>
        </section>

        <section className="actions-section">
          <h2>アカウント操作</h2>
          <div className="actions">
            <button onClick={loadProfile} className="refresh-btn">
              情報を更新
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default MyPage;
