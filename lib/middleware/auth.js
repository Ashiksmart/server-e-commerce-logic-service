const Jwt = require("@hapi/jwt");
// const authKey = require("../plugins/@hapi.jwt");
const Constants = require("../utils/constants");
const Boom = require("@hapi/boom");
const APP_SECRET = process.env.APP_SECRET;
const verifyToken = (artifact, secret, options = {}) => {
  try {
    Jwt.token.verify(artifact, secret, options);
    return handleResponse(true);
  } catch (err) {
    return handleResponse(false, Boom.unauthorized(err.message));
  }
};

const handleResponse = (value, error) => {
  const responseData = { isValid: value };
  if (error) {
    responseData.error = error;
  }
  return responseData;
};
const verifyScope = (authToken, payloadModel, payloadType) => {
  const decoded = Jwt.token.decode(authToken);
  const validateToken = verifyToken(decoded, APP_SECRET);
  const decodeScope = decoded?.decoded?.payload?.scope;
  if (!decodeScope) {
    return handleResponse(false, Boom.forbidden(Constants.ERROR_MSG.NO_SCOPE));
  }
  if (validateToken.isValid) {
    const validateScope = decodeScope
      .split(",")
      .some(
        (scope) =>
          scope.split(":")[0] === payloadModel &&
          scope.split(":")[1] === payloadType
      );
    if (!validateScope) {
        return handleResponse(false, Boom.forbidden(Constants.ERROR_MSG.NO_SCOPE))
    }
  }
  return validateToken
};
const validateAuth = (request) => {
  try {
    const authToken = request.headers?.authorization
      ? request.headers.authorization.split(" ")[1]
      : "";
    const payloadModel = request.payload?.model;
    const payloadType = request.payload?.type;
    const unAuthAccess = Constants.UNAUTHORIZED_ACCESS_MODELS.some(
      (data) => data.model === payloadModel && data.type === payloadType
    );
    if (authToken) {
      return verifyScope(authToken, payloadModel, payloadType);
    } else if (unAuthAccess) {
      return handleResponse(true);
    } else {
      return handleResponse(false,  Boom.unauthorized(Constants.ERROR_MSG.UNAUTHORIZED));
    }
  } catch (error) {
    console.log("error", error);
    return handleResponse(false, Boom.unauthorized(error.message))
  }
};

module.exports = { validateAuth };
