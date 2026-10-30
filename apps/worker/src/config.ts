import { connectionEnvironment, readEnvironment } from '@complyos/runtime/environment';
export function loadEnvironment() {
  const env=readEnvironment(new URL('../.env', import.meta.url)),base=connectionEnvironment(env),secret=env.FILE_ENCRYPTION_SECRET??env.ACCESS_JWT_SECRET??'';if(secret.length<32)throw new Error('FILE_ENCRYPTION_SECRET must contain at least 32 characters');return{...base,files:{root:env.FILE_STORAGE_ROOT??'.data/uploads',encryptionSecret:secret,grantSecret:env.FILE_GRANT_SECRET??secret,maxBytes:Number(env.FILE_MAX_BYTES??'10485760'),clamHost:env.CLAMAV_HOST??'127.0.0.1',clamPort:Number(env.CLAMAV_PORT??'3310')}};
}
