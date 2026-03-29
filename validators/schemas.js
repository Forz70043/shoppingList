const { z } = require('zod');

const signupSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  username: z.string().trim().min(3, 'Username must be at least 3 characters').max(50),
  email: z.string().trim().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  roles: z.union([
    z.string(),
    z.array(z.string()),
  ]).optional(),
});

const signinSchema = z.object({
  email: z.string().trim().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const listSchema = z.object({
  name: z.string().trim().min(1, 'List name is required').max(200),
});

const itemSchema = z.object({
  name: z.string().trim().min(1, 'Item name is required').max(200),
  quantity: z.number().int().positive('Quantity must be a positive integer').optional(),
});

module.exports = {
  signupSchema,
  signinSchema,
  listSchema,
  itemSchema,
};
