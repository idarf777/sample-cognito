import { signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';

// サーバーサイドでAmplifyを設定
export function configureAmplifyServer() {
  const config: any = {
    Auth: {
      Cognito: {
        userPoolId: process.env.COGNITO_USER_POOL_ID || '',
        userPoolClientId: process.env.COGNITO_CLIENT_ID || '',
        loginWith: {
          oauth: {
            domain: process.env.COGNITO_DOMAIN || '',
            scopes: ['openid', 'email', 'profile'],
            redirectSignIn: [process.env.COGNITO_REDIRECT_SIGN_IN || 'http://localhost:3000'],
            redirectSignOut: [process.env.COGNITO_REDIRECT_SIGN_OUT || 'http://localhost:3000'],
            responseType: 'code',
            providers: ['Google', 'Facebook']
          }
        }
      }
    }
  };

  // サーバーサイド認証の場合はClient Secretを追加
  if (process.env.COGNITO_CLIENT_SECRET) {
    config.Auth.Cognito.userPoolClientSecret = process.env.COGNITO_CLIENT_SECRET;
  }

  Amplify.configure(config);
}

export type AuthProvider = 'Google' | 'Facebook' | 'LINE' | 'LoginWithAmazon' | 'COGNITO';
export class AmplifyAuthService {
  async loginWithProvider(provider: AuthProvider): Promise<{ redirectUrl: string; state: string }> {
    try {
      const domain = process.env.COGNITO_DOMAIN || '';
      const clientId = process.env.COGNITO_CLIENT_ID || '';
      const redirectUri = process.env.COGNITO_REDIRECT_SIGN_IN || 'http://localhost:3000';
      const identityProvider = provider;

      // 指定されたプロバイダーでOAuth認証
      // 必須パラメータ: client_id, redirect_uri, response_type, scope
      const state = Math.random().toString(36).substring(2);
      const params = new URLSearchParams({
        identity_provider: identityProvider,
        client_id: clientId,
        response_type: 'code',
        scope: 'openid email profile',
        redirect_uri: redirectUri,
        state: state,
      });

      const redirectUrl = `https://${domain}/oauth2/authorize?${params.toString()}`;
      console.log(`Redirecting to: ${redirectUrl}`);

      return { redirectUrl, state };
    } catch (error) {
      console.error('認証エラー:', error);
      throw error;
    }
  }

  async logout(): Promise<{ success: boolean }> {
    try {
      await signOut();
      console.log('ログアウト成功');
      return { success: true };
    } catch (error) {
      console.error('ログアウトエラー:', error);
      throw error;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      await getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }

  async getUserInfo(): Promise<any> {
    try {
      const user = await getCurrentUser();
      const session = await fetchAuthSession();

      return {
        user: user.username,
        userId: user.userId,
        signInDetails: user.signInDetails,
        tokens: session.tokens
      };
    } catch (error) {
      console.error('ユーザー情報取得エラー:', error);
      return null;
    }
  }

  async getAccessToken(): Promise<string | undefined> {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.accessToken?.toString();
    } catch (error) {
      console.error('アクセストークン取得エラー:', error);
      return undefined;
    }
  }

  async authorizeCodeForToken(code: string): Promise<any> {
    try {
      const domain = process.env.COGNITO_DOMAIN || '';
      const clientId = process.env.COGNITO_CLIENT_ID || '';
      const clientSecret = process.env.COGNITO_CLIENT_SECRET || '';
      const redirectUri = process.env.COGNITO_REDIRECT_SIGN_IN || 'http://localhost:3000';

      // トークンエンドポイントへリクエスト
      const tokenUrl = `https://${domain}/oauth2/token`;
      
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        code: code,
        redirect_uri: redirectUri,
      });

      const headers: HeadersInit = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      // Client Secretがある場合はBasic認証を使用
      if (clientSecret) {
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        headers['Authorization'] = `Basic ${credentials}`;
      }

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: headers,
        body: params.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('トークン取得エラー:', errorText);
        throw new Error(`トークン取得に失敗しました: ${response.status}`);
      }

      const tokens = await response.json();
      console.log('トークン取得成功');
      
      return {
        access_token: tokens.access_token,
        id_token: tokens.id_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        token_type: tokens.token_type,
      };
    } catch (error) {
      console.error('トークン交換エラー:', error);
      throw error;
    }
  }
}
