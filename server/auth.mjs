import {betterAuth} from 'better-auth';

export function createAuth({database,origin,secret,allowProvisioning=false}) {
  if(!database||!origin||!secret||secret.length<32) throw new Error('Falta configurar la autenticación.');
  return betterAuth({
    appName:'Dharma Administración', database, baseURL:origin, basePath:'/api/auth', secret,
    trustedOrigins:[origin],
    emailAndPassword:{enabled:true,disableSignUp:!allowProvisioning,minPasswordLength:12,maxPasswordLength:128},
    session:{expiresIn:8*60*60,updateAge:60*60,cookieCache:{enabled:false}},
    advanced:{cookiePrefix:'dharma-admin',useSecureCookies:origin.startsWith('https:'),ipAddress:{ipAddressHeaders:[]}},
    // Un contador compartido por ruta evita depender de IPs aportadas por el cliente.
    rateLimit:{enabled:true,storage:'database',window:60,max:120,customRules:{'/sign-in/email':{window:60,max:5}}}
  });
}
