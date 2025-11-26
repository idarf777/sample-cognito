import { CognitoJwtVerifier } from 'aws-jwt-verify';

// JWTトークン検証用のVerifierを作成
const createAccessTokenVerifier = () => {
  return CognitoJwtVerifier.create({
    userPoolId: process.env.COGNITO_USER_POOL_ID || '',
    tokenUse: 'access',
    clientId: process.env.COGNITO_CLIENT_ID || '',
  });
};

const createIdTokenVerifier = () => {
  return CognitoJwtVerifier.create({
    userPoolId: process.env.COGNITO_USER_POOL_ID || '',
    tokenUse: 'id',
    clientId: process.env.COGNITO_CLIENT_ID || '',
  });
};

export interface TokenVerificationResult {
  valid: boolean;
  payload?: any;
  error?: string;
}

export class AmplifyAuthService {
  /**
   * アクセストークンを検証
   */
  async verifyAccessToken(token: string): Promise<TokenVerificationResult> {
    try {
      const verifier = createAccessTokenVerifier();
      const payload = await verifier.verify(token);
      
      return {
        valid: true,
        payload: {
          sub: payload.sub,
          username: payload.username,
          scope: payload.scope,
          exp: payload.exp,
          iat: payload.iat,
        }
      };
    } catch (error) {
      console.error('アクセストークン検証エラー:', error);
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'トークン検証に失敗しました'
      };
    }
  }

  /**
   * IDトークンを検証
   */
  async verifyIdToken(token: string): Promise<TokenVerificationResult> {
    try {
      const verifier = createIdTokenVerifier();
      const payload = await verifier.verify(token);
      
      return {
        valid: true,
        payload: {
          sub: payload.sub,
          email: payload.email,
          email_verified: payload.email_verified,
          name: payload.name,
          exp: payload.exp,
          iat: payload.iat,
        }
      };
    } catch (error) {
      console.error('IDトークン検証エラー:', error);
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'トークン検証に失敗しました'
      };
    }
  }

  /**
   * Authorizationヘッダーからトークンを抽出して検証
   */
  async verifyAuthorizationHeader(authHeader: string | undefined): Promise<TokenVerificationResult> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        valid: false,
        error: 'Authorization headerが無効です'
      };
    }

    const token = authHeader.substring(7); // "Bearer "を除去
    return await this.verifyAccessToken(token);
  }
}
