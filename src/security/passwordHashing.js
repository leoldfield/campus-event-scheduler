import argon2 from "argon2-browser/dist/argon2-bundled.min.js";

const ARGON2ID_CONFIG = {
  time: 3,
  mem: 65536,
  hashLen: 32,
  parallelism: 1,
};

function createRandomSalt(size = 16) {
  const salt = new Uint8Array(size);
  crypto.getRandomValues(salt);
  return salt;
}

export async function hashPasswordWithArgon2id(password) {
  if (!password) {
    throw new Error("Password is required for hashing.");
  }

  const result = await argon2.hash({
    pass: password,
    salt: createRandomSalt(),
    type: argon2.ArgonType.Argon2id,
    ...ARGON2ID_CONFIG,
  });

  return result.encoded;
}
