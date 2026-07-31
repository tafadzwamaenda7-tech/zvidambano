/**
 * Validation — Input validation utilities
 * Validates user input to prevent bad data
 */

export const validators = {
  email: (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  phone: (phone: string): boolean => {
    return /^\+263\d{9}$/.test(phone);
  },

  password: (password: string): { valid: boolean; message?: string } => {
    if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters' };
    if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain uppercase' };
    if (!/[0-9]/.test(password)) return { valid: false, message: 'Password must contain a number' };
    return { valid: true };
  },

  quantity: (qty: number): boolean => qty > 0 && qty <= 1000000,
  price: (price: number): boolean => price > 0 && price <= 100000,

  listing: (data: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (!data.title || data.title.length < 3) errors.push('Title must be at least 3 characters');
    if (!data.quantity || data.quantity <= 0) errors.push('Quantity must be positive');
    if (!data.asking_price || data.asking_price <= 0) errors.push('Price must be positive');
    if (!data.category) errors.push('Category is required');
    return { valid: errors.length === 0, errors };
  },

  contract: (data: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (!data.farmer_id) errors.push('Farmer is required');
    if (!data.offtaker_id) errors.push('Offtaker is required');
    if (!data.quantity || data.quantity <= 0) errors.push('Quantity must be positive');
    if (!data.farmer_price || data.farmer_price <= 0) errors.push('Farmer price must be positive');
    if (!data.offtaker_price || data.offtaker_price <= 0) errors.push('Offtaker price must be positive');
    if (data.offtaker_price <= data.farmer_price) errors.push('Offtaker price must be higher than farmer price');
    return { valid: errors.length === 0, errors };
  },

  delivery: (data: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (!data.contract_id) errors.push('Contract is required');
    if (!data.driver_id) errors.push('Driver is required');
    if (!data.vehicle_reg) errors.push('Vehicle registration is required');
    return { valid: errors.length === 0, errors };
  },
};