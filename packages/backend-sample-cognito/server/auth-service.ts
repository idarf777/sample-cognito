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

export class AmplifyAuthService {
  async loginWithProvider(provider: 'Google' | 'Facebook' | 'LINE' | 'Apple'): Promise<{ redirectUrl: string }> {
    try {
      const domain = process.env.COGNITO_DOMAIN || '';
      const clientId = process.env.COGNITO_CLIENT_ID || '';
      const redirectUri = process.env.COGNITO_REDIRECT_SIGN_IN || 'http://localhost:3000';

      // プロバイダー名のマッピング (CognitoでのID名に合わせる)
      const providerMap: Record<string, string> = {
        'Google': 'Google',
        'Facebook': 'Facebook',
        'LINE': 'LINE', // CognitoでLINEをOIDCプロバイダーとして登録した時の名前
        'Apple': 'SignInWithApple'
      };

      const identityProvider = providerMap[provider] || provider;

      // 指定されたプロバイダーでOAuth認証
      // 必須パラメータ: client_id, redirect_uri, response_type, scope
      const params = new URLSearchParams({
        identity_provider: identityProvider,
        client_id: clientId,
        response_type: 'code',
        scope: 'openid email profile',
        redirect_uri: redirectUri
      });

      const redirectUrl = `https://${domain}/oauth2/authorize?${params.toString()}`;
      console.log(`Redirecting to: ${redirectUrl}`);

      return { redirectUrl };
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
}
