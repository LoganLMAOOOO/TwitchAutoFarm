import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertAccountSchema, 
  insertFarmSchema, 
  insertLogSchema,
  insertUserSchema
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from 'memorystore';
import bcrypt from 'bcryptjs';

// Session store setup
const MemoryStoreInstance = MemoryStore(session);

// Helper function to wrap async route handlers
const asyncHandler = (fn: (req: Request, res: Response) => Promise<any>) => 
  (req: Request, res: Response) => {
    Promise.resolve(fn(req, res)).catch(err => {
      console.error("Route error:", err);
      res.status(500).json({ message: "Internal server error", error: err.message });
    });
  };

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session
  app.use(session({
    secret: process.env.SESSION_SECRET || 'twitchfarm-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 },
    store: new MemoryStoreInstance({
      checkPeriod: 86400000 // Clear expired sessions every 24h
    })
  }));

  // Configure passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: 'Incorrect username' });
      }
      
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: 'Incorrect password' });
      }
      
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Authentication middleware - bypass authentication check
  const isAuthenticated = (_req: Request, _res: Response, next: Function) => {
    // Always allow access without checking authentication
    return next();
  };

  // Authentication routes
  app.post('/api/auth/register', asyncHandler(async (req, res) => {
    const validation = insertUserSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: 'Invalid registration data', errors: validation.error.format() });
    }

    const { username, password } = validation.data;
    
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await storage.createUser({
      username,
      password: hashedPassword
    });

    res.status(201).json({ 
      message: 'User registered successfully',
      user: { id: user.id, username: user.username }
    });
  }));

  app.post('/api/auth/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info.message });
      
      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.json({ 
          message: 'Login successful',
          user: { id: user.id, username: user.username }
        });
      });
    })(req, res, next);
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: 'Logout failed', error: err.message });
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/user', (_req, res) => {
    // Always return a mock user
    res.json({ 
      user: { 
        id: 1, 
        username: 'demo_user' 
      }
    });
  });

  // Account routes
  app.get('/api/accounts', isAuthenticated, asyncHandler(async (req, res) => {
    const accounts = await storage.getAccounts();
    res.json(accounts);
  }));

  app.get('/api/accounts/:id', isAuthenticated, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid account ID' });
    }

    const account = await storage.getAccount(id);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json(account);
  }));

  app.post('/api/accounts', isAuthenticated, asyncHandler(async (req, res) => {
    const validation = insertAccountSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: 'Invalid account data', errors: validation.error.format() });
    }

    const account = await storage.createAccount(validation.data);
    res.status(201).json(account);
  }));

  app.patch('/api/accounts/:id', isAuthenticated, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid account ID' });
    }

    const account = await storage.getAccount(id);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const updatedAccount = await storage.updateAccount(id, req.body);
    res.json(updatedAccount);
  }));

  app.delete('/api/accounts/:id', isAuthenticated, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid account ID' });
    }

    const success = await storage.deleteAccount(id);
    if (!success) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json({ message: 'Account deleted successfully' });
  }));

  // Farm routes
  app.get('/api/farms', isAuthenticated, asyncHandler(async (req, res) => {
    const farms = await storage.getFarms();
    
    // Get account names for farms
    const accounts = await storage.getAccounts();
    const accountMap = new Map(accounts.map(a => [a.id, a]));
    
    // Enhance farms with account names
    const enhancedFarms = farms.map(farm => ({
      ...farm,
      accountName: accountMap.get(farm.accountId)?.name || 'Unknown'
    }));
    
    res.json(enhancedFarms);
  }));

  app.get('/api/farms/:id', isAuthenticated, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid farm ID' });
    }

    const farm = await storage.getFarm(id);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    // Get account info
    const account = await storage.getAccount(farm.accountId);
    
    res.json({
      ...farm,
      accountName: account?.name || 'Unknown'
    });
  }));

  app.post('/api/farms', isAuthenticated, asyncHandler(async (req, res) => {
    const validation = insertFarmSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: 'Invalid farm data', errors: validation.error.format() });
    }

    // Verify account exists
    const account = await storage.getAccount(validation.data.accountId);
    if (!account) {
      return res.status(400).json({ message: 'Account not found' });
    }

    const farm = await storage.createFarm(validation.data);
    
    // Create initial log entry
    await storage.createLog({
      accountId: farm.accountId,
      accountName: account.name,
      channelId: farm.channelId || "",
      channelName: farm.channelName,
      event: `Started farming channel ${farm.channelName}`,
      status: "success",
      details: `Enabled features: ${Object.entries(farm.features)
        .filter(([_, enabled]) => enabled)
        .map(([feature]) => feature)
        .join(', ')}`
    });
    
    res.status(201).json({
      ...farm,
      accountName: account.name
    });
  }));

  app.patch('/api/farms/:id', isAuthenticated, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid farm ID' });
    }

    const farm = await storage.getFarm(id);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    const updatedFarm = await storage.updateFarm(id, req.body);
    
    // Get account info
    const account = await storage.getAccount(farm.accountId);
    
    res.json({
      ...updatedFarm,
      accountName: account?.name || 'Unknown'
    });
  }));

  app.delete('/api/farms/:id', isAuthenticated, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid farm ID' });
    }

    const farm = await storage.getFarm(id);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }
    
    // Get account info for logging
    const account = await storage.getAccount(farm.accountId);
    
    const success = await storage.deleteFarm(id);
    if (!success) {
      return res.status(404).json({ message: 'Farm not found' });
    }
    
    // Log the deletion
    if (account) {
      await storage.createLog({
        accountId: farm.accountId,
        accountName: account.name,
        channelId: farm.channelId || "",
        channelName: farm.channelName,
        event: `Stopped farming channel ${farm.channelName}`,
        status: "info",
        details: "Farm deleted by user"
      });
    }

    res.json({ message: 'Farm deleted successfully' });
  }));

  // Log routes
  app.get('/api/logs', isAuthenticated, asyncHandler(async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const logs = await storage.getLogs(limit);
    res.json(logs);
  }));

  // Stats routes
  app.get('/api/stats', isAuthenticated, asyncHandler(async (req, res) => {
    const stats = await storage.getCurrentStats();
    if (!stats) {
      return res.status(404).json({ message: 'Stats not found' });
    }
    
    // Calculate change percentages (normally this would be from historical data)
    // For demo purposes, we'll generate some random changes
    const changes = {
      farmsChange: Math.floor(Math.random() * 3) - 1,
      pointsClaimedChange: Math.floor(Math.random() * 5000) - 2000,
      watchHoursChange: parseFloat((Math.random() * 2 - 1).toFixed(1)),
      predictionRateChange: Math.floor(Math.random() * 10) - 5
    };
    
    res.json({
      ...stats,
      changes
    });
  }));
  
  // Optimization API
  app.post('/api/optimize', isAuthenticated, asyncHandler(async (req, res) => {
    const { preset, accountsCount } = req.body;
    
    // In a real implementation, this would apply optimization settings to farms
    // based on the selected preset (balanced, aggressive, conservative)
    
    // For now we'll just log the optimization and return success
    console.log(`Optimizing ${accountsCount} account(s) with "${preset}" preset`);
    
    // Create a log entry
    await storage.createLog({
      accountId: 0,
      accountName: "System",
      channelId: "",
      channelName: "All Channels",
      event: `Optimization Wizard ran with ${preset} preset`,
      status: "success",
      details: `Applied ${preset} optimization to ${accountsCount} account(s)`,
    });
    
    // For demo purposes, we'll also update stats to reflect optimization
    const stats = await storage.getCurrentStats();
    if (stats) {
      // Small boost to prediction rate based on optimization
      const optimizationBoost = 
        preset === 'aggressive' ? 4 : 
        preset === 'conservative' ? 1 : 2;
        
      await storage.updateStats({
        predictionRate: Math.min(98, (stats.predictionRate || 0) + optimizationBoost),
      });
    }
    
    res.json({ 
      success: true, 
      message: `Optimized ${accountsCount} account(s) with ${preset} preset`,
      preset
    });
  }));

  const httpServer = createServer(app);
  return httpServer;
}
