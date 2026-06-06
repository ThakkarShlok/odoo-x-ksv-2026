export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const isValidPassword = (password) =>
  typeof password === 'string' && password.length >= 8

export const isRequired = (value) =>
  value !== null && value !== undefined && String(value).trim().length > 0

export const getFieldError = (errors, field) =>
  errors?.[field]?.message ?? null
