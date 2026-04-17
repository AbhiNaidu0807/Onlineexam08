export const successResponse = (res, data, message = 'Success', status = 200) => {
  return res.status(status).json({
    success: true,
    data,
    message,
    error: null
  });
};

export const errorResponse = (res, error, message = 'Error', status = 500) => {
  return res.status(status).json({
    success: false,
    data: null,
    message,
    error: error.message || error
  });
};
