import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CITIZEN', 'VOLUNTEER', 'DONOR']),
});

export const sosSchema = z.object({
  latitude: z.number({ invalid_type_error: 'Location is required' }).min(-90).max(90, 'Invalid latitude'),
  longitude: z.number({ invalid_type_error: 'Location is required' }).min(-180).max(180, 'Invalid longitude'),
  urgencyLevel: z.enum(['HIGH', 'MEDIUM', 'LOW'], { errorMap: () => ({ message: 'Please select an urgency level' }) }),
  requiredSupplies: z.array(z.string()).min(1, 'Select at least one supply category'),
  notes: z.string().max(1000).optional(),
});

export const inventorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  category: z.string().min(1, 'Category is required'),
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  minimumThreshold: z.number().int().min(0, 'Threshold cannot be negative'),
  unit: z.string().optional(),
});

export const donationPledgeSchema = z.object({
  donorName: z.string().min(2, 'Name is required'),
  donorEmail: z.string().email('Invalid email'),
  items: z.array(z.object({
    name: z.string().min(1),
    quantity: z.number().int().min(1),
  })).min(1, 'At least one item required'),
});

export const dispatchAssignSchema = z.object({
  requestId: z.string().uuid('Invalid SOS request'),
  volunteerId: z.string().uuid('Invalid volunteer'),
});