function maskArgs(args) {
  try {
    return JSON.stringify(args, (k, v) => {
      if (!k) return v;
      if (/pass(word)?|token|otp|code|card|pan/i.test(k)) return '***';
      return v;
    });
  } catch (e) {
    return '[unserializable args]';
  }
}

function loggingDecorator(fn, name) {
  return async function wrapped(...args) {
    const start = Date.now();
    try {
      console.log(`[${name}] in`, maskArgs(args));
    } catch (e) {}

    try {
      const result = await fn.apply(this, args);
      const took = Date.now() - start;
      try {
        const short = (typeof result === 'object') ? '[object]' : result;
        console.log(`[${name}] out (took ${took}ms)`, short);
      } catch (e) {}
      return result;
    } catch (err) {
      const took = Date.now() - start;
      console.error(`[${name}] error (took ${took}ms)`, err && err.message ? err.message : err);
      throw err;
    }
  };
}

module.exports = { loggingDecorator };
