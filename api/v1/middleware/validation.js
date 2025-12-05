const { body, param, validationResult } = require('express-validator');

exports.validateItem = [
  body('name').trim().notEmpty().withMessage('Item name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be non-negative'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be non-negative'),
  body('supplier').isMongoId().withMessage('Invalid supplier ID'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

exports.validateSupplier = [
  body('name').trim().notEmpty().withMessage('Supplier name is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

exports.validateId = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
