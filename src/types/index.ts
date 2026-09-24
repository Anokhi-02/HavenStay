export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  uid?: string;
  fullName: string;
  name?: string;
  email: string;
  phone: string;
  collegeCompany?: string;
  collegeOrCompany?: string;
  address?: string;
  avatar: string;
  photoURL?: string;
  role: UserRole;
  blocked?: boolean;
  createdAt: string;
  updatedAt?: any;
}

export type RoomType = 'single' | 'double' | 'triple' | 'four_sharing';

export interface RoomOption {
  type: RoomType;
  name: string;
  price: number;
  securityDeposit: number;
  availableBeds: number;
  totalBeds: number;
  features: string[];
}

export type GenderType = 'boys' | 'girls' | 'unisex';

export interface PG {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  location: {
    address: string;
    area: string;
    city: string;
    pincode: string;
    landmark?: string;
  };
  gender: GenderType;
  rating: number;
  reviewCount: number;
  startingPrice: number;
  images: string[];
  amenities: string[];
  rules: string[];
  foodProvided: boolean;
  foodDetails?: string;
  roomOptions: RoomOption[];
  totalBeds?: number;
  availableBeds?: number;
  owner: {
    name: string;
    phone: string;
    email: string;
    avatar: string;
    responseTime: string;
    verified: boolean;
    alternatePhone?: string;
    caretakerName?: string;
    caretakerPhone?: string;
    officeHours?: string;
  };
  verified: boolean;
  featured: boolean;
  depositMonths: number;
  noticePeriodDays: number;
  createdAt: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending' | 'refunded';

export interface Booking {
  id: string;
  pgId: string;
  pgName: string;
  pgImage: string;
  pgLocation: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  roomType: RoomType;
  roomTypeName: string;
  occupants: number;
  checkInDate: string;
  durationMonths: number;
  monthlyRent: number;
  securityDeposit: number;
  maintenanceFee: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  notes?: string;
}

export interface ReviewCategoryScores {
  cleanliness: number;
  food: number;
  wifi: number;
  location: number;
  value: number;
}

export interface Review {
  id: string;
  pgId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  categories: ReviewCategoryScores;
  comment: string;
  date: string;
  createdAt?: string;
  verifiedStay: boolean;
  ownerReply?: {
    text: string;
    date: string;
    ownerName?: string;
  };
  highlighted?: boolean;
}

export type NotificationType = 'booking' | 'payment' | 'alert' | 'system';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  createdAt?: string;
  linkTab?: string;
}

export type Notification = NotificationItem;

export interface FilterOptions {
  city: string;
  searchQuery: string;
  gender: 'all' | GenderType;
  roomType: 'all' | RoomType;
  minPrice: number;
  maxPrice: number;
  foodIncluded: boolean;
  amenities: string[];
  sortBy: 'recommended' | 'price_asc' | 'price_desc' | 'rating';
}

export interface VisitRequest {
  id: string;
  pgId: string;
  name: string;
  phone: string;
  date: string;
  roomType: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  userId?: string;
  createdAt: string;
}

// Separated Tenant Entity & Statuses
export type KycStatus = 'verified' | 'pending' | 'rejected';
export type TenantStatus = 'active' | 'notice_period' | 'vacated';

export interface Tenant {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  pgId: string;
  pgName: string;
  roomNumber: string;
  bedNumber: string;
  roomType: RoomType;
  monthlyRent: number;
  securityDeposit: number;
  depositPaid: boolean;
  leaseStartDate: string;
  leaseEndDate: string;
  kycStatus: KycStatus;
  kycDocType: string;
  employmentType: 'working_professional' | 'student';
  companyOrCollege: string;
  pendingDue: number;
  status: TenantStatus;
  createdAt: string;
}

// Separated Admin Profile Entity
export type AdminRoleType = 'super_admin' | 'property_manager' | 'accountant';

export interface AdminProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  designation: string;
  role: AdminRoleType;
  permissions: string[];
  lastActive: string;
  createdAt: string;
}

// Immutable Admin Audit Logs
export type AdminLogCategory = 'tenant' | 'inventory' | 'billing' | 'maintenance' | 'system';

export interface AdminLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  category: AdminLogCategory;
  details: string;
  timestamp: string;
}

// Maintenance & Complaints Tickets
export type MaintenanceStatus = 'open' | 'in_progress' | 'resolved';
export type MaintenancePriority = 'urgent' | 'medium' | 'low';
export type MaintenanceCategory = 'plumbing' | 'electrical' | 'wifi' | 'cleaning' | 'food' | 'appliance' | 'other';

export interface MaintenanceRequest {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  pgId: string;
  roomNumber: string;
  category: MaintenanceCategory;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  assignedTo?: string;
  createdAt: string;
  resolvedAt?: string;
}
