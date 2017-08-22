import React, { Component } from 'react';

const camelSplitter = /(.)([A-Z]+)/g;

function getListenerType(name) {
  const words = name.replace(camelSplitter, (m, previous, uppers) =>
    `${previous} ${uppers.split('').join(' ')}`,
  ).split(' ');
  if (words.length >= 3) {
    return {
      eventType: words[words.length - 1].toLowerCase(),
      target: words.slice(1, words.length - 1).join(''),
    };
  }

  return null;
}

export default class KeyListener extends Component {
  static listeners = null;
  static numMounted = 0;
  static numCreated = 0;
  static handlers = {};

  static startListening() {
    this.listeners = {};
    ['up', 'down'].forEach(eventType => {
      this.listeners[`key${eventType}`] = window.document.addEventListener(`key${eventType}`, event => {
        const key = event.key.toLowerCase();
        for (const id in this.handlers) {
          for (const target in this.handlers[id]) {
            if (target.toLowerCase() === key) {
              if (this.handlers[id][target][eventType]) {
                this.handlers[id][target][eventType](event);
              }
            }
          }
        }
      });
    });
  }

  static stopListening() {
    window.document.removeEventListener('keydown', this.listeners.keydown);
    window.document.removeEventListener('keyup', this.listeners.keydown);
    this.listeners = null;
  }

  componentWillMount() {
    this.constructor.numMounted += 1;
    this.constructor.numCreated += 1;
    this.id = this.constructor.numCreated;
    if (!this.constructor.listeners) {
      this.constructor.startListening();
    }
  }

  componentWillUnmount() {
    this.constructor.numMounted -= 1;
    if (this.constructor.numMounted === 0) {
      this.constructor.stopListening();
    }

    this.constructor.handlers[this.id] = {};
  }

  registerHandlers() {
    const { props } = this;
    this.constructor.handlers[this.id] = {};
    for (const key in props) {
      const { eventType, target } = getListenerType(key);
      this.constructor.handlers[this.id][target] = this.constructor.handlers[this.id][target] || {};
      this.constructor.handlers[this.id][target][eventType] = props[key];
    }
  }

  render() {
    this.registerHandlers();
    return null;
  }
}
