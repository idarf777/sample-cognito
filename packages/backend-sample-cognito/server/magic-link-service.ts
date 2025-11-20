import { randomBytes } from 'crypto';

interface MagicLinkToken {
  email: string;
  token: string;
  expiresAt: number;
}

// インメモリでトークンを管理（本番環境ではRedisやDBを使用）
const tokenStore = new Map<string, MagicLinkToken>();

export class MagicLinkService {
  private readonly TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15分

  /**
   * マジックリンクトークンを生成してメール送信（スタブ）
   */
  async sendMagicLink(email: string): Promise<{ success: boolean; message: string }> {
    // トークン生成
    const token = randomBytes(32).toString('hex');
    const expiresAt = Date.now() + this.TOKEN_EXPIRY_MS;

    // トークンを保存
    tokenStore.set(token, {
      email,
      token,
      expiresAt,
    });

    // マジックリンクURL生成
    const magicLinkUrl = `${process.env.COGNITO_REDIRECT_SIGN_IN || 'http://localhost:3000'}/auth/verify?token=${token}`;

    // メール送信スタブ（実際にはSESやSendGridなどを使用）
    console.log('='.repeat(80));
    console.log('📧 マジックリンクメール送信（スタブ）');
    console.log('='.repeat(80));
    console.log(`To: ${email}`);
    console.log(`Subject: サインインリンク`);
    console.log(`\n${email} 様\n`);
    console.log('以下のリンクをクリックしてサインインしてください：');
    console.log(`\n${magicLinkUrl}\n`);
    console.log('このリンクは15分間有効です。');
    console.log('='.repeat(80));

    return {
      success: true,
      message: 'マジックリンクを送信しました。メールをご確認ください。',
    };
  }

  /**
   * トークンを検証してメールアドレスを取得
   */
  async verifyToken(token: string): Promise<{ valid: boolean; email?: string; error?: string }> {
    const tokenData = tokenStore.get(token);

    if (!tokenData) {
      return {
        valid: false,
        error: '無効なトークンです',
      };
    }

    // 有効期限チェック
    if (Date.now() > tokenData.expiresAt) {
      tokenStore.delete(token);
      return {
        valid: false,
        error: 'トークンの有効期限が切れています',
      };
    }

    // トークンは一度のみ使用可能
    tokenStore.delete(token);

    return {
      valid: true,
      email: tokenData.email,
    };
  }

  /**
   * メールアドレスでユーザーセッションを作成
   */
  async createUserSession(email: string): Promise<{ userId: string; email: string }> {
    // 実際にはCognitoやDBでユーザーを作成・取得
    // ここではシンプルに擬似的なユーザーIDを返す
    const userId = `user_${Buffer.from(email).toString('base64').slice(0, 16)}`;

    console.log(`✅ ユーザーセッション作成: ${email} (ID: ${userId})`);

    return {
      userId,
      email,
    };
  }

  /**
   * 期限切れトークンをクリーンアップ（定期実行推奨）
   */
  cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [token, data] of tokenStore.entries()) {
      if (now > data.expiresAt) {
        tokenStore.delete(token);
      }
    }
  }
}
