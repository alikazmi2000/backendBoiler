const Joi = require('joi');


/**
 * Validates login with phone request
 */

exports.loginValidator = async (req, res, next) => {
  try {
    const data = req.body;

    const schema = Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
    });
    const { error, result } = await schema.validate(data)
    if (error) {
      return res.send({
        status: "ERROR",
        code: "402",
        message: error.message
      })
    }

    next();

  } catch (error) {
    return res.send({
      status: "ERROR",
      code: "402",
      message: "something went wrong"
    })

  }
}