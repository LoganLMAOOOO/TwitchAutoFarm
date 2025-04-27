import { 
  Account, InsertAccount, 
  Farm, InsertFarm, 
  Log, InsertLog, 
  Stat, InsertStat,
  User, InsertUser
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Account management
  getAccounts(): Promise<Account[]>;
  getAccount(id: number): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: number, account: Partial<Account>): Promise<Account | undefined>;
  deleteAccount(id: number): Promise<boolean>;

  // Farm management
  getFarms(): Promise<Farm[]>;
  getFarm(id: number): Promise<Farm | undefined>;
  getFarmsByAccountId(accountId: number): Promise<Farm[]>;
  createFarm(farm: InsertFarm): Promise<Farm>;
  updateFarm(id: number, farm: Partial<Farm>): Promise<Farm | undefined>;
  deleteFarm(id: number): Promise<boolean>;

  // Log management
  getLogs(limit?: number): Promise<Log[]>;
  getLogsByAccountId(accountId: number, limit?: number): Promise<Log[]>;
  getLogsByChannelName(channelName: string, limit?: number): Promise<Log[]>;
  createLog(log: InsertLog): Promise<Log>;

  // Stats management
  getCurrentStats(): Promise<Stat | undefined>;
  updateStats(stats: Partial<Stat>): Promise<Stat | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private accounts: Map<number, Account>;
  private farms: Map<number, Farm>;
  private logs: Log[];
  private currentStats: Stat | undefined;
  
  private currentUserId: number;
  private currentAccountId: number;
  private currentFarmId: number;
  private currentLogId: number;

  constructor() {
    this.users = new Map();
    this.accounts = new Map();
    this.farms = new Map();
    this.logs = [];
    
    this.currentUserId = 1;
    this.currentAccountId = 1;
    this.currentFarmId = 1;
    this.currentLogId = 1;
    
    // Set initial stats
    this.currentStats = {
      id: 1,
      date: new Date(),
      activeFarms: 0,
      pointsClaimed: 0,
      watchHours: 0,
      predictionRate: 0
    };
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Account methods
  async getAccounts(): Promise<Account[]> {
    return Array.from(this.accounts.values());
  }

  async getAccount(id: number): Promise<Account | undefined> {
    return this.accounts.get(id);
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const id = this.currentAccountId++;
    const account: Account = { ...insertAccount, id, active: true };
    this.accounts.set(id, account);
    return account;
  }

  async updateAccount(id: number, accountUpdate: Partial<Account>): Promise<Account | undefined> {
    const account = this.accounts.get(id);
    if (!account) return undefined;
    
    const updatedAccount = { ...account, ...accountUpdate };
    this.accounts.set(id, updatedAccount);
    return updatedAccount;
  }

  async deleteAccount(id: number): Promise<boolean> {
    // Delete all farms for this account first
    const accountFarms = await this.getFarmsByAccountId(id);
    for (const farm of accountFarms) {
      await this.deleteFarm(farm.id);
    }
    
    return this.accounts.delete(id);
  }

  // Farm methods
  async getFarms(): Promise<Farm[]> {
    return Array.from(this.farms.values());
  }

  async getFarm(id: number): Promise<Farm | undefined> {
    return this.farms.get(id);
  }

  async getFarmsByAccountId(accountId: number): Promise<Farm[]> {
    return Array.from(this.farms.values()).filter(
      (farm) => farm.accountId === accountId
    );
  }

  async createFarm(insertFarm: InsertFarm): Promise<Farm> {
    const id = this.currentFarmId++;
    const farm: Farm = {
      ...insertFarm,
      id,
      channelId: "",
      profileImage: "",
      status: "active",
      uptime: 0,
      pointsClaimed: 0,
      watchTime: 0,
      enabled: true,
      lastActivity: new Date()
    };
    
    this.farms.set(id, farm);
    
    // Update stats
    if (this.currentStats) {
      this.currentStats.activeFarms += 1;
    }
    
    return farm;
  }

  async updateFarm(id: number, farmUpdate: Partial<Farm>): Promise<Farm | undefined> {
    const farm = this.farms.get(id);
    if (!farm) return undefined;
    
    const updatedFarm = { ...farm, ...farmUpdate };
    this.farms.set(id, updatedFarm);
    return updatedFarm;
  }

  async deleteFarm(id: number): Promise<boolean> {
    const farm = this.farms.get(id);
    if (farm && this.currentStats) {
      this.currentStats.activeFarms -= 1;
    }
    
    return this.farms.delete(id);
  }

  // Log methods
  async getLogs(limit = 100): Promise<Log[]> {
    return this.logs.slice(-limit).reverse();
  }

  async getLogsByAccountId(accountId: number, limit = 100): Promise<Log[]> {
    return this.logs
      .filter(log => log.accountId === accountId)
      .slice(-limit)
      .reverse();
  }

  async getLogsByChannelName(channelName: string, limit = 100): Promise<Log[]> {
    return this.logs
      .filter(log => log.channelName === channelName)
      .slice(-limit)
      .reverse();
  }

  async createLog(insertLog: InsertLog): Promise<Log> {
    const id = this.currentLogId++;
    const log: Log = {
      ...insertLog,
      id,
      timestamp: new Date()
    };
    
    // Send to Discord webhook
    const { sendDiscordLog } = await import('./discord-logger');
    await sendDiscordLog(log);
    
    this.logs.push(log);
    
    // Keep logs limited to prevent memory issues
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
    
    return log;
  }

  // Stats methods
  async getCurrentStats(): Promise<Stat | undefined> {
    return this.currentStats;
  }

  async updateStats(statsUpdate: Partial<Stat>): Promise<Stat | undefined> {
    if (!this.currentStats) return undefined;
    
    this.currentStats = {
      ...this.currentStats,
      ...statsUpdate
    };
    
    return this.currentStats;
  }
}

export const storage = new MemStorage();
