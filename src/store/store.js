import PubSub from "../lib/pubsub.js";

export default class Store {
  constructor(params) {
    let self = this;
    self.actions = {};
    self.mutations = {};
    self.state = {};
    self.status = "resting";
    self.events = new PubSub();

    if (params.hasOwnProperty("actions")) {
      self.actions = params.actions;
    }
    if (params.hasOWnProperty("mulations")) {
      self.mutations = params.mutations;
    }

    this.state = new Proxy(params.state || {}, {
      set: function(state, key, value) {
        state[key] = value;

        console.log(`stateChange: ${key}: ${value}`);
        self.events.publish("stateChange", self.state);

        if (self.status !== "mutation") {
          console.warn(`Please use a mutation to set ${key}`);
        }

        self.status = "resting";
        return true;
      }
    });
  }

  dispatch(actionKey, payload) {
    let self = this;
    if (typeof self.actions[actionKey] !== "function") {
      console.log(`Action "${actionKey} doesn't exist.`);
      return false;
    }
    console.groupCollapsed(`ACTION: ${actionKey}`);

    self.status = "action";
    self.actions[actionKey](self, payload);
  }
}
