import createMailgunClient from 'mailgun-js';

const client = createMailgunClient({
  apiKey: 'key-fc10f99bf99ccbccaf9af615234ca3dd',
  domain: 'mg.unimail.co',
});

// takes {
//   from (optional),
//   to,
//   subject,
//   html,
//   (maybe other stuff; see https://www.npmjs.com/package/mailgun-js)
// }
export function sendEmail(data) {
  return client.messages().send({
    from: 'unimail <support@unimail.co>',
    ...data,
  });
}
