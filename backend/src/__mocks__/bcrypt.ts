// Manual mock for bcrypt to avoid native module issues in Jest
export default {
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('salt'),
  hashSync: jest.fn().mockReturnValue('hashed_password_sync'),
  compareSync: jest.fn().mockReturnValue(true),
  genSaltSync: jest.fn().mockReturnValue('salt_sync'),
  getRounds: jest.fn().mockReturnValue(10),
};
