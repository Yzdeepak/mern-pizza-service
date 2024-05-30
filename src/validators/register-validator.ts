import { body, checkSchema } from "express-validator";

export default checkSchema({
  email: {
    errorMessage: "Email is required!",
    notEmpty: true,
    trim: true,
  },
  firstName: {
    errorMessage: "FirstName is required",
    notEmpty: true,
    trim: true,
  },
  lastName: {
    errorMessage: "lastName is required",
    notEmpty: true,
    trim: true,
  },
  password: {
    errorMessage: "lastName is required",
    notEmpty: true,
    trim: true,
  },
});

// export default [body("email").notEmpty().withMessage("Email is required")];
