const bcrypt = require('bcryptjs');

function createBaseGenerator() {
  return {
    generate: () => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      return { code };
    },
    validate: (input, stored) => {
      return stored && stored.code && input === stored.code;
    }
  };
}

function withExpiry(generator, ttlMs = 5 * 60 * 1000) {
  const origGenerate = generator.generate.bind(generator);
  generator.generate = () => {
    const out = origGenerate();
    out.expiresAt = Date.now() + ttlMs;
    return out;
  };

  const origValidate = generator.validate.bind(generator);
  generator.validate = (input, stored) => {
    if (!stored || !stored.expiresAt) return false;
    if (Date.now() > stored.expiresAt) return false;
    return origValidate(input, stored);
  };

  return generator;
}

function withHashing(generator) {
  const origGenerate = generator.generate.bind(generator);
  generator.generate = () => {
    const out = origGenerate();
    const hash = bcrypt.hashSync(out.code, 8);

    const stored = {
      hash,
      expiresAt: out.expiresAt
    };
    return { code: out.code, stored };
  };

  generator.validate = (input, stored) => {
    if (!stored || !stored.hash) return false;
    if (stored.expiresAt && Date.now() > stored.expiresAt) return false;
    return bcrypt.compareSync(input, stored.hash);
  };

  return generator;
}

function createOTPGenerator({ ttlMs } = {}) {
  let gen = createBaseGenerator();
  if (ttlMs) gen = withExpiry(gen, ttlMs);
  gen = withHashing(gen);
  return gen;
}

module.exports = { createOTPGenerator };
