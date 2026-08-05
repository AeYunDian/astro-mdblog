export default {
  async fetch(request, env) {
    return env.assets.fetch(request);
  },
};
