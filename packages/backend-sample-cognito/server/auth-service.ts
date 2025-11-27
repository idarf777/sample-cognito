import { CognitoJwtVerifier } from 'aws-jwt-verify';
import type { CognitoJwtVerifierSingleUserPool } from 'aws-jwt-verify/cognito-verifier';

export interface TokenPayload {
  sub: string;
  email?: string;
  email_verified?: boolean;
  username?: string;
  scope?: string;
  exp: number;
  iat: number;
}

export interface VerifierParams {
  userPoolId: string;
  tokenUse: 'access' | 'id';
  clientId: string;
}

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
  payload?: TokenPayload;
  error?: string;
}

export class AmplifyAuthService {
  async verifyToken(token: string, verifier: CognitoJwtVerifierSingleUserPool<VerifierParams> ): Promise<TokenVerificationResult> {
    try {
      const payload = await verifier.verify(token);
      return {
        valid: true,
        payload: {
          sub: payload.sub,
          email: payload.email as string | undefined,
          email_verified: payload.email_verified as boolean | undefined,
          username: payload.username as string | undefined,
          scope: payload.scope as string | undefined,
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
   * アクセストークンを検証
   */
  async verifyAccessToken(token: string): Promise<TokenVerificationResult> {
    return await this.verifyToken(token, createAccessTokenVerifier());
  }

  /**
   * IDトークンを検証
   */
  async verifyIdToken(token: string): Promise<TokenVerificationResult> {
    return await this.verifyToken(token, createIdTokenVerifier());
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
