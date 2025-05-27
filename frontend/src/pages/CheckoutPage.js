import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import websocketService from "../services/websocketService";
import axios from "axios";
import "./CheckoutPage.css";
import OrderSummary from "../components/checkout/OrderSummary";
import CustomerInformation from "../components/checkout/CustomerInformation";
import ContractSigning from "../components/checkout/ContractSigning";
import IDUpload from "../components/checkout/IDUpload";
import OrderConfirmation from "../components/checkout/OrderConfirmation";
import FirstTimeWelcome from "../components/checkout/FirstTimeWelcome";
import FastCheckoutConfirmation from "../components/checkout/FastCheckoutConfirmation";

const API_URL = process.env.REACT_APP_API_URL || "https://shula-rent-project-production.up.railway.app";

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const [isFirstTimeCustomer, setIsFirstTimeCustomer] = useState(false);
  const [onboardingChoice, setOnboardingChoice] = useState("");
  const [isFastCheckout, setIsFastCheckout] = useState(false);

  // Real-time WebSocket state for checkout validation
  const [realTimeInventory, setRealTimeInventory] = useState(new Map());
  const [inventoryConflicts, setInventoryConflicts] = useState(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [lastInventoryCheck, setLastInventoryCheck] = useState(null);
  const [checkoutValidationStatus, setCheckoutValidationStatus] = useState('pending'); // 'pending', 'validating', 'valid', 'invalid'

  // Add processing state to prevent multiple order submissions
  const [orderProcessing, setOrderProcessing] = useState(false);

  // Store original order data for success screen display
  const [originalOrderData, setOriginalOrderData] = useState(null);
  const [originalCartItems, setOriginalCartItems] = useState([]);
  const [originalTotal, setOriginalTotal] = useState(0);

  const [checkoutData, setCheckoutData] = useState({
    customerInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      idNumber: ""
    },
    pickupReturn: {
      pickupAddress: "main_store", // Use location ID instead of hardcoded address
      pickupDate: null, // Will be set to rental start date
      pickupTime: "17:00", // Fixed time within allowed range
      returnAddress: "main_store", // Use location ID instead of hardcoded address
      returnDate: null, // Will be set to rental end date
      returnTime: "19:00", // Fixed time within allowed range
      specialInstructions: ""
    },
    contract: {
      signed: false,
      signatureData: null,
      agreementVersion: "1.0",
      signedAt: null
    },
    idUpload: {
      uploaded: false,
      fileName: "",
      fileUrl: ""
    },
    payment: {
      method: "cash", // Fixed to cash only
      cardData: null,
      paymentStatus: "pending"
    }
  });

  // Helper to get auth headers
  const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = user.token || user.accessToken;
    return {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };
  };

  // Check if returning customer has complete information for fast checkout
  const checkForCompleteCustomerInfo = useCallback((orderData) => {
    if (!orderData || !orderData.customerInfo) {
      return false;
    }

    const { customerInfo, contract, idUpload } = orderData;
    
    // Check if customer info is complete (basic requirement)
    const hasCompleteCustomerInfo = customerInfo.firstName && 
                                  customerInfo.lastName && 
                                  customerInfo.email && 
                                  customerInfo.phone;
    
    // Check if they have any previous order completion (regardless of method)
    const hasOrderHistory = contract || idUpload;
    
    // For returning customers, if they have complete basic info and any order history,
    // they qualify for fast checkout (documents can be handled during pickup if needed)
    const qualifiesForFastCheckout = hasCompleteCustomerInfo && hasOrderHistory;
    
    console.log('Fast checkout qualification check:', {
      hasCompleteCustomerInfo,
      hasOrderHistory,
      qualifiesForFastCheckout,
      customerInfo: customerInfo.firstName && customerInfo.lastName && customerInfo.email && customerInfo.phone,
      contractExists: !!contract,
      idUploadExists: !!idUpload
    });
    
    return qualifiesForFastCheckout;
  }, []);

  // Get streamlined steps for returning customers with complete info
  const getStreamlinedSteps = useCallback(() => {
    return [
      { id: 1, title: "סיכום הזמנה", icon: "summary" },
      { id: 2, title: "אישור מהיר", icon: "lightning" }, // Fast confirmation step
      { id: 3, title: "השלמת הזמנה", icon: "check" }
    ];
  }, []);

  // Get full steps for first-time or incomplete returning customers
  const getFullSteps = useCallback(() => {
    const baseSteps = [
      { id: 1, title: "סיכום הזמנה", icon: "summary" },
      { id: 2, title: "פרטים אישיים", icon: "user" },
      { id: 3, title: "חתימה על הסכם", icon: "signature" },
      { id: 4, title: "העלאת תעודת זהות", icon: "document" },
      { id: 5, title: "אישור הזמנה", icon: "check" }
    ];

    if (isFirstTimeCustomer) {
      return [
        { id: 0, title: "ברוכים הבאים", icon: "welcome", condition: "firstTime" },
        ...baseSteps
      ];
    }
    
    return baseSteps;
  }, [isFirstTimeCustomer]);

  // Dynamic steps based on customer type and information completeness
  const steps = useMemo(() => {
    return isFastCheckout ? getStreamlinedSteps() : getFullSteps();
  }, [isFastCheckout, getStreamlinedSteps, getFullSteps]);

  // Validate that all cart items have the same rental period
  const validateRentalPeriods = (items) => {
    if (items.length <= 1) return { valid: true, message: "" };

    const firstItem = items[0];
    const firstStart = new Date(firstItem.rentalPeriod.startDate).getTime();
    const firstEnd = new Date(firstItem.rentalPeriod.endDate).getTime();

    for (let i = 1; i < items.length; i++) {
      const currentStart = new Date(items[i].rentalPeriod.startDate).getTime();
      const currentEnd = new Date(items[i].rentalPeriod.endDate).getTime();

      if (currentStart !== firstStart || currentEnd !== firstEnd) {
        return {
          valid: false,
          message: "כל הפריטים בהזמנה חייבים להיות לאותן תאריכי השכירות. אם ברצונך לשכור פריטים לתאריכים שונים, צור הזמנות נפרדות."
        };
      }
    }

    return { valid: true, message: "" };
  };

  const checkIfFirstTimeCustomer = useCallback(async () => {
    if (!user) return;
    
    try {
      const config = getAuthHeaders();
      const response = await axios.get(`${API_URL}/api/orders/user/${user._id}?limit=1`, config);
      
      if (response.data.orders && response.data.orders.length > 0) {
        // Customer has previous orders - not first time
        setIsFirstTimeCustomer(false);
        setCurrentStep(1); // Skip welcome step
      } else {
        // First time customer
        setIsFirstTimeCustomer(true);
        setCurrentStep(0); // Start with welcome step
      }
    } catch (err) {
      console.log("No previous orders found, treating as first-time customer");
      setIsFirstTimeCustomer(true);
      setCurrentStep(0);
    }
  }, [user]);

  const fetchCartItems = useCallback(async () => {
    try {
      setLoading(true);
      const config = getAuthHeaders();
      const response = await axios.get(`${API_URL}/api/carts/${user._id}`, config);
      
      if (response.data.length === 0) {
        navigate("/cart-page");
        return;
      }

      // Validate rental periods
      const validation = validateRentalPeriods(response.data);
      if (!validation.valid) {
        setError(validation.message);
        setLoading(false);
        return;
      }
      
      setCartItems(response.data);
      
      // Set pickup and return dates based on rental period
      if (response.data.length > 0) {
        const rentalPeriod = response.data[0].rentalPeriod;
        // Use functional update to ensure we preserve any existing pickup/return data
        setCheckoutData(prev => ({
          ...prev,
          pickupReturn: {
            ...prev.pickupReturn,
            pickupDate: new Date(rentalPeriod.startDate),
            returnDate: new Date(rentalPeriod.endDate)
          }
        }));
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching cart items:", err);
      setError("שגיאה בטעינת פריטי העגלה");
      setLoading(false);
    }
  }, [user?._id, navigate]);

  const populateCustomerInfo = useCallback(async () => {
    if (user) {
      console.log('Starting customer info population');
      
      try {
        const config = getAuthHeaders();
        // Fetch multiple orders to find the best data
        const response = await axios.get(`${API_URL}/api/orders/user/${user._id}?limit=10&sortBy=createdAt&sortOrder=desc`, config);
        
        console.log('Fetched orders for analysis:', response.data.orders?.length || 0);
        
        if (response.data.orders && response.data.orders.length > 0) {
          const orders = response.data.orders;
          console.log('Analyzing orders for best customer data...');
          
          // Find the order with the most complete customer information
          const bestOrder = findBestOrderData(orders);
          console.log('Best order analysis complete');
          
          if (bestOrder && bestOrder.customerInfo) {
            // Clean up ID number but preserve real values
            let idNumber = bestOrder.customerInfo.idNumber || "";
            if (["TBD", "", "undefined", "PENDING-IN-PERSON", "WILL_VERIFY_IN_PERSON"].includes(idNumber)) {
              idNumber = ""; // Clear placeholder values but keep real ID numbers
            }
            
            // Aggregate the best data from multiple orders
            const aggregatedData = aggregateCustomerData(orders, user);
            
            console.log('Customer data aggregation complete');
            
            // Pre-populate all checkout data with aggregated information
            setCheckoutData(prev => ({
              ...prev,
              customerInfo: {
                firstName: aggregatedData.customerInfo.firstName || user.firstName || "",
                lastName: aggregatedData.customerInfo.lastName || user.lastName || "",
                email: aggregatedData.customerInfo.email || user.email || "",
                phone: aggregatedData.customerInfo.phone || user.phone || "",
                idNumber: aggregatedData.customerInfo.idNumber
              },
              pickupReturn: {
                // Preserve existing dates (set by fetchCartItems) but update other fields
                pickupDate: prev.pickupReturn?.pickupDate || null,
                returnDate: prev.pickupReturn?.returnDate || null,
                pickupAddress: aggregatedData.pickupReturn.pickupAddress || "main_store",
                pickupTime: aggregatedData.pickupReturn.pickupTime || "17:00",
                returnAddress: aggregatedData.pickupReturn.returnAddress || aggregatedData.pickupReturn.pickupAddress || "main_store", 
                returnTime: aggregatedData.pickupReturn.returnTime || "19:00",
                specialInstructions: aggregatedData.pickupReturn.specialInstructions || ""
              },
              contract: aggregatedData.contract || {
                signed: false,
                signatureData: null,
                agreementVersion: "1.0",
                signedAt: null
              },
              idUpload: aggregatedData.idUpload || {
                uploaded: false,
                fileName: "",
                fileUrl: ""
              },
              payment: {
                method: "cash", // Always cash as per requirements
                cardData: null,
                paymentStatus: "pending"
              }
            }));
            
            // Check if this customer qualifies for fast checkout
            const hasCompleteInfo = checkForCompleteCustomerInfo({
              customerInfo: aggregatedData.customerInfo,
              contract: aggregatedData.contract,
              idUpload: aggregatedData.idUpload
            });
            
            setIsFastCheckout(hasCompleteInfo);
            console.log(`Customer ${hasCompleteInfo ? 'qualifies' : 'does not qualify'} for fast checkout`);
            console.log('Checkout data populated successfully');
            return;
          }
        }
        
        console.log('No complete order data found, using fallback user data');
      } catch (err) {
        console.error("Error fetching customer orders:", err.message);
        console.log("Falling back to user profile data");
      }

      // Fall back to user data (new customer - no fast checkout)
      console.log('Using basic user profile data for new customer');
      setIsFastCheckout(false);
      setCheckoutData(prev => ({
        ...prev,
        customerInfo: {
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phone: user.phone || "",
          idNumber: ""
        }
      }));
    }
  }, [user, checkForCompleteCustomerInfo]);

  // Helper function to find the order with the most complete data
  const findBestOrderData = (orders) => {
    if (!orders || orders.length === 0) return null;
    
    return orders.reduce((best, current) => {
      const currentScore = calculateOrderCompletenessScore(current);
      const bestScore = best ? calculateOrderCompletenessScore(best) : 0;
      
      // console.log('Analyzing order completeness scores');
      
      return currentScore > bestScore ? current : best;
    }, null);
  };

  // Helper function to calculate how complete an order's data is
  const calculateOrderCompletenessScore = (order) => {
    let score = 0;
    
    // Customer info scoring (most important)
    if (order.customerInfo) {
      if (order.customerInfo.firstName) score += 10;
      if (order.customerInfo.lastName) score += 10;
      if (order.customerInfo.email) score += 10;
      if (order.customerInfo.phone) score += 10;
      if (order.customerInfo.idNumber && !["TBD", "", "undefined", "PENDING-IN-PERSON", "WILL_VERIFY_IN_PERSON"].includes(order.customerInfo.idNumber)) {
        score += 15; // Real ID number is valuable
      }
    }
    
    // Pickup/return info scoring
    if (order.pickupReturn) {
      if (order.pickupReturn.pickupAddress && order.pickupReturn.pickupAddress !== "TBD") score += 8;
      if (order.pickupReturn.pickupTime) score += 3;
      if (order.pickupReturn.returnAddress && order.pickupReturn.returnAddress !== "TBD") score += 8;
      if (order.pickupReturn.returnTime) score += 3;
    }
    
    // Contract and ID upload scoring
    if (order.contract?.signed) score += 5;
    if (order.idUpload?.uploaded) score += 5;
    
    return score;
  };

  // Helper function to aggregate the best data from multiple orders
  const aggregateCustomerData = (orders, fallbackUser) => {
    const aggregated = {
      customerInfo: {
        firstName: fallbackUser.firstName || "",
        lastName: fallbackUser.lastName || "",
        email: fallbackUser.email || "",
        phone: fallbackUser.phone || "",
        idNumber: ""
      },
      pickupReturn: {
        pickupAddress: "main_store",
        pickupTime: "17:00",
        returnAddress: "main_store",
        returnTime: "19:00",
        specialInstructions: ""
      },
      contract: {
        signed: false,
        signatureData: null,
        agreementVersion: "1.0",
        signedAt: null
      },
      idUpload: {
        uploaded: false,
        fileName: "",
        fileUrl: ""
      }
    };
    
    // Aggregate customer info from the best available sources
    orders.forEach(order => {
      if (order.customerInfo) {
        // Take the first non-empty value for each field
        if (!aggregated.customerInfo.firstName && order.customerInfo.firstName) {
          aggregated.customerInfo.firstName = order.customerInfo.firstName;
        }
        if (!aggregated.customerInfo.lastName && order.customerInfo.lastName) {
          aggregated.customerInfo.lastName = order.customerInfo.lastName;
        }
        if (!aggregated.customerInfo.email && order.customerInfo.email) {
          aggregated.customerInfo.email = order.customerInfo.email;
        }
        if (!aggregated.customerInfo.phone && order.customerInfo.phone) {
          aggregated.customerInfo.phone = order.customerInfo.phone;
        }
        // For ID number, take the first real (non-placeholder) value
        if (!aggregated.customerInfo.idNumber && order.customerInfo.idNumber && 
            !["TBD", "", "undefined", "PENDING-IN-PERSON", "WILL_VERIFY_IN_PERSON"].includes(order.customerInfo.idNumber)) {
          aggregated.customerInfo.idNumber = order.customerInfo.idNumber;
        }
      }
      
      // Aggregate pickup/return info
      if (order.pickupReturn) {
        if (!aggregated.pickupReturn.pickupAddress || aggregated.pickupReturn.pickupAddress === "main_store") {
          if (order.pickupReturn.pickupAddress && order.pickupReturn.pickupAddress !== "TBD") {
            aggregated.pickupReturn.pickupAddress = order.pickupReturn.pickupAddress;
          }
        }
        if (!aggregated.pickupReturn.pickupTime || aggregated.pickupReturn.pickupTime === "17:00") {
          if (order.pickupReturn.pickupTime) {
            aggregated.pickupReturn.pickupTime = order.pickupReturn.pickupTime;
          }
        }
        if (!aggregated.pickupReturn.returnAddress || aggregated.pickupReturn.returnAddress === "main_store") {
          if (order.pickupReturn.returnAddress && order.pickupReturn.returnAddress !== "TBD") {
            aggregated.pickupReturn.returnAddress = order.pickupReturn.returnAddress;
          }
        }
        if (!aggregated.pickupReturn.returnTime || aggregated.pickupReturn.returnTime === "19:00") {
          if (order.pickupReturn.returnTime) {
            aggregated.pickupReturn.returnTime = order.pickupReturn.returnTime;
          }
        }
        if (!aggregated.pickupReturn.specialInstructions && order.pickupReturn.specialInstructions) {
          aggregated.pickupReturn.specialInstructions = order.pickupReturn.specialInstructions;
        }
      }
      
      // Take the most recent signed contract
      if (order.contract?.signed && !aggregated.contract.signed) {
        aggregated.contract = order.contract;
      }
      
      // Take the most recent uploaded ID
      if (order.idUpload?.uploaded && !aggregated.idUpload.uploaded) {
        aggregated.idUpload = order.idUpload;
      }
    });
    
    console.log('Data aggregation process complete');
    
    return aggregated;
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    const initializeCheckout = async () => {
      // First check if this is a first-time customer
      await checkIfFirstTimeCustomer();
      
      // Then fetch cart items to set pickup/return dates
      await fetchCartItems();
      
      // Finally populate customer info, preserving the dates set above
      await populateCustomerInfo();
    };
    
    initializeCheckout();
  }, [user, navigate, checkIfFirstTimeCustomer, fetchCartItems, populateCustomerInfo]);

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const { startDate, endDate } = item.rentalPeriod;
      const start = new Date(startDate);
      const end = new Date(endDate);
      const hours = (end - start) / 1000 / 3600;
      let periods = Math.max(1, Math.ceil(hours / 48));
      
      if (end.getDay() === 0) {
        periods = Math.max(1, periods - 1);
      }
      
      return sum + (periods * item.product.price);
    }, 0);
  };

  const calculateItemPrice = (item) => {
    const { startDate, endDate } = item.rentalPeriod;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const hours = (end - start) / 1000 / 3600;
    let periods = Math.max(1, Math.ceil(hours / 48));
    
    if (end.getDay() === 0) {
      periods = Math.max(1, periods - 1);
    }
    
    return periods * item.product.price;
  };

  const updateCheckoutData = (section, data) => {
    setCheckoutData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const nextStep = () => {
    // Get the maximum step ID from the steps array
    const maxStep = Math.max(...steps.map(step => step.id));
    if (currentStep < maxStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    // Get the minimum step ID from the steps array  
    const minStep = Math.min(...steps.map(step => step.id));
    if (currentStep > minStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Auto-scroll to top when step changes
  useEffect(() => {
    if (currentStep >= 0) {
      // Use setTimeout to ensure the new step content is rendered before scrolling
      setTimeout(() => {
        window.scrollTo({ 
          top: 0, 
          behavior: 'smooth' 
        });
      }, 100);
    }
  }, [currentStep]);

  const handleOnboardingChoice = async (choice) => {
    setOnboardingChoice(choice);
    if (choice === "in-person") {
      // Set minimal required data for in-person checkout without processing immediately
      const inPersonCheckoutData = {
        ...checkoutData,
        customerInfo: {
          firstName: user.firstName || "",
          lastName: user.lastName || "", 
          email: user.email || "",
          phone: user.phone || "",
          idNumber: "PENDING-IN-PERSON"
        },
        contract: {
          signed: false,
          signatureData: null,
          agreementVersion: "1.0",
          signedAt: null
        },
        idUpload: {
          uploaded: false,
          fileName: "",
          fileUrl: ""
        }
      };
      
      // Update state but don't process order yet - let user continue manually
      setCheckoutData(inPersonCheckoutData);
      console.log("In-person checkout selected - proceeding to order summary");
    }
    
    // Continue with next step for both online and in-person
    nextStep();
  };

  const canProceedFromStep = (step) => {
    if (isFastCheckout) {
      switch (step) {
        case 1:
          return cartItems.length > 0;
        case 2:
          return true; // Fast confirmation step
        default:
          return true;
      }
    }

    switch (step) {
      case 0:
        return onboardingChoice !== "";
      case 1:
        return cartItems.length > 0;
      case 2:
        const { firstName, lastName, email, phone, idNumber } = checkoutData.customerInfo;
        return firstName && lastName && email && phone && idNumber;
      case 3:
        return checkoutData.contract.signed;
      case 4:
        return checkoutData.idUpload.uploaded;
      default:
        return true;
    }
  };

  // Comprehensive pre-order validation - MOVED BEFORE processOrder
  const performFinalInventoryValidation = useCallback(async () => {
    if (!cartItems.length) {
      throw new Error('עגלת הקניות ריקה');
    }

    setCheckoutValidationStatus('validating');

    try {
      // First check real-time data if available
      for (const item of cartItems) {
        const realtimeData = realTimeInventory.get(item.product._id);
        
        if (realtimeData) {
          const availableUnits = realtimeData.availableNow || 0;
          if (availableUnits < 1) {
            throw new Error(`המוצר "${item.product.name}" אינו זמין יותר. אנא הסר אותו מהעגלה.`);
          }
        }
      }

      // Double-check with server-side validation
      const config = getAuthHeaders();
      const validationPromises = cartItems.map(async (item) => {
        const response = await axios.post(`${API_URL}/api/products/${item.product._id}/validate-availability`, {
          rentalPeriod: item.rentalPeriod,
          quantity: 1
        }, config);
        
        if (!response.data.isAvailable) {
          throw new Error(`המוצר "${item.product.name}" אינו זמין לתאריכים הנבחרים: ${response.data.message}`);
        }
        
        return response.data;
      });

      await Promise.all(validationPromises);
      setCheckoutValidationStatus('valid');
      
      console.log('Final inventory validation passed for all items');
      return true;
      
    } catch (error) {
      console.error('Final inventory validation failed:', error);
      setError('שגיאה באימות מלאי סופי');
      setOrderProcessing(false);
      return;
    }
  }, [cartItems, realTimeInventory]);

  const processOrder = useCallback(async (overrideCheckoutData = null, overrideOnboardingChoice = null, isFastCheckoutCompletion = false) => {
    // Prevent multiple simultaneous submissions
    if (orderProcessing) {
      console.log('Order already being processed, skipping...');
      return;
    }

    try {
      setOrderProcessing(true);
      
      // Perform comprehensive real-time inventory validation before processing
      console.log('Performing final inventory validation before order processing...');
      await performFinalInventoryValidation();

      const config = getAuthHeaders();
      const dataToUse = overrideCheckoutData || checkoutData;
      const choiceToUse = overrideOnboardingChoice || onboardingChoice;
      
      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          product: item.product._id,
          rentalPeriod: item.rentalPeriod,
          price: calculateItemPrice(item)
        })),
        totalValue: calculateTotal(),
        customerInfo: dataToUse.customerInfo,
        pickupReturn: dataToUse.pickupReturn,
        contract: dataToUse.contract,
        idUpload: dataToUse.idUpload,
        payment: dataToUse.payment,
        metadata: {
          checkoutVersion: "2.0",
          completedAt: new Date().toISOString(),
          onboardingChoice: choiceToUse,
          isFirstTimeCustomer: isFirstTimeCustomer,
          isFastCheckout: isFastCheckout,
          realTimeValidationStatus: checkoutValidationStatus,
          lastInventoryCheck: lastInventoryCheck?.toISOString()
        }
      };

      console.log("Creating order...");

      let response;
      if (isFastCheckout || onboardingChoice === "online") {
        console.log("Processing order with standard endpoint");
        const config = getAuthHeaders();
        response = await axios.post(`${API_URL}/api/orders`, orderData, config);
        console.log("Order created successfully");
      } else {
        // For in-person customers, use the regular endpoint but ensure all required data is present
        const config = getAuthHeaders();
        response = await axios.post(`${API_URL}/api/orders`, orderData, config);
        console.log("In-person order created successfully");
      }

      // Process membership if user doesn't already have one
      try {
        await axios.post(`${API_URL}/api/users/${user._id}/process-membership`, {}, getAuthHeaders());
        console.log("Membership processed successfully");
      } catch (membershipError) {
        console.error("Error processing membership (order was still created):", membershipError.message);
      }

      // Clear cart after successful order
      console.log("Clearing cart...");
      
      // Store original data for success screen before clearing
      setOriginalCartItems([...cartItems]);
      setOriginalTotal(calculateTotal());
      
      await axios.delete(`${API_URL}/api/carts/clear/${user._id}`, config);
      console.log("Cart cleared successfully");
      
      // Update local cart state to reflect the cleared cart
      setCartItems([]);
      console.log("Local cart state updated");
      
      // Scroll to top and move to confirmation
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Don't change step for fast checkout completion - let OrderConfirmation handle success screen
      if (!isFastCheckoutCompletion && !(isFastCheckout && currentStep === 3)) {
        setCurrentStep(steps.length - 1);
      }

      // Store original order data for success screen display
      setOriginalOrderData(orderData);

      return response.data;
    } catch (error) {
      console.error("Error processing order:", error);
      
      // Handle rate limiting errors
      if (error.response?.status === 429) {
        setError('יותר מדי בקשות הזמנה. אנא המתן דקה ונסה שוב.');
        
        // Auto-refresh after showing the error for a moment
        setTimeout(() => {
          setError('');
          setOrderProcessing(false);
        }, 3000);
        
        throw error;
      }
      
      // Handle specific inventory validation errors
      if (error.message.includes('זמין') || error.message.includes('available')) {
        setError(`בעיית זמינות: ${error.message}`);
        setCheckoutValidationStatus('invalid');
        
        // Refresh cart to remove unavailable items
        setTimeout(() => {
          window.location.href = '/cart-page';
        }, 3000);
      } else {
        console.error("Error details:", error.message);
        setError(error.message || 'שגיאה בעיבוד ההזמנה');
      }
      
      throw error;
    } finally {
      setOrderProcessing(false);
    }
  }, [orderProcessing, checkoutData, onboardingChoice, cartItems, isFirstTimeCustomer, isFastCheckout, checkoutValidationStatus, lastInventoryCheck, user._id, performFinalInventoryValidation, calculateTotal, calculateItemPrice, currentStep, steps.length]);

  const processInPersonOrder = async () => {
    try {
      // Perform real-time validation even for in-person orders
      console.log('Validating inventory for in-person order...');
      await performFinalInventoryValidation();

      const inPersonOrderData = {
        items: cartItems.map(item => ({
          product: item.product._id,
          rentalPeriod: item.rentalPeriod,
          price: calculateItemPrice(item)
        })),
        totalValue: calculateTotal(),
        customerInfo: {
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phone: user.phone || "",
          idNumber: "WILL_VERIFY_IN_PERSON"
        },
        pickupReturn: checkoutData.pickupReturn,
        contract: {
          signed: false,
          signatureData: null,
          agreementVersion: "1.0",
          signedAt: null,
          willSignInPerson: true
        },
        idUpload: {
          uploaded: false,
          fileName: "",
          fileUrl: "",
          willVerifyInPerson: true
        },
        payment: {
          method: "cash",
          cardData: null,
          paymentStatus: "pending"
        },
        metadata: {
          checkoutVersion: "2.0",
          completedAt: new Date().toISOString(),
          onboardingChoice: "in-person",
          isFirstTimeCustomer: isFirstTimeCustomer,
          isFastCheckout: false,
          realTimeValidationStatus: checkoutValidationStatus,
          lastInventoryCheck: lastInventoryCheck?.toISOString()
        }
      };

      console.log("Creating in-person order...");
      const config = getAuthHeaders();
      const response = await axios.post(`${API_URL}/api/orders`, inPersonOrderData, config);
      console.log("In-person order created successfully");
      
      // Clear cart after successful order
      console.log("Clearing cart...");
      
      // Store original data for success screen before clearing
      setOriginalCartItems([...cartItems]);
      setOriginalTotal(calculateTotal());
      
      await axios.delete(`${API_URL}/api/carts/clear/${user._id}`, config);
      console.log("Cart cleared successfully");
      
      // Update local cart state to reflect the cleared cart
      setCartItems([]);
      console.log("Local cart state updated");
      
      // Scroll to top and move to confirmation
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentStep(steps.length - 1);
      
      // Store original order data for success screen display
      setOriginalOrderData(inPersonOrderData);

      return response.data;
    } catch (error) {
      console.error("Error processing in-person order:", error.message);
      
      // Handle inventory validation errors
      if (error.message.includes('זמין') || error.message.includes('available')) {
        setError(`בעיית זמינות: ${error.message}`);
        setCheckoutValidationStatus('invalid');
      } else {
        setError(error.message || 'שגיאה בעיבוד ההזמנה');
      }
      
      throw error;
    }
  };

  // WebSocket connection and real-time inventory validation for checkout
  useEffect(() => {
    const handleConnectionStatus = (status) => {
      console.log('Connection status changed');
      setIsConnected(status.connected);
    };

    const handleAuthenticated = (data) => {
      console.log('WebSocket authenticated');
      setIsConnected(true);
      
      // Validate current cart items immediately after connection
      validateCartInventoryRealTime();
    };

    const handleInventoryUpdate = (data) => {
      console.log('Inventory update received');
      
      // Update real-time inventory map
      setRealTimeInventory(prev => new Map(prev.set(data.productId, data.availability)));
      setLastInventoryCheck(new Date());

      // Check for conflicts with cart items
      validateCartAgainstRealTimeInventory(data);
    };

    const handleProductAvailabilityUpdate = (data) => {
      console.log('Product availability update received');
      setRealTimeInventory(prev => new Map(prev.set(data.productId, data.availability)));
      setLastInventoryCheck(new Date());
      validateCartAgainstRealTimeInventory(data);
    };

    // Set up WebSocket listeners for checkout
    websocketService.on('connection-status', handleConnectionStatus);
    websocketService.on('authenticated', handleAuthenticated);
    websocketService.on('inventory-update', handleInventoryUpdate);
    websocketService.on('product-availability-update', handleProductAvailabilityUpdate);

    // Check current connection status immediately
    if (websocketService.isConnected()) {
      console.log('Existing WebSocket connection detected');
      setIsConnected(true);
    } else if (user?.token) {
      // Initialize WebSocket if not connected and we have a token
      console.log('Initializing WebSocket connection');
      websocketService.initialize(user.token);
    }

    return () => {
      websocketService.off('connection-status', handleConnectionStatus);
      websocketService.off('authenticated', handleAuthenticated);
      websocketService.off('inventory-update', handleInventoryUpdate);
      websocketService.off('product-availability-update', handleProductAvailabilityUpdate);
    };
  }, [user?.token, cartItems]);

  // Watch all cart items for real-time updates
  useEffect(() => {
    if (isConnected && cartItems.length > 0) {
      cartItems.forEach(item => {
        websocketService.watchProduct(item.product._id);
      });

      // Perform initial inventory validation
      validateCartInventoryRealTime();

      return () => {
        cartItems.forEach(item => {
          websocketService.unwatchProduct(item.product._id);
        });
      };
    }
  }, [isConnected, cartItems]);

  // Real-time inventory validation functions
  const validateCartAgainstRealTimeInventory = useCallback((updateData) => {
    const conflictingItems = cartItems.filter(item => {
      if (item.product._id === updateData.productId) {
        const availableUnits = updateData.availability.availableNow || 0;
        
        // Check if rental period conflicts with current bookings
        // const startDate = new Date(item.rentalPeriod.startDate);
        // const endDate = new Date(item.rentalPeriod.endDate);
        
        // For checkout, we need at least 1 unit available during the rental period
        return availableUnits < 1;
      }
      return false;
    });

    if (conflictingItems.length > 0) {
      const conflicts = new Map();
      conflictingItems.forEach(item => {
        conflicts.set(item._id, {
          type: 'checkout-unavailable',
          message: `המוצר "${item.product.name}" אינו זמין יותר לתאריכים הנבחרים`,
          availableUnits: updateData.availability.availableNow || 0,
          productId: updateData.productId,
          timestamp: new Date()
        });
      });
      setInventoryConflicts(prev => new Map([...prev, ...conflicts]));
      setCheckoutValidationStatus('invalid');
    } else {
      // Remove any existing conflicts for this product
      setInventoryConflicts(prev => {
        const newConflicts = new Map(prev);
        cartItems.forEach(item => {
          if (item.product._id === updateData.productId) {
            newConflicts.delete(item._id);
          }
        });
        return newConflicts;
      });
      
      // Check if all conflicts are resolved
      if (inventoryConflicts.size === 0) {
        setCheckoutValidationStatus('valid');
      }
    }
  }, [cartItems, inventoryConflicts.size]);

  const validateCartInventoryRealTime = useCallback(async () => {
    if (!cartItems.length || !isConnected) return;

    setCheckoutValidationStatus('validating');
    
    try {
      let allValid = true;
      const conflicts = new Map();

      for (const item of cartItems) {
        const realtimeData = realTimeInventory.get(item.product._id);
        
        if (realtimeData) {
          const availableUnits = realtimeData.availableNow || 0;
          
          if (availableUnits < 1) {
            allValid = false;
            conflicts.set(item._id, {
              type: 'checkout-unavailable',
              message: `המוצר "${item.product.name}" אינו זמין יותר`,
              availableUnits: availableUnits,
              productId: item.product._id,
              timestamp: new Date()
            });
          }
        }
      }

      setInventoryConflicts(conflicts);
      setCheckoutValidationStatus(allValid ? 'valid' : 'invalid');
      setLastInventoryCheck(new Date());
      
    } catch (error) {
      console.error('Error validating cart inventory:', error);
      setCheckoutValidationStatus('invalid');
    }
  }, [cartItems, realTimeInventory, isConnected]);

  if (loading) {
    return (
      <div className="checkout-loading">
        <div className="loading-spinner"></div>
        <p>טוען פרטי הזמנה...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-error">
        <div className="error-content">
          <h2>שגיאה בתהליך ההזמנה</h2>
          <p>{error}</p>
          <button 
            className="btn-secondary"
            onClick={() => navigate("/cart-page")}
          >
            חזור לעגלת הקניות
          </button>
        </div>
      </div>
    );
  }

  // Filter steps based on customer type
  const visibleSteps = isFirstTimeCustomer ? steps : steps.filter(step => step.id !== 0);

  const renderStepContent = () => {
    if (isFastCheckout) {
      switch (currentStep) {
        case 1:
          return (
            <OrderSummary
              cartItems={cartItems}
              total={calculateTotal()}
              onNext={nextStep}
              calculateItemPrice={calculateItemPrice}
              pickupReturn={checkoutData.pickupReturn}
              isFastCheckout={isFastCheckout}
              onboardingChoice={onboardingChoice}
              processInPersonOrder={processInPersonOrder}
              realTimeInventory={realTimeInventory}
              inventoryConflicts={inventoryConflicts}
              isConnected={isConnected}
              checkoutValidationStatus={checkoutValidationStatus}
            />
          );
        case 2:
          return (
            <FastCheckoutConfirmation
              cartItems={cartItems}
              checkoutData={checkoutData}
              total={calculateTotal()}
              onNext={nextStep}
              onPrev={prevStep}
              calculateItemPrice={calculateItemPrice}
              processOrder={processOrder}
              realTimeInventory={realTimeInventory}
              inventoryConflicts={inventoryConflicts}
              isConnected={isConnected}
              checkoutValidationStatus={checkoutValidationStatus}
            />
          );
        case 3:
          return (
            <OrderConfirmation
              checkoutData={checkoutData}
              cartItems={originalCartItems.length > 0 ? originalCartItems : cartItems}
              total={originalTotal > 0 ? originalTotal : calculateTotal()}
              onFinish={() => navigate("/profile")}
              onboardingChoice={onboardingChoice}
              isFirstTimeCustomer={isFirstTimeCustomer}
              isFastCheckout={isFastCheckout}
              processOrder={processOrder}
              calculateItemPrice={calculateItemPrice}
            />
          );
        default:
          return null;
      }
    }

    // Regular checkout flow
    switch (currentStep) {
      case 0:
        return isFirstTimeCustomer ? (
          <FirstTimeWelcome
            onChoice={handleOnboardingChoice}
            canProceed={canProceedFromStep(0)}
          />
        ) : null;
      case 1:
        return (
          <OrderSummary
            cartItems={cartItems}
            total={calculateTotal()}
            onNext={nextStep}
            calculateItemPrice={calculateItemPrice}
            pickupReturn={checkoutData.pickupReturn}
            isFastCheckout={isFastCheckout}
            onboardingChoice={onboardingChoice}
            processInPersonOrder={processInPersonOrder}
            realTimeInventory={realTimeInventory}
            inventoryConflicts={inventoryConflicts}
            isConnected={isConnected}
            checkoutValidationStatus={checkoutValidationStatus}
          />
        );
      case 2:
        return (
          <CustomerInformation
            data={checkoutData.customerInfo}
            onUpdate={(data) => updateCheckoutData('customerInfo', data)}
            onNext={nextStep}
            onPrev={prevStep}
            canProceed={canProceedFromStep(2)}
          />
        );
      case 3:
        return (
          <ContractSigning
            data={checkoutData.contract}
            customerInfo={checkoutData.customerInfo}
            onUpdate={(data) => updateCheckoutData('contract', data)}
            onNext={nextStep}
            onPrev={prevStep}
            canProceed={canProceedFromStep(3)}
          />
        );
      case 4:
        return (
          <IDUpload
            data={checkoutData.idUpload}
            onUpdate={(data) => updateCheckoutData('idUpload', data)}
            onNext={nextStep}
            onPrev={prevStep}
            canProceed={canProceedFromStep(4)}
            processOrder={processOrder}
          />
        );
      case 5:
        return (
          <OrderConfirmation
            checkoutData={checkoutData}
            cartItems={originalCartItems.length > 0 ? originalCartItems : cartItems}
            total={originalTotal > 0 ? originalTotal : calculateTotal()}
            onFinish={() => navigate("/profile")}
            onboardingChoice={onboardingChoice}
            isFirstTimeCustomer={isFirstTimeCustomer}
            isFastCheckout={isFastCheckout}
            processOrder={processOrder}
            calculateItemPrice={calculateItemPrice}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>
            <svg className="page-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 4V2C7 1.45 7.45 1 8 1S9 1.55 9 2V4H15V2C15 1.45 15.45 1 16 1S17 1.55 17 2V4H20C21.1 4 22 4.9 22 6V20C22 21.1 21.1 22 20 22H4C2.9 22 2 21.1 2 20V6C2 4.9 2.9 4 4 4H7ZM4 8V20H20V8H4ZM12 17L17 12L15.59 10.59L12 14.17L8.41 10.58L7 12L12 17Z"/>
            </svg>
            השלמת הזמנה
          </h1>
          <p>
            {isFastCheckout 
              ? "תהליך הזמנה מהיר - כל הפרטים שלך כבר שמורים במערכת!"
              : isFirstTimeCustomer 
              ? "ברוכים הבאים לשולא השכרת ציוד! בואו נתחיל יחד את תהליך ההשכרה שלכם"
              : "תהליך הזמנה מהיר ופשוט - תשלום במזומן בעת איסוף הציוד"
            }
          </p>

          {/* Real-time validation status */}
          <div className="checkout-realtime-status">
            <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
              <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                <svg className="status-icon" viewBox="0 0 12 12" fill="currentColor">
                  <circle cx="6" cy="6" r="6"/>
                </svg>
              </span>
              <span className="status-text">
                {isConnected ? 'מעודכן בזמן אמת' : 'לא מחובר'}
                {lastInventoryCheck && ` • נבדק לאחרונה ${Math.floor((new Date() - lastInventoryCheck) / 1000)} שניות`}
              </span>
            </div>
            
            <div className={`validation-status ${checkoutValidationStatus}`}>
              <span className="validation-indicator">
                {checkoutValidationStatus === 'validating' && (
                  <svg className="spin" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                  </svg>
                )}
                {checkoutValidationStatus === 'valid' && (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                  </svg>
                )}
                {checkoutValidationStatus === 'invalid' && (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                  </svg>
                )}
                {checkoutValidationStatus === 'pending' && (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6,2V8H6V8L10,12L6,16V16H6V22H18V16H18V16L14,12L18,8V8H18V2H6Z"/>
                  </svg>
                )}
              </span>
              <span className="validation-text">
                {checkoutValidationStatus === 'validating' && 'בודק זמינות...'}
                {checkoutValidationStatus === 'valid' && 'כל הפריטים זמינים'}
                {checkoutValidationStatus === 'invalid' && 'בעיות זמינות זוהו'}
                {checkoutValidationStatus === 'pending' && 'ממתין לבדיקת זמינות'}
              </span>
            </div>
          </div>
        </div>

        {/* Inventory conflicts alert for checkout */}
        {inventoryConflicts.size > 0 && (
          <div className="checkout-inventory-conflicts">
            <div className="conflicts-header">
              <h3>
                <svg className="alert-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                </svg>
                בעיות זמינות בהזמנה
              </h3>
              <p>לא ניתן להמשיך עם ההזמנה עד לפתרון בעיות הזמינות</p>
            </div>
            {Array.from(inventoryConflicts.entries()).map(([cartItemId, conflict]) => {
              const item = cartItems.find(ci => ci._id === cartItemId);
              if (!item) return null;
              
              return (
                <div key={cartItemId} className="checkout-conflict-item">
                  <div className="conflict-info">
                    <span className="product-name">{item.product.name}</span>
                    <span className="conflict-message">{conflict.message}</span>
                    <small className="conflict-time">
                      זוהה ב-{new Date(conflict.timestamp).toLocaleTimeString('he-IL')}
                    </small>
                  </div>
                  <div className="conflict-actions">
                    <button 
                      className="back-to-cart-btn" 
                      onClick={() => navigate('/cart-page')}
                    >
                      חזור לעגלה לעדכון
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Enhanced Step Indicator */}
        <div className="checkout-steps-container">
          <div className={`checkout-steps-indicator step-${currentStep}`}>
            {visibleSteps.map((step, index) => {
              const stepNumber = isFirstTimeCustomer ? index : index + 1;
              const isCompleted = stepNumber < currentStep;
              const isCurrent = stepNumber === currentStep;
              // const isPending = stepNumber > currentStep;
              
              let stepStatus = 'pending';
              if (isCompleted) stepStatus = 'completed';
              else if (isCurrent) stepStatus = 'current';
              else if (isFastCheckout && step.id === 2) stepStatus = 'fast-checkout';
              
              return (
                <div key={step.id} className={`step-indicator ${stepStatus}`}>
                  <div className={`step-circle ${stepStatus}`}>
                    {isCompleted ? (
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                      </svg>
                    ) : isFastCheckout && step.id === 2 ? (
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M13,1V3H11V1H13M19.03,7.39L20.45,5.97L18.76,4.28L17.34,5.7C15.9,4.76 14.1,4.5 12.5,5L12,5.18V7.82L12.5,8C15.29,8.85 16.07,12.62 14.07,14.62C12.06,16.63 8.29,15.85 7.44,13.06L7.26,12.56H4.72L4.9,13.06C5.86,16.92 10.1,19.44 14,18.5C17.89,17.55 20.42,13.31 19.5,9.5C19.28,8.58 18.84,7.71 18.22,6.97L19.03,7.39M6.5,10C8,10 9.24,11.24 9.24,12.74C9.24,14.24 8,15.5 6.5,15.5C5,15.5 3.76,14.24 3.76,12.74C3.76,11.24 5,10 6.5,10Z"/>
                      </svg>
                    ) : (
                      stepNumber
                    )}
                  </div>
                  <div className="step-title">{step.title}</div>
                </div>
              );
            })}
          </div>
          
          <div className="current-step-info">
            <h3>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"/>
              </svg>
              שלב {currentStep}: {visibleSteps.find(s => (isFirstTimeCustomer ? s.id - 1 : s.id) === currentStep)?.title}
            </h3>
            <p>
              {isFastCheckout && currentStep === 2 ? "אישור מהיר של כל הפרטים הקיימים במערכת" 
               : isFirstTimeCustomer && currentStep === 0 ? "בואו נכיר ונתחיל את תהליך ההרשמה"
               : currentStep === 1 ? "סקירה של הפריטים שנבחרו והמחיר הכולל"
               : currentStep === 2 ? "מילוי פרטים אישיים לביצוע ההזמנה"
               : currentStep === 3 ? "חתימה על הסכם השכירות"
               : currentStep === 4 ? "העלאת תעודת זהות לאימות"
               : "אישור סופי של ההזמנה והמעבר לתשלום"
              }
            </p>
          </div>
        </div>

        {/* Fast Checkout Badge */}
        {isFastCheckout && (
          <div className="fast-checkout-badge">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M13,1V3H11V1H13M19.03,7.39L20.45,5.97L18.76,4.28L17.34,5.7C15.9,4.76 14.1,4.5 12.5,5L12,5.18V7.82L12.5,8C15.29,8.85 16.07,12.62 14.07,14.62C12.06,16.63 8.29,15.85 7.44,13.06L7.26,12.56H4.72L4.9,13.06C5.86,16.92 10.1,19.44 14,18.5C17.89,17.55 20.42,13.31 19.5,9.5C19.28,8.58 18.84,7.71 18.22,6.97L19.03,7.39M6.5,10C8,10 9.24,11.24 9.24,12.74C9.24,14.24 8,15.5 6.5,15.5C5,15.5 3.76,14.24 3.76,12.74C3.76,11.24 5,10 6.5,10Z"/>
            </svg>
            איסוף מהיר
          </div>
        )}

        <div className="checkout-content">
          <div className="step-content-wrapper">
            {renderStepContent()}
          </div>
          
          {/* Enhanced Navigation */}
          {currentStep > (isFirstTimeCustomer ? 0 : 1) && currentStep < steps.length - 1 && !isFastCheckout && (
            <div className="checkout-navigation">
              <button 
                className="btn-secondary"
                onClick={prevStep}
                disabled={orderProcessing}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
                </svg>
                חזור
              </button>
              
              <button 
                className="btn-primary"
                onClick={nextStep}
                disabled={!canProceedFromStep(currentStep) || orderProcessing || checkoutValidationStatus === 'invalid'}
              >
                המשך
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"/>
                </svg>
              </button>
            </div>
          )}
          
          {/* Progress Summary for completed steps */}
          {currentStep > 1 && (
            <div className="checkout-progress-summary">
              <div className={`progress-item ${checkoutData.customerInfo.firstName ? 'completed' : 'pending'}`}>
                <div className="progress-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                  </svg>
                </div>
                <div className="progress-label">פרטים אישיים</div>
              </div>
              
              <div className={`progress-item ${checkoutData.contract.signed ? 'completed' : 'pending'}`}>
                <div className="progress-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                </div>
                <div className="progress-label">הסכם</div>
              </div>
              
              <div className={`progress-item ${checkoutData.idUpload.uploaded ? 'completed' : 'pending'}`}>
                <div className="progress-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                </div>
                <div className="progress-label">תעודת זהות</div>
              </div>
              
              <div className={`progress-item ${checkoutValidationStatus === 'valid' ? 'completed' : 'pending'}`}>
                <div className="progress-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                  </svg>
                </div>
                <div className="progress-label">זמינות</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;