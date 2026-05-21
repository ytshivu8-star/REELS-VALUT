import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import serverless from "serverless-http";

dotenv.config();

// Create the Express App
const app = express();

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[Proxy-Log] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Initialize Cashfree helper
const initCashfree = (): Cashfree | null => {
  const appId = process.env.CASHFREE_APP_ID || process.env.VITE_CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  
  if (!appId || !secretKey) {
    console.error("Missing Cashfree configuration in environment variables");
    return null;
  }
  
  const isProd = (process.env.CASHFREE_ENV || "").toUpperCase() === "PRODUCTION";
  const env = isProd ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

  try {
    const cashfree = new Cashfree(env, appId, secretKey);
    return cashfree;
  } catch (e) {
    console.error("Cashfree setup failed:", e);
    return null;
  }
};

// Define API Router
const apiRouter = express.Router();

// Health Check Endpoint
apiRouter.get("/health", (req, res) => {
  const configured = initCashfree();
  res.json({ 
    status: "ok", 
    cashfree_env: process.env.CASHFREE_ENV || "SANDBOX",
    cashfree_configured: !!configured,
    timestamp: new Date().toISOString()
  });
});

// Create Order Link Endpoint
apiRouter.post("/create-order", async (req, res) => {
  const cashfree = initCashfree();
  
  if (!cashfree) {
    console.warn("Cashfree not configured - check environment variables");
    return res.status(500).json({ 
      error: "Payment gateway not configured", 
      message: "Admin needs to set CASHFREE_APP_ID and CASHFREE_SECRET_KEY in Netlify Environment Variables." 
    });
  }

  try {
    const { orderAmount, customerId, customerName, customerEmail, customerPhone, productId } = req.body;
    console.log(`Order creation request received: Product=${productId}, Amount=${orderAmount}, User=${customerId}`);

    if (!orderAmount || !productId) {
      console.error("400 Bad Request: Missing orderAmount or productId");
      return res.status(400).json({ error: "Missing required fields: orderAmount and productId" });
    }

    // Capture accurate request protocol & host for Netlify serverless environments
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const protocol = req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const baseUrl = process.env.APP_URL || `${protocol}://${host}`;

    const request = {
      order_amount: Number(orderAmount),
      order_currency: "INR",
      customer_details: {
        customer_id: customerId || "guest_" + Date.now().toString(),
        customer_name: customerName || "Guest",
        customer_email: customerEmail || "guest@example.com",
        customer_phone: customerPhone?.toString() || "9999999999"
      },
      order_meta: {
        return_url: `${baseUrl}/payment-status?order_id={order_id}&product_id=${productId}`
      }
    };

    console.log("Creating Cashfree Order:", { productId, amount: orderAmount });

    // @ts-ignore
    const response = await cashfree.PGCreateOrder(request);
    
    if (response && response.data) {
      const isProdEnv = (process.env.CASHFREE_ENV || "").toUpperCase() === "PRODUCTION";
      res.json({
        ...response.data,
        environment: isProdEnv ? "production" : "sandbox"
      });
    } else {
      throw new Error("Empty response received from Cashfree");
    }
  } catch (error: any) {
    const errorData = error.response?.data || error;
    console.error("Cashfree Order Error:", errorData);
    
    res.status(500).json({ 
      error: "Internal Server Error",
      message: errorData?.message || "Authentication Failed. Please check your Cashfree credentials on Netlify Dashboard.",
      code: errorData?.code
    });
  }
});

// Verify Payment Status Endpoint
apiRouter.get("/verify-payment/:orderId", async (req, res) => {
  const cashfree = initCashfree();
  if (!cashfree) {
    return res.status(500).json({ error: "Cashfree credentials not configured" });
  }
  
  try {
    const { orderId } = req.params;
    // @ts-ignore
    const response = await cashfree.PGOrderFetchPayments(orderId);
    
    // Check if any payment was successful
    const payments = response.data || [];
    const successfulPayment = (payments as any[]).find((p: any) => p.payment_status === "SUCCESS");

    if (successfulPayment) {
      res.json({ status: "SUCCESS", payment: successfulPayment });
    } else {
      res.json({ status: "FAILED" });
    }
  } catch (error: any) {
    console.error("Cashfree Verify Error:", error.response?.data || error);
    res.status(500).json({ error: "Failed to verify payment" });
  }
});

// Route prefixes to match all redirected base endpoints
app.use("/api", apiRouter);
app.use("/.netlify/functions/index", apiRouter);
app.use("/.netlify/functions/api", apiRouter);
app.use("/", apiRouter);

// Export Express App for Vercel / local usage
export default app;

// Export Handler for Netlify Serverless Function
export const handler = serverless(app);
