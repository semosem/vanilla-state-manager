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
    if (params.hasOwnProperty("mulations")) {
      self.mutations = params.mutations;
    }
    console.log(`stateChange: ${key}: ${value}`);

    self.state = new Proxy(params.state || {}, {
      set: function(state, key, value) {
        state[key] = value;

        console.log(`stateChange: ${key}: ${value}`);

        self.events.publish("stateChange", self.state);

        if (self.status !== "mutation") {
          console.warn(`You should use a mutation to set ${key}`);
        }

        self.status = "resting";

        return true;
      }
    });
  }

  dispatch(actionKey, payload) {
    let self = this;
    if (typeof self.actions[actionKey] !== "function") {
      return false;
    }
    self.status = "action";
    self.actions[actionKey](self, payload);

    return true;
  }

  mutateState(mutationKey, payload) {
    let self = this;

    if (typeof self.mutations[mutationKey] !== "function") {
      return false;
    }

    self.status = "mutation";

    let newState = self.mutations[mutationKey](self.state, payload);

    self.state = Object.assign(self.state, newState);

    return true;
  }
}
