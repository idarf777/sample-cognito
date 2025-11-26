import { useEffect, useState } from 'react';
import { trpcClient } from '../trpc-client';

function CallbackPage() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('認証処理中...');

  useEffect(() => {
    handleCallback();
  }, []);

  async function handleCallback() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(`認証エラー: ${error}`);
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('認証コードが見つかりません');
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
        return;
      }

      // 認証状態を確認
      const isAuth = await trpcClient.auth.isAuthenticated.query();

      if (isAuth) {
        setStatus('success');
        setMessage('認証に成功しました。リダイレクトしています...');
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        setStatus('error');
        setMessage('認証に失敗しました');
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    } catch (error) {
      console.error('コールバック処理エラー:', error);
      setStatus('error');
      setMessage('認証処理中にエラーが発生しました');
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {status === 'processing' && (
        <>
          <div className="spinner"></div>
          <p>{message}</p>
        </>
      )}
      {status === 'success' && (
        <>
          <div style={{ fontSize: '48px', color: 'green' }}>✓</div>
          <p>{message}</p>
        </>
      )}
      {status === 'error' && (
        <>
          <div style={{ fontSize: '48px', color: 'red' }}>✗</div>
          <p>{message}</p>
        </>
      )}
    </div>
  );
}

export default CallbackPage;
