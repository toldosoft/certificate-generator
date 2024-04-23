// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
     swcMinify: true,  // Habilitar a minificação com SWC (se necessário)
     rewrites() {
       return [
         {
           source: '/api/:path*',
           destination: 'http://localhost:8000/:path*'
         },
       ]
     },
   };
   
   export default nextConfig;
   