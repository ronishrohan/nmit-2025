// Enums
export enum Role {
  ADMIN = "admin",
  MANAGER = "manager",
  INVENTORY_MANAGER = "inventory_manager",
  OPERATOR = "operator",
}

export enum OrderStatus {
  DRAFT = "draft",
  CONFIRMED = "confirmed",
  IN_PROGRESS = "in_progress",
  TO_CLOSE = "to_close",
  DONE = "done",
  CANCELLED = "cancelled",
}

export enum WorkStatus {
  TO_DO = "to_do",
  STARTED = "started",
  PAUSED = "paused",
  COMPLETED = "completed",
}

export enum MovementType {
  IN = "in",
  OUT = "out",
}

// Base interfaces
export interface User {
  id: number;
  email?: string;
  loginId?: string;
  fullName?: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: number;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  userId: number;
  user: User;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  unit: string;
  createdAt: Date;
  bom?: BillOfMaterial[];
  usedInBOM?: BillOfMaterial[];
  manufacturingOrders?: ManufacturingOrder[];
  productLedger?: ProductLedger[];
  stock?: ProductStock;
}

export interface BillOfMaterial {
  id: number;
  productId: number;
  product: Product;
  operation?: string;
  componentId: number;
  component: Product;
  quantity: number;
  createdAt: Date;
}

export interface ManufacturingOrder {
  id: number;
  quantity?: number;
  scheduleStartDate?: Date;
  deadline?: Date;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  productId?: number;
  product?: Product;
  createdById: number;
  createdBy: User;
  assignedToId?: number;
  assignedTo?: User;
  workOrders?: WorkOrder[];
}

export interface WorkOrder {
  id: number;
  operation: string;
  status: WorkStatus;
  comments?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  durationMins: number;
  durationDoneMins: number;
  moId: number;
  mo: ManufacturingOrder;
  workCenterId?: number;
  workCenter?: WorkCenter;
  assignedToId?: number;
  assignedTo?: User;
}

export interface WorkCenter {
  id: number;
  name: string;
  location?: string;
  capacityPerHour?: number;
  costPerHour?: number;
  downtimeMins: number;
  createdAt: Date;
  workOrders?: WorkOrder[];
}

export interface ProductLedger {
  id: number;
  movementType: MovementType;
  quantity: number;
  referenceType?: string;
  referenceId?: number;
  createdAt: Date;
  productId: number;
  product: Product;
}

export interface ProductStock {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  updatedAt: Date;
}

export interface Report {
  id: number;
  reportType: string;
  data: any; // JSON type
  generatedAt: Date;
  userId: number;
  user: User;
}

// Create/Update DTOs
export interface CreateManufacturingOrderDto {
  quantity?: number;
  scheduleStartDate?: Date;
  deadline?: Date;
  status: OrderStatus;
  productId?: number;
  createdById: number;
  assignedToId?: number;
}

export interface UpdateManufacturingOrderDto {
  id: number;
  quantity?: number;
  scheduleStartDate?: Date;
  deadline?: Date;
  status?: OrderStatus;
  productId?: number;
  assignedToId?: number;
}

export interface CreateWorkOrderDto {
  operation: string;
  status: WorkStatus;
  comments?: string;
  durationMins: number;
  moId: number;
  workCenterId?: number;
  assignedToId?: number;
}

export interface UpdateWorkOrderDto {
  id: number;
  operation?: string;
  status?: WorkStatus;
  comments?: string;
  startedAt?: Date;
  completedAt?: Date;
  durationMins?: number;
  durationDoneMins?: number;
  workCenterId?: number;
  assignedToId?: number;
}

export interface CreateWorkCenterDto {
  name: string;
  location?: string;
  capacityPerHour?: number;
  costPerHour?: number;
  downtimeMins?: number;
}

export interface UpdateWorkCenterDto {
  id: number;
  name?: string;
  location?: string;
  capacityPerHour?: number;
  costPerHour?: number;
  downtimeMins?: number;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  unit?: string;
}

export interface UpdateProductDto {
  id: number;
  name?: string;
  description?: string;
  unit?: string;
}

export interface CreateBillOfMaterialDto {
  productId: number;
  operation?: string;
  componentId: number;
  quantity: number;
}

export interface UpdateBillOfMaterialDto {
  id: number;
  productId?: number;
  operation?: string;
  componentId?: number;
  quantity?: number;
}

export interface CreateProductLedgerDto {
  movementType: MovementType;
  quantity: number;
  referenceType?: string;
  referenceId?: number;
  productId: number;
}

export interface CreateReportDto {
  reportType: string;
  data: any;
  userId: number;
}

// Filter/Query types
export interface ManufacturingOrderFilters {
  status?: OrderStatus;
  createdById?: number;
  assignedToId?: number;
  productId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface WorkOrderFilters {
  status?: WorkStatus;
  moId?: number;
  workCenterId?: number;
  assignedToId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface WorkCenterFilters {
  location?: string;
  search?: string;
}

export interface ProductFilters {
  unit?: string;
  search?: string;
}

export interface ProductLedgerFilters {
  movementType?: MovementType;
  productId?: number;
  referenceType?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
