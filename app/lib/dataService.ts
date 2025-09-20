import { handleApiError, ApiResponse } from "./api";
import { fetchApi } from "../api/fetchApi";
import { moPresetsApi } from "../api/moPresetsApi";
import { useMoStore } from "../store/moStore";
import { useProductStore } from "../store/productStore";
import { useWorkOrderStore } from "../store/workOrderStore";
import { useWorkCenterStore } from "../store/workCenterStore";
import { useBOMStore } from "../store/bomStore";
import { useInventoryStore } from "../store/inventoryStore";
import { useUserStore } from "../store/userStore";
import {
  ManufacturingOrder,
  Product,
  WorkOrder,
  WorkCenter,
  BillOfMaterial,
  ProductLedger,
  ProductStock,
  OrderStatus,
  WorkStatus,
  MovementType,
  Role,
} from "../types";

// Backend data structure mapping
interface BackendData {
  users?: any[];
  sessions?: any[];
  products?: any[];
  moPresets?: any[];
  billOfMaterials?: any[];
  manufacturingOrders?: any[];
  workOrders?: any[];
  workCenters?: any[];
  productLedgers?: any[];
  productStocks?: any[];
  reports?: any[];
}

// Data transformation functions
const transformBackendUser = (backendUser: any) => ({
  id: backendUser.id,
  email: backendUser.email || backendUser.loginId,
  name: backendUser.name,
  loginId: backendUser.loginId,
  role: backendUser.role as Role,
  createdAt: backendUser.createdAt,
  updatedAt: backendUser.updatedAt,
});

const transformBackendProduct = (backendProduct: any): Product => ({
  id: backendProduct.id,
  name: backendProduct.name,
  description: backendProduct.description,
  unit: backendProduct.unit || "unit",
  createdAt: new Date(backendProduct.createdAt),
  bom: backendProduct.bom,
  usedInBOM: backendProduct.usedInBOM,
  manufacturingOrders: backendProduct.manufacturingOrders,
  productLedger: backendProduct.productLedger,
  stock: backendProduct.stock,
});

const transformBackendManufacturingOrder = (
  backendMO: any,
): ManufacturingOrder => ({
  id: backendMO.id,
  quantity: backendMO.quantity,
  scheduleStartDate: backendMO.scheduleStartDate
    ? new Date(backendMO.scheduleStartDate)
    : undefined,
  deadline: backendMO.deadline ? new Date(backendMO.deadline) : undefined,
  status: backendMO.status as OrderStatus,
  createdAt: new Date(backendMO.createdAt),
  updatedAt: new Date(backendMO.updatedAt),
  productId: backendMO.productId,
  product: backendMO.product
    ? transformBackendProduct(backendMO.product)
    : undefined,
  createdById: backendMO.createdById,
  createdBy: backendMO.createdBy
    ? transformBackendUser(backendMO.createdBy)
    : ({} as any),
  assignedToId: backendMO.assignedToId,
  assignedTo: backendMO.assignedTo
    ? transformBackendUser(backendMO.assignedTo)
    : undefined,
  workOrders: backendMO.workOrders,
});

const transformBackendWorkOrder = (backendWO: any): WorkOrder => ({
  id: backendWO.id,
  operation: backendWO.operation,
  status: backendWO.status as WorkStatus,
  comments: backendWO.comments,
  startedAt: backendWO.startedAt ? new Date(backendWO.startedAt) : undefined,
  completedAt: backendWO.completedAt
    ? new Date(backendWO.completedAt)
    : undefined,
  createdAt: new Date(backendWO.createdAt),
  durationMins: backendWO.durationMins,
  durationDoneMins: backendWO.durationDoneMins || 0,
  moId: backendWO.moId,
  mo: backendWO.mo
    ? transformBackendManufacturingOrder(backendWO.mo)
    : ({} as any),
  workCenterId: backendWO.workCenterId,
  workCenter: backendWO.workCenter
    ? transformBackendWorkCenter(backendWO.workCenter)
    : undefined,
  assignedToId: backendWO.assignedToId,
  assignedTo: backendWO.assignedTo
    ? transformBackendUser(backendWO.assignedTo)
    : undefined,
});

const transformBackendWorkCenter = (backendWC: any): WorkCenter => ({
  id: backendWC.id,
  name: backendWC.name,
  location: backendWC.location,
  capacityPerHour: backendWC.capacityPerHour,
  costPerHour: backendWC.costPerHour,
  downtimeMins: backendWC.downtimeMins || 0,
  createdAt: new Date(backendWC.createdAt),
  workOrders: backendWC.workOrders,
});

