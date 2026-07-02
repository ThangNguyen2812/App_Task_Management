import jwt from 'jsonwebtoken';

export const expiresTime = {
  access: '15m',
  refresh: '7d',
  refreshMs: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
};

export const generatetoken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: expiresTime.access
  });
};

export const refreshtoken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH || 'default_refresh_secret', {
    expiresIn: expiresTime.refresh
  });
};


