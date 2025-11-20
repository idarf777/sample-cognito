# Sample Cognito - マルチSNS OAuth認証アプリ

AWS AmplifyとマルチSNS OAuth (Google、Facebook、LINE) を使用した認証システムのモノレポ構成プロジェクト。

## 📁 プロジェクト構造

```
sample-cognite/
├── packages/
│   ├── frontend-sample-cognito/   # フロントエンドWebアプリ
│   ├── backend-sample-cognito/    # バックエンドAPIサーバー
│   └── shared-types/              # 共有型定義
└── package.json                   # ルートパッケージ（ワークスペース管理）
```

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
bun install
```

### 2. ソーシャルログインプロバイダー設定

#### 2.1 Google OAuth設定

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクトを作成または選択
3. **APIs & Services > Credentials**に移動
4. **Create Credentials > OAuth 2.0 Client ID**をクリック
5. アプリケーションタイプで**Web application**を選択
6. 以下を設定:
   - **承認済みのJavaScript生成元**: `http://localhost:3000`
   - **承認済みのリダイレクトURI**: `https://your-cognito-domain.auth.region.amazoncognito.com/oauth2/idpresponse`
7. Client IDとClient Secretをメモ

#### 2.2 Facebook OAuth設定

1. [Facebook for Developers](https://developers.facebook.com/)にアクセス
2. 新しいアプリを作成
3. **設定 > 基本設定**からApp IDとApp Secretを取得
4. **Facebook Login**を追加し、**設定**で以下を設定:
   - **有効なOAuthリダイレクトURI**: `https://your-cognito-domain.auth.region.amazoncognito.com/oauth2/idpresponse`
5. アプリを本番環境に切り替え

#### 2.3 LINE Login設定

1. [LINE Developers Console](https://developers.line.biz/)にアクセス
2. プロバイダーとチャネルを作成（チャネルタイプ: LINE Login）
3. **チャネル基本設定**からChannel IDとChannel Secretを取得
4. **LINE Login設定**で以下を設定:
   - **Callback URL**: `https://your-cognito-domain.auth.region.amazoncognito.com/oauth2/idpresponse`
   - **メールアドレス取得権限**: 必要に応じて有効化

### 3. AWS Cognito設定

#### User Poolの作成

1. [AWS Cognito Console](https://console.aws.amazon.com/cognito/)にアクセス
2. **User Pools > Create user pool**
3. 以下の設定を行う:
   - **Sign-in options**: Email
   - **Password policy**: お好みで設定
   - **MFA**: Optional (お好みで)

#### App Clientの作成

1. User Pool > **App integration**タブ
2. **Create app client**
3. 以下を設定:
   - **App client name**: frontend-sample-cognito
   - **Authentication flows**:
     - ☑ ALLOW_REFRESH_TOKEN_AUTH
     - ☑ ALLOW_USER_SRP_AUTH
   - **OAuth 2.0 settings**:
     - **Allowed callback URLs**: `http://localhost:3000`
     - **Allowed sign-out URLs**: `http://localhost:3000`
     - **OAuth scopes**: `openid`, `email`, `profile`
     - **OAuth grant types**: Authorization code grant

#### Hosted UIドメインの設定

1. User Pool > **App integration**タブ
2. **Domain**セクションで**Create Cognito domain**
3. 任意のドメインプレフィックスを入力（例: `my-app-auth`）

#### ソーシャルIDプロバイダーの追加

##### Googleプロバイダー

1. User Pool > **Sign-in experience**タブ
2. **Federated identity provider sign-in > Add identity provider**
3. **Google**を選択
4. Google CloudコンソールでメモしたClient IDとClient Secretを入力
5. **Attribute mapping**:
   - Google attribute `email` → User pool attribute `email`
   - Google attribute `name` → User pool attribute `name`

##### Facebookプロバイダー

1. User Pool > **Sign-in experience**タブ
2. **Federated identity provider sign-in > Add identity provider**
3. **Facebook**を選択
4. Facebook for DevelopersでメモしたApp IDとApp Secretを入力
5. **Attribute mapping**:
   - Facebook attribute `email` → User pool attribute `email`
   - Facebook attribute `name` → User pool attribute `name`

##### LINEプロバイダー (OIDC)

1. User Pool > **Sign-in experience**タブ
2. **Federated identity provider sign-in > Add identity provider > OpenID Connect**
3. 以下を設定:
   - **Provider name**: `LINE`
   - **Client ID**: LINE Channel ID
   - **Client secret**: LINE Channel Secret
   - **Authorize scope**: `openid profile email`
   - **Issuer**: `https://access.line.me`
   - **Authorization endpoint**: `https://access.line.me/oauth2/v2.1/authorize`
   - **Token endpoint**: `https://api.line.me/oauth2/v2.1/token`
   - **Userinfo endpoint**: `https://api.line.me/v2/profile`
   - **Jwks uri**: `https://api.line.me/oauth2/v2.1/certs`
4. **Attribute mapping**:
   - OIDC attribute `sub` → User pool attribute `username`
   - OIDC attribute `name` → User pool attribute `name`
   - OIDC attribute `email` → User pool attribute `email`

### 4. 環境変数の設定

`packages/backend-sample-cognito/.env.example`を`.env`にコピーし、AWS Cognitoの情報を設定:

```bash
cd packages/backend-sample-cognito
cp .env.example .env
```

`.env`ファイルを編集:

```env
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=your-app-client-id
COGNITO_DOMAIN=your-domain-prefix.auth.us-east-1.amazoncognito.com
COGNITO_REDIRECT_SIGN_IN=http://localhost:3000
COGNITO_REDIRECT_SIGN_OUT=http://localhost:3000
```

## 🏃 実行

### 開発モード

```bash
# フロントエンドとバックエンドを同時起動
bun run dev

# または個別に起動
bun run dev:frontend  # http://localhost:3000
bun run dev:backend   # http://localhost:3001
```

### ビルド

```bash
bun run build
```

## 🔧 技術スタック

- **ランタイム**: Bun
- **フロントエンド**: HTML + TypeScript + Bun.serve
- **バックエンド**: Bun + tRPC + AWS Amplify
- **認証**: AWS Cognito + Google/Facebook/LINE OAuth
- **モノレポ**: Bun Workspaces
- **型システム**: TypeScript + tRPC (型安全なAPI通信)

## 📚 API エンドポイント

### tRPC API (http://localhost:3001/trpc)

- `auth.loginWithProvider({ provider })` - プロバイダー指定ログイン
  - `provider`: `'Google'` | `'Facebook'` | `'LINE'` | `'Apple'`
- `auth.sendMagicLink({ email })` - マジックリンク送信
- `auth.verifyMagicLink({ token })` - マジックリンクトークン検証
- `auth.logout` - ログアウト
- `auth.isAuthenticated` - 認証状態チェック
- `auth.getUserInfo` - ユーザー情報取得
- `auth.getAccessToken` - アクセストークン取得

## 🎯 機能

- ✅ Google OAuthでのサインアップ・サインイン
- ✅ Facebook Loginでのサインアップ・サインイン
- ✅ LINE Loginでのサインアップ・サインイン
- ✅ メールアドレスによるマジックリンク認証
- ✅ フロントエンドとバックエンドの完全分離
- ✅ tRPCによる型安全なAPI通信
- ✅ モノレポ構成によるコード共有
- ✅ Hot Module Replacement (HMR)対応
- ✅ レスポンシブデザイン

## 🎨 UI

ログイン画面には以下のサインイン方法が表示されます：

### ソーシャルログイン
- **Googleでサインイン** (青色)
- **Facebookでサインイン** (青色)
- **LINEでサインイン** (緑色)

各ボタンをクリックすると、対応するOAuthプロバイダーの認証画面にリダイレクトされます。

### マジックリンク認証
- メールアドレスを入力して「サインインリンクを送信」ボタンをクリック
- バックエンドコンソールに認証用URLが表示されます（メール送信はスタブ）
- 認証用URLにアクセスすると自動的にサインインが完了します
- トークンの有効期限は15分間です

## 📝 ライセンス

Private

## 🤝 貢献

このプロジェクトはプライベートプロジェクトです。
