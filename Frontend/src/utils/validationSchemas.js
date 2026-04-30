import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  password: yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export const registerSchema = yup.object({
  name: yup.string()
    .required('Name is required')
    .max(50, 'Name cannot exceed 50 characters'),
  email: yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  password: yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  role: yup.string()
    .oneOf(['admin', 'waiter', 'kitchen', 'counter'])
    .required('Role is required'),
});

export const bookingSchema = yup.object({
  tableNumber: yup.number()
    .required('Table number is required')
    .min(1, 'Table number must be positive'),
  customerName: yup.string()
    .required('Customer name is required')
    .max(100, 'Name too long'),
  customerPhone: yup.string()
    .required('Phone number is required')
    .matches(/^\d{10}$/, 'Please enter a valid 10-digit phone number'),
  customerEmail: yup.string()
    .email('Invalid email format')
    .optional(),
  partySize: yup.number()
    .required('Party size is required')
    .min(1, 'Minimum 1 person')
    .max(20, 'Maximum 20 persons'),
  timeSlot: yup.date()
    .required('Time slot is required')
    .min(new Date(), 'Cannot book in the past'),
  duration: yup.number()
    .min(30, 'Minimum 30 minutes')
    .max(300, 'Maximum 5 hours')
    .default(90),
});

export const orderSchema = yup.object({
  orderType: yup.string()
    .oneOf(['DINE_IN', 'TAKEAWAY', 'DELIVERY'])
    .required('Order type is required'),
  tableNumber: yup.number()
    .when('orderType', {
      is: 'DINE_IN',
      then: (schema) => schema.required('Table number is required for dine-in'),
      otherwise: (schema) => schema.optional(),
    }),
  customerName: yup.string()
    .when('orderType', {
      is: (val) => val === 'TAKEAWAY' || val === 'DELIVERY',
      then: (schema) => schema.required('Customer name is required'),
      otherwise: (schema) => schema.optional(),
    }),
  customerPhone: yup.string()
    .when('orderType', {
      is: (val) => val === 'TAKEAWAY' || val === 'DELIVERY',
      then: (schema) => schema
        .required('Phone number is required')
        .matches(/^\d{10}$/, 'Please enter a valid 10-digit phone number'),
      otherwise: (schema) => schema.optional(),
    }),
  customerAddress: yup.string()
    .when('orderType', {
      is: 'DELIVERY',
      then: (schema) => schema.required('Address is required for delivery'),
      otherwise: (schema) => schema.optional(),
    }),
  items: yup.array()
    .of(
      yup.object({
        itemId: yup.string().required('Item is required'),
        quantity: yup.number()
          .required('Quantity is required')
          .min(1, 'Minimum quantity is 1'),
        specialInstructions: yup.string().optional(),
        customizations: yup.array().optional(),
      })
    )
    .min(1, 'At least one item is required')
    .required('Items are required'),
});

export const inventorySchema = yup.object({
  itemName: yup.string()
    .required('Item name is required')
    .max(100, 'Name too long'),
  category: yup.string()
    .oneOf(['vegetable', 'meat', 'dairy', 'beverage', 'spice', 'packaged', 'other'])
    .required('Category is required'),
  unit: yup.string()
    .oneOf(['kg', 'g', 'liter', 'ml', 'piece', 'packet', 'dozen'])
    .required('Unit is required'),
  currentStock: yup.number()
    .required('Current stock is required')
    .min(0, 'Stock cannot be negative'),
  minimumStock: yup.number()
    .required('Minimum stock is required')
    .min(0, 'Minimum stock cannot be negative'),
  unitPrice: yup.number()
    .required('Unit price is required')
    .min(0, 'Price cannot be negative'),
});