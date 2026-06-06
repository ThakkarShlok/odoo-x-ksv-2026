module.exports = function errorHandler(err, _req, res, _next) {
  console.error(err)
  const status = err.status || err.statusCode || 500
  res.status(status).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
