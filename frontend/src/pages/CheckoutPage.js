import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "./CheckoutPage.css";
import StepIndicator from "../components/checkout/StepIndicator";
import OrderSummary from "../components/checkout/OrderSummary";
import CustomerInformation from "../components/checkout/CustomerInformation";
import PickupReturnDetails from "../components/checkout/PickupReturnDetails";
import ContractSigning from "../components/checkout/ContractSigning";
import IDUpload from "../components/checkout/IDUpload";
import PaymentMethod from "../components/checkout/PaymentMethod";
import PaymentProcessing from "../components/checkout/PaymentProcessing";
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
  const [checkoutData, setCheckoutData] = useState({
    customerInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      idNumber: ""
    },
    pickupReturn: {
      pickupAddress: "טבריה 15, חיפה", // Fixed address
      pickupDate: null, // Will be set to rental start date
      pickupTime: "17:00", // Fixed time within allowed range
      returnAddress: "טבריה 15, חיפה", // Fixed address
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
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Check if returning customer has complete information for fast checkout
  const checkForCompleteCustomerInfo = useCallback((orderData) => {
    if (!orderData || !orderData.customerInfo || !orderData.contract || !orderData.idUpload) {
      return false;
    }

    const { customerInfo, contract, idUpload } = orderData;
    
    // Check if customer info is complete
    const hasCompleteCustomerInfo = customerInfo.firstName && 
                                  customerInfo.lastName && 
                                  customerInfo.email && 
                                  customerInfo.phone && 
                                  customerInfo.idNumber &&
                                  customerInfo.idNumber !== "PENDING-IN-PERSON";
    
    // Check if contract was previously signed OR if they chose in-person (contract handled at pickup)
    const hasValidContract = contract.signed && contract.signatureData;
    
    // Check if ID was previously uploaded OR if they chose in-person (ID verified at pickup)
    const hasValidIdUpload = idUpload.uploaded && idUpload.fileName;
    
    // For customers who previously chose in-person and have basic info, they qualify for fast checkout
    // because their contract and ID were verified in person
    const isInPersonVerified = customerInfo.idNumber === "TBD-IN-PERSON" || 
                              (customerInfo.idNumber && customerInfo.idNumber.includes("IN-PERSON"));
    
    return (hasCompleteCustomerInfo && hasValidContract && hasValidIdUpload) || 
           (isInPersonVerified && customerInfo.firstName && customerInfo.lastName && customerInfo.email && customerInfo.phone);
  }, []);

  // Get streamlined steps for returning customers with complete info
  const getStreamlinedSteps = useCallback(() => {
    return [
      { id: 1, title: "סיכום הזמנה", icon: "📋" },
      { id: 2, title: "אישור מהיר", icon: "⚡" }, // Fast confirmation step
      { id: 3, title: "השלמת הזמנה", icon: "✅" }
    ];
  }, []);

  // Get full steps for first-time or incomplete returning customers
  const getFullSteps = useCallback(() => {
    const baseSteps = [
      { id: 1, title: "סיכום הזמנה", icon: "📋" },
      { id: 2, title: "פרטים אישיים", icon: "👤" },
      { id: 3, title: "חתימה על הסכם", icon: "✍️" },
      { id: 4, title: "העלאת תעודת זהות", icon: "📄" },
      { id: 5, title: "אישור הזמנה", icon: "✅" }
    ];

    if (isFirstTimeCustomer) {
      return [
        { id: 0, title: "ברוכים הבאים", icon: "👋", condition: "firstTime" },
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
      const headers = getAuthHeaders();
      const response = await axios.get(`${API_URL}/api/orders/user/${user._id}?limit=1`, { headers });
      
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
      const headers = getAuthHeaders();
      const response = await axios.get(`${API_URL}/api/carts/${user._id}`, { headers });
      
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
      // Try to get existing customer info from previous orders
      try {
        const headers = getAuthHeaders();
        const response = await axios.get(`${API_URL}/api/orders/user/${user._id}?limit=1`, { headers });
        
        if (response.data.orders && response.data.orders.length > 0) {
          const lastOrder = response.data.orders[0];
          if (lastOrder.customerInfo) {
            // For ID number, use a more user-friendly approach for in-person customers
            let idNumber = lastOrder.customerInfo.idNumber || "";
            if (idNumber.includes("PENDING") || idNumber.includes("TBD")) {
              idNumber = ""; // Clear placeholder values for better UX
            }
            
            // Pre-populate all checkout data from previous order
            setCheckoutData(prev => ({
              ...prev,
              customerInfo: {
                firstName: lastOrder.customerInfo.firstName || user.firstName || "",
                lastName: lastOrder.customerInfo.lastName || user.lastName || "",
                email: lastOrder.customerInfo.email || user.email || "",
                phone: lastOrder.customerInfo.phone || user.phone || "",
                idNumber: idNumber
              },
              contract: {
                signed: lastOrder.contract?.signed || false,
                signatureData: lastOrder.contract?.signatureData || null,
                agreementVersion: lastOrder.contract?.agreementVersion || "1.0",
                signedAt: lastOrder.contract?.signedAt || null
              },
              idUpload: {
                uploaded: lastOrder.idUpload?.uploaded || false,
                fileName: lastOrder.idUpload?.fileName || "",
                fileUrl: lastOrder.idUpload?.fileUrl || ""
              },
              payment: {
                method: "cash", // Always cash as per requirements
                cardData: null,
                paymentStatus: "pending"
              }
            }));
            
            // Check if this customer qualifies for fast checkout
            const hasCompleteInfo = checkForCompleteCustomerInfo({
              customerInfo: {
                firstName: lastOrder.customerInfo.firstName || user.firstName || "",
                lastName: lastOrder.customerInfo.lastName || user.lastName || "",
                email: lastOrder.customerInfo.email || user.email || "",
                phone: lastOrder.customerInfo.phone || user.phone || "",
                idNumber: lastOrder.customerInfo.idNumber || ""
              },
              contract: lastOrder.contract,
              idUpload: lastOrder.idUpload
            });
            
            setIsFastCheckout(hasCompleteInfo);
            console.log(`🚀 Customer ${hasCompleteInfo ? 'qualifies' : 'does not qualify'} for fast checkout`);
            return;
          }
        }
      } catch (err) {
        console.log("No previous orders found, using user data");
      }

      // Fall back to user data (new customer - no fast checkout)
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

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    const initializeCheckout = async () => {
      await checkIfFirstTimeCustomer();
      await fetchCartItems();
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
    const maxStep = steps.length - 1;
    if (currentStep < maxStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    const minStep = isFirstTimeCustomer ? 0 : 1;
    if (currentStep > minStep) {
      setCurrentStep(currentStep - 1);
    }
  };

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
      console.log("🏢 In-person checkout selected - proceeding to order summary");
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

  const processOrder = async (overrideCheckoutData = null, overrideOnboardingChoice = null) => {
    try {
      const headers = getAuthHeaders();
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
          isFastCheckout: isFastCheckout
        }
      };

      console.log("📦 Creating order with data:", orderData);

      // Use different endpoint for in-person vs online orders
      let response;
      if (choiceToUse === "in-person") {
        // Use basic order creation for in-person (less strict validation)
        const basicOrderData = {
          items: orderData.items,
          totalValue: orderData.totalValue,
          metadata: orderData.metadata
        };
        console.log("🏢 Using basic order endpoint for in-person order");
        response = await axios.post(`${API_URL}/api/orders`, basicOrderData, { headers });
      } else {
        // Use comprehensive checkout endpoint for online orders
        console.log("💻 Using comprehensive checkout endpoint for online order");
        response = await axios.post(`${API_URL}/api/orders/checkout`, orderData, { headers });
      }
      
      console.log("✅ Order created successfully:", response.data);
      
      // If customer completed online membership process (signed contract and uploaded ID), update their membership
      if (choiceToUse === "online" && 
          dataToUse.contract.signed && 
          dataToUse.idUpload.uploaded) {
        try {
          console.log("📋 Processing online membership for customer...");
          await axios.put(`${API_URL}/api/users/membership/process-checkout`, {
            contract: dataToUse.contract,
            idUpload: dataToUse.idUpload
          }, { headers });
          console.log("✅ Membership processed successfully");
        } catch (membershipError) {
          console.error("❌ Error processing membership (order was still created):", membershipError);
          // Don't fail the entire order if membership processing fails
          // The order is still valid, membership can be processed later by admin
        }
      }
      
      // Clear cart after successful order
      console.log("🧹 Clearing cart...");
      await axios.delete(`${API_URL}/api/carts/clear/${user._id}`, { headers });
      console.log("✅ Cart cleared successfully");
      
      return response.data;
    } catch (error) {
      console.error("❌ Error processing order:", error);
      console.error("Error details:", error.response?.data);
      throw error;
    }
  };

  const processInPersonOrder = async () => {
    try {
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
          isFastCheckout: false
        }
      };

      console.log("🏢 Creating in-person order...");
      const headers = getAuthHeaders();
      const response = await axios.post(`${API_URL}/api/orders`, inPersonOrderData, { headers });
      console.log("✅ In-person order created successfully:", response.data);
      
      // Clear cart after successful order
      console.log("🧹 Clearing cart...");
      await axios.delete(`${API_URL}/api/carts/clear/${user._id}`, { headers });
      console.log("✅ Cart cleared successfully");
      
      // Scroll to top and move to confirmation
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentStep(steps.length - 1);
      
      return response.data;
    } catch (error) {
      console.error("❌ Error processing in-person order:", error);
      throw error;
    }
  };

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
            />
          );
        case 3:
          return (
            <OrderConfirmation
              checkoutData={checkoutData}
              cartItems={cartItems}
              total={calculateTotal()}
              onFinish={() => navigate("/profile")}
              onboardingChoice={onboardingChoice}
              isFirstTimeCustomer={isFirstTimeCustomer}
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
            cartItems={cartItems}
            total={calculateTotal()}
            onFinish={() => navigate("/profile")}
            onboardingChoice={onboardingChoice}
            isFirstTimeCustomer={isFirstTimeCustomer}
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
          <h1>🛒 השלמת הזמנה</h1>
          <p>
            {isFastCheckout 
              ? "תהליך הזמנה מהיר - כל הפרטים שלך כבר שמורים במערכת!"
              : isFirstTimeCustomer 
              ? "ברוכים הבאים לשולא השכרת ציוד! בואו נתחיל יחד את תהליך ההשכרה שלכם"
              : "תהליך הזמנה מהיר ופשוט - תשלום במזומן בעת איסוף הציוד"
            }
          </p>
        </div>

        <StepIndicator
          steps={visibleSteps}
          currentStep={currentStep}
          completedSteps={Array.from({ length: currentStep }, (_, i) => i + (isFirstTimeCustomer ? 0 : 1))}
        />

        <div className="checkout-content">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;