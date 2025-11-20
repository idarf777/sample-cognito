import { trpcClient } from './trpc-client';
import './style.css';

// DOM要素の取得
const loginSection = document.getElementById('login-section') as HTMLElement;
const mainSection = document.getElementById('main-section') as HTMLElement;
const loadingSection = document.getElementById('loading-section') as HTMLElement;
const loginGoogleBtn = document.getElementById('login-google-btn') as HTMLButtonElement;
const loginFacebookBtn = document.getElementById('login-facebook-btn') as HTMLButtonElement;
const loginLineBtn = document.getElementById('login-line-btn') as HTMLButtonElement;
const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;
const userNameSpan = document.getElementById('user-name') as HTMLSpanElement;
const magicLinkForm = document.getElementById('magic-link-form') as HTMLFormElement;
const magicLinkEmail = document.getElementById('magic-link-email') as HTMLInputElement;
const magicLinkMessage = document.getElementById('magic-link-message') as HTMLDivElement;

// 初期化
async function init() {
  showLoading();

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
      await showMainSection();
    } else {
      showLoginSection();
    }
  } catch (error) {
    console.error('初期化エラー:', error);
    showLoginSection();
  }
}

// マジックリンクトークン検証処理
async function handleMagicLinkVerification(token: string) {
  try {
    const result = await trpcClient.auth.verifyMagicLink.mutate({ token });

    if (result.success) {
      // URLからトークンパラメータを削除
      window.history.replaceState({}, document.title, window.location.pathname);

      // 認証成功 - メインセクションを表示
      await showMainSection();
    } else {
      showLoginSection();
      showMagicLinkMessage('認証に失敗しました。もう一度お試しください。', 'error');
    }
  } catch (error) {
    console.error('マジックリンク認証エラー:', error);
    showLoginSection();
    const errorMessage = error instanceof Error ? error.message : '認証に失敗しました';
    showMagicLinkMessage(errorMessage, 'error');
  }
}

// ログインセクションを表示
function showLoginSection() {
  hideAll();
  loginSection.style.display = 'block';
}

// メインセクションを表示
async function showMainSection() {
  hideAll();

  try {
    const userInfo = await trpcClient.auth.getUserInfo.query();
    if (userInfo && userInfo.user) {
      userNameSpan.textContent = userInfo.user;
    } else {
      userNameSpan.textContent = 'ユーザー';
    }
    mainSection.style.display = 'block';
  } catch (error) {
    console.error('ユーザー情報取得エラー:', error);
    showLoginSection();
  }
}

// ローディングを表示
function showLoading() {
  hideAll();
  loadingSection.style.display = 'block';
}

// すべてのセクションを非表示
function hideAll() {
  loginSection.style.display = 'none';
  mainSection.style.display = 'none';
  loadingSection.style.display = 'none';
}

// 汎用ログイン関数
async function loginWithProvider(provider: 'Google' | 'Facebook' | 'LINE') {
  try {
    showLoading();
    const result = await trpcClient.auth.loginWithProvider.query({ provider });

    // リダイレクトURLへ遷移
    if (result.redirectUrl) {
      window.location.href = result.redirectUrl;
    }
  } catch (error) {
    console.error(`${provider}ログインエラー:`, error);
    alert(`${provider}でのログインに失敗しました。もう一度お試しください。`);
    showLoginSection();
  }
}

// Googleログインボタンのイベントリスナー
loginGoogleBtn.addEventListener('click', async () => {
  await loginWithProvider('Google');
});

// Facebookログインボタンのイベントリスナー
loginFacebookBtn.addEventListener('click', async () => {
  await loginWithProvider('Facebook');
});

// LINEログインボタンのイベントリスナー
loginLineBtn.addEventListener('click', async () => {
  await loginWithProvider('LINE');
});

// ログアウトボタンのイベントリスナー
logoutBtn.addEventListener('click', async () => {
  try {
    showLoading();
    await trpcClient.auth.logout.mutate();
    showLoginSection();
  } catch (error) {
    console.error('ログアウトエラー:', error);
    alert('ログアウトに失敗しました。');
  }
});

// マジックリンクメッセージを表示
function showMagicLinkMessage(message: string, type: 'success' | 'error') {
  magicLinkMessage.textContent = message;
  magicLinkMessage.className = type;
  magicLinkMessage.style.display = 'block';
}

// マジックリンクメッセージを非表示
function hideMagicLinkMessage() {
  magicLinkMessage.style.display = 'none';
  magicLinkMessage.className = '';
}

// マジックリンクフォームのイベントリスナー
magicLinkForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideMagicLinkMessage();

  const email = magicLinkEmail.value.trim();
  if (!email) {
    showMagicLinkMessage('メールアドレスを入力してください', 'error');
    return;
  }

  try {
    const result = await trpcClient.auth.sendMagicLink.mutate({ email });
    showMagicLinkMessage(result.message, 'success');
    magicLinkEmail.value = '';
  } catch (error) {
    console.error('マジックリンク送信エラー:', error);
    const errorMessage = error instanceof Error ? error.message : 'メール送信に失敗しました';
    showMagicLinkMessage(errorMessage, 'error');
  }
});

// アプリケーション開始
init();
