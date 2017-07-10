import url from 'url';
import unimail from 'unimail';

if (!process.env.UNIMAIL_API_URL) {
  console.error('You\'re about to see a bad message because `process.env.UNIMAIL_API_URL` is not set. Make sure it\'s set, please');
}
const parsedURL = url.parse(process.env.UNIMAIL_API_URL);

export function renderTemplate(template, token) {
  const client = unimail.createClient({
    tokenSecret: token.secret,
    tokenKey: token.key,
    cache: false,
    verbose: true,
    host: parsedURL.hostname,
    port: parsedURL.port,
    protocol: parsedURL.protocol,
  });

  return client.templates.render(template._id);
}
