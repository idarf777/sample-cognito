import { Amplify } from 'aws-amplify';

export function configureAmplify() {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
        userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
        loginWith: {
          oauth: {
            domain: import.meta.env.VITE_COGNITO_DOMAIN || '',
            scopes: ['openid', 'email', 'profile'],
            redirectSignIn: [import.meta.env.VITE_COGNITO_REDIRECT_SIGN_IN || 'http://localhost:3000/mypage'],
            redirectSignOut: [import.meta.env.VITE_COGNITO_REDIRECT_SIGN_OUT || 'http://localhost:3000'],
            responseType: 'code',
            providers : ['Google'],// 'Facebook', 'Amazon'],
          }
        }
      }
    }
  });
}
