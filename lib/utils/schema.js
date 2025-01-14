const Validate = require("./validate")

const generateDynamicSchema = (model) => {
  if(Validate[model]){
  return Validate[model]()
  } else {
  return 'Validation schema not found'
  }
};
module.exports = { generateDynamicSchema };
