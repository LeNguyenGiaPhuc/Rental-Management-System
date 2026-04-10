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
  return {
    generate() {
      const out = generator.generate();
      return {
        ...out,
        expiresAt: Date.now() + ttlMs
      };
    },

    validate(input, stored) {
      if (!stored || !stored.expiresAt) return false;
      if (Date.now() > stored.expiresAt) return false;
      return generator.validate(input, stored);
    }
  };
}

function withHashing(generator) {
  return {
    generate() {
      const out = generator.generate();
      const hash = bcrypt.hashSync(out.code, 8);

      return {
        code: out.code,
        stored: {
          hash,
          expiresAt: out.expiresAt
        }
      };
    },

    validate(input, stored) {
      if (!stored || !stored.hash) return false;
      if (stored.expiresAt && Date.now() > stored.expiresAt) return false;
      return bcrypt.compareSync(input, stored.hash);
    }
  };
}

function createOTPGenerator({ ttlMs } = {}) {
  let gen = createBaseGenerator();
  if (ttlMs) gen = withExpiry(gen, ttlMs);
  gen = withHashing(gen);
  return gen;
}

module.exports = { createOTPGenerator };
