import { Accounts } from 'meteor/accounts-base';
import { Organizations } from '/imports/organizations';

Accounts.emailTemplates.siteName = 'Unimail';
Accounts.emailTemplates.from = 'Unimail <accounts@unimail.co>';
Accounts.emailTemplates.enrollAccount.subject = user => {
  if (!user.organizationID) {
    return 'Welcome to Unimail';
  }
  const organization = Organizations.findOne(user.organizationID);
  return `Unimail: You have been invited to join ${organization.name}`;
};

Accounts.emailTemplates.enrollAccount.html = (user, url) => {
  const organization = Organizations.findOne(user.organizationID);
  const html = `
    <h2>Welcome to Unimail</h2>
    <p>You have been invited to join the organization <strong>${organization.name}</strong> on Unimail</p>
    <p>Click <a href="${url}">here</a> to activate your account and set your password</p>

    <p>If you cannot click that link, please copy and paste <a href="${url}">${url}</a> into your browser.</p>
  `;

  return html;
};