const transformBackendBOM = (backendBOM: any): BillOfMaterial => ({
  id: backendBOM.id,
  productId: backendBOM.productId,
  product: backendBOM.product
    ? transformBackendProduct(backendBOM.product)
    : ({} as any),
  operation: backendBOM.operation,
  componentId: backendBOM.componentId,
  component: backendBOM.component
    ? transformBackendProduct(backendBOM.component)
    : ({} as any),
  quantity: backendBOM.quantity,
  createdAt: new Date(backendBOM.createdAt),
});

const transformBackendProductLedger = (backendLedger: any): ProductLedger => ({
  id: backendLedger.id,
  movementType: backendLedger.movementType as MovementType,
  quantity: backendLedger.quantity,
  referenceType: backendLedger.referenceType,
  referenceId: backendLedger.referenceId,
  createdAt: new Date(backendLedger.createdAt),
  productId: backendLedger.productId,
  product: backendLedger.product
    ? transformBackendProduct(backendLedger.product)
    : ({} as any),
});

const transformBackendProductStock = (backendStock: any): ProductStock => ({
  id: backendStock.id,
  productId: backendStock.productId,
  product: backendStock.product
    ? transformBackendProduct(backendStock.product)
    : ({} as any),
  quantity: backendStock.quantity || 0,
  updatedAt: new Date(backendStock.updatedAt),
});

// Main Data Service Class
class DataService {
  private static instance: DataService;
  private loading = false;
  private lastFetchTime: Date | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // Check if cache is still valid
  private isCacheValid(): boolean {
    if (!this.lastFetchTime) return false;
    const now = new Date();
    return now.getTime() - this.lastFetchTime.getTime() < this.CACHE_DURATION;
  }

  // Fetch all data from backend
  public async fetchAllData(forceRefresh = false): Promise<boolean> {
    if (this.loading) return false;
    if (!forceRefresh && this.isCacheValid()) return true;

    this.loading = true;

    try {
      // Check if user is authenticated
      const userStore = useUserStore.getState();
      if (!userStore.isLoggedIn) {
        console.warn("User not authenticated, skipping data fetch");
        this.loading = false;
        return false;
      }

      console.log("Fetching all data from backend...");
      const response = await fetchApi.getAll();

      if (response.data) {
        await this.updateStores(response.data);
        this.lastFetchTime = new Date();
        console.log("Data fetch completed successfully");
        this.loading = false;
        return true;
      } else {
        console.error("No data received from backend");
        this.loading = false;
        return false;
      }
    } catch (error) {
      console.error("Error fetching all data:", error);
      this.loading = false;
      return false;
    }
  }

  // Update all stores with fetched data
  private async updateStores(data: BackendData): Promise<void> {
    try {
      // Update Products
      if (data.products) {
        const products = data.products.map(transformBackendProduct);
        useProductStore.getState().setProducts(products);
        console.log(`Updated ${products.length} products`);
      }

      // Update Manufacturing Orders
      if (data.manufacturingOrders) {
        const manufacturingOrders = data.manufacturingOrders.map(
          transformBackendManufacturingOrder,
        );
        useMoStore.getState().setManufacturingOrders(manufacturingOrders);
        console.log(
          `Updated ${manufacturingOrders.length} manufacturing orders`,
        );
      }

      // Update Work Orders
      if (data.workOrders) {
        const workOrders = data.workOrders.map(transformBackendWorkOrder);
        useWorkOrderStore.getState().setWorkOrders(workOrders);
        console.log(`Updated ${workOrders.length} work orders`);
      }

      // Update Work Centers
      if (data.workCenters) {
        const workCenters = data.workCenters.map(transformBackendWorkCenter);
        useWorkCenterStore.getState().setWorkCenters(workCenters);
        console.log(`Updated ${workCenters.length} work centers`);
      }

      // Update Bill of Materials
      if (data.billOfMaterials) {
        const billOfMaterials = data.billOfMaterials.map(transformBackendBOM);
        useBOMStore.getState().setBillOfMaterials(billOfMaterials);
        console.log(`Updated ${billOfMaterials.length} BOM entries`);
      }

      // Update Product Ledger
      if (data.productLedgers) {
        const productLedger = data.productLedgers.map(
          transformBackendProductLedger,
        );
        useInventoryStore.getState().setProductLedger(productLedger);
        console.log(`Updated ${productLedger.length} ledger entries`);
      }

      // Update Product Stock
      if (data.productStocks) {
        const productStock = data.productStocks.map(
          transformBackendProductStock,
        );
        useInventoryStore.getState().setProductStock(productStock);
        console.log(`Updated ${productStock.length} stock entries`);
      }
    } catch (error) {
      console.error("Error updating stores:", error);
      throw error;
    }
  }

