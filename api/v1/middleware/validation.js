const { body, param, validationResult } = require('express-validator');

// Validate item data
exports.validateItem = [
  body('name')
    .trim()
    .notEmpty().withMessage('Item name is required')
    .isLength({ max: 100 }).withMessage('Item name cannot exceed 100 characters'),
  
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isIn(['Electronics', 'Clothing', 'Food', 'Books', 'General', 'Office Supplies'])
    .withMessage('Invalid category'),
  
  body('stock')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  
  body('price')
    .isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  
  body('supplier')
    .isMongoId().withMessage('Invalid supplier ID'),
  
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

// Validate partial item update
exports.validateItemPartial = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Item name cannot be empty')
    .isLength({ max: 100 }).withMessage('Item name cannot exceed 100 characters'),
  
  body('category')
    .optional()
    .trim()
    .isIn(['Electronics', 'Clothing', 'Food', 'Books', 'General', 'Office Supplies'])
    .withMessage('Invalid category'),
  
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  
  body('supplier')
    .optional()
    .isMongoId().withMessage('Invalid supplier ID'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

// Validate supplier data
exports.validateSupplier = [
  body('name')
    .trim()
    .notEmpty().withMessage('Supplier name is required')
    .isLength({ max: 100 }).withMessage('Supplier name cannot exceed 100 characters'),
  
  body('contact')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Contact name cannot exceed 100 characters'),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Please enter a valid phone number'),
  
  body('email')
    .optional()
    .isEmail().withMessage('Please enter a valid email'),
  
  body('address')
    .optional()
    .isLength({ max: 200 }).withMessage('Address cannot exceed 200 characters'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

// Validate partial supplier update
exports.validateSupplierPartial = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Supplier name cannot be empty')
    .isLength({ max: 100 }).withMessage('Supplier name cannot exceed 100 characters'),
  
  body('email')
    .optional()
    .isEmail().withMessage('Please enter a valid email'),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Please enter a valid phone number'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

// Validate ID parameter
exports.validateId = [
  param('id')
    .isMongoId().withMessage('Invalid ID format'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];