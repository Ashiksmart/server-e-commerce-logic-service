module.exports = {
  OPERATION_TYPE: {
    CREATE: "create",
    UPDATE: "update",
    DELETE: "delete",
    VIEW: "view",
    EDIT: "edit",
  },
  ERROR_MSG: {
    INVALID_CRITERIA: "Invalid criteria",
    UNAUTHORIZED: "Unauthorized",
    NO_SCOPE: "User does not have scope",
    NOT_ACCESS_MODEL: "User does not have access to this model"
  },
  UNAUTHORIZED_ACCESS_MODELS: [{ model: "products", type: "view" }],
};