  // Fetch specific table data
  public async fetchTableData(tableName: string): Promise<any[] | null> {
    try {
      console.log(`Fetching ${tableName} data...`);
      const response = await fetchApi.getTable(tableName);

      if (response.data) {
        console.log(`Fetched ${response.data.length} ${tableName} records`);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching ${tableName} data:`, error);
      return null;
    }
  }

  // Fetch MO Presets separately (they have their own endpoint)
  public async fetchMOPresets(): Promise<boolean> {
    try {
      console.log("Fetching MO presets...");
      const response = await moPresetsApi.getAll();

      if (response.data) {
        // MO presets don't have a dedicated store yet, but we can log them
        console.log(`Fetched ${response.data.length} MO presets`);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error fetching MO presets:", error);
      return false;
    }
  }

  // Refresh specific data types
  public async refreshManufacturingOrders(): Promise<boolean> {
    try {
      const data = await this.fetchTableData("manufacturingorders");
      if (data) {
        const manufacturingOrders = data.map(
          transformBackendManufacturingOrder,
        );
        useMoStore.getState().setManufacturingOrders(manufacturingOrders);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error refreshing manufacturing orders:", error);
      return false;
    }
  }

  public async refreshWorkOrders(): Promise<boolean> {
    try {
      const data = await this.fetchTableData("workorders");
      if (data) {
        const workOrders = data.map(transformBackendWorkOrder);
        useWorkOrderStore.getState().setWorkOrders(workOrders);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error refreshing work orders:", error);
      return false;
    }
  }

  public async refreshProducts(): Promise<boolean> {
    try {
      const data = await this.fetchTableData("products");
      if (data) {
        const products = data.map(transformBackendProduct);
        useProductStore.getState().setProducts(products);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error refreshing products:", error);
      return false;
    }
  }

  public async refreshWorkCenters(): Promise<boolean> {
    try {
      const data = await this.fetchTableData("workcenters");
      if (data) {
        const workCenters = data.map(transformBackendWorkCenter);
        useWorkCenterStore.getState().setWorkCenters(workCenters);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error refreshing work centers:", error);
      return false;
    }
  }

  public async refreshInventory(): Promise<boolean> {
    try {
      const [ledgerData, stockData] = await Promise.all([
        this.fetchTableData("productledgers"),
        this.fetchTableData("productstocks"),
      ]);

      if (ledgerData) {
        const productLedger = ledgerData.map(transformBackendProductLedger);
        useInventoryStore.getState().setProductLedger(productLedger);
      }

      if (stockData) {
        const productStock = stockData.map(transformBackendProductStock);
        useInventoryStore.getState().setProductStock(productStock);
      }

      return !!(ledgerData || stockData);
    } catch (error) {
      console.error("Error refreshing inventory:", error);
      return false;
    }
  }

  public async refreshBOM(): Promise<boolean> {
    try {
      const data = await this.fetchTableData("billofmaterials");
      if (data) {
        const billOfMaterials = data.map(transformBackendBOM);
        useBOMStore.getState().setBillOfMaterials(billOfMaterials);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error refreshing BOM:", error);
      return false;
    }
  }

  // Get available tables
  public async getAvailableTables(): Promise<string[] | null> {
    try {
      const response = await fetchApi.getTables();
      if (response.data?.tables) {
        return response.data.tables;
      }
      return null;
    } catch (error) {
      console.error("Error fetching available tables:", error);
      return null;
    }
  }

  // Initialize app data
  public async initializeAppData(): Promise<boolean> {
    console.log("Initializing application data...");

    // First check if user is authenticated
    const userStore = useUserStore.getState();
    if (!userStore.isLoggedIn) {
      console.log("User not authenticated, skipping data initialization");
      return false;
    }

    // Fetch all data
    const success = await this.fetchAllData();

    if (success) {
      // Also fetch MO presets
      await this.fetchMOPresets();
    }

    return success;
  }

  // Force refresh all data
  public async forceRefresh(): Promise<boolean> {
    console.log("Force refreshing all data...");
    return await this.fetchAllData(true);
  }

  // Get loading state
  public isLoading(): boolean {
    return this.loading;
  }

  // Get last fetch time
  public getLastFetchTime(): Date | null {
    return this.lastFetchTime;
  }
}

// Export singleton instance
export const dataService = DataService.getInstance();

// Export utility functions for components
export const useDataService = () => {
  return {
    fetchAllData: (forceRefresh = false) =>
      dataService.fetchAllData(forceRefresh),
    refreshManufacturingOrders: () => dataService.refreshManufacturingOrders(),
    refreshWorkOrders: () => dataService.refreshWorkOrders(),
    refreshProducts: () => dataService.refreshProducts(),
    refreshWorkCenters: () => dataService.refreshWorkCenters(),
    refreshInventory: () => dataService.refreshInventory(),
    refreshBOM: () => dataService.refreshBOM(),
    initializeAppData: () => dataService.initializeAppData(),
    forceRefresh: () => dataService.forceRefresh(),
    isLoading: () => dataService.isLoading(),
    getLastFetchTime: () => dataService.getLastFetchTime(),
  };
};
