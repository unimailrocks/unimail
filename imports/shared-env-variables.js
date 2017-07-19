import { Meteor } from 'meteor/meteor';

export function getEnvironmentVariable(name) {
  return Meteor.settings.public[name];
}

export function share(name) {
  if (process.env[name]
    && typeof global.__meteor_runtime_config__ === 'object'
    && typeof global.__meteor_runtime_config__.PUBLIC_SETTINGS === 'object'
  ) {
    global.__meteor_runtime_config__.PUBLIC_SETTINGS[name] = process.env[name];
  } else {
    console.error('ENVIRONMENT VARIABLE SHARING NEEDS TO BE RETHOUGHT');
  }
}
