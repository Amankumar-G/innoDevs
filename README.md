
# Functional Test Plan Document

## 1. Scope

### In-Scope:
- Sales Transaction Processing
- Inventory Management
- Sales Statistics and Reporting
- Price Modification
- User Authentication

### Out-of-Scope:
- Performance Testing
- Security Testing (unless specified)

---

## 2. Test Scenarios

### TS_001: Sales Transaction Processing
- Verify that the sales clerk can efficiently process customer purchases by entering item codes and quantities.

### TS_002: Inventory Management
- Ensure that the manager can check the current inventory status and stock levels.

### TS_003: Sales Reporting
- Validate that the manager can generate sales reports for a selected date range.

### TS_004: Price Modification
- Confirm that the manager can modify item prices and that the changes are reflected in future transactions.

### TS_005: User Authentication
- Test the user authentication process to ensure that only authorized users can access the system.

---

## 3. Detailed Test Cases

### **Test Case for TS_001: Sales Transaction Processing**

**Test Case ID:** TC_001  
**Scenario ID:** TS_001  
**Test Case Title:** Process Customer Purchase  
**Prerequisites:** Sales clerk is logged into the system.  

#### **Test Steps:**
1. Start a new transaction.
2. Enter item code `"ITEM123"`.
3. Enter quantity `"2"`.
4. Click on `"Calculate Total"`.
5. Verify the total amount displayed.

**Test Data:**  
- Item Code: `ITEM123`  
- Quantity: `2`  

**Expected Result:** The system retrieves item details and calculates the total correctly.

---

### **Test Case for TS_002: Inventory Management**

**Test Case ID:** TC_002  
**Scenario ID:** TS_002  
**Test Case Title:** Check Inventory Status  
**Prerequisites:** Manager is logged into the system.  

#### **Test Steps:**
1. Navigate to the Inventory Management section.
2. Click on `"Check Inventory"`.
3. Observe the displayed stock levels.

**Test Data:** None  

**Expected Result:** The system displays the current stock levels accurately.

---

### **Test Case for TS_003: Sales Reporting**

**Test Case ID:** TC_003  
**Scenario ID:** TS_003  
**Test Case Title:** Generate Sales Report  
**Prerequisites:** Manager is logged into the system.  

#### **Test Steps:**
1. Navigate to the Sales Reporting section.
2. Select a date range (e.g., from `"01/01/2023"` to `"01/31/2023"`).
3. Click on `"Generate Report"`.
4. Review the generated report.

**Test Data:**  
- Date Range: `01/01/2023 to 01/31/2023`  

**Expected Result:** The system generates and displays the sales statistics for the selected date range.

---

### **Test Case for TS_004: Price Modification**

**Test Case ID:** TC_004  
**Scenario ID:** TS_004  
**Test Case Title:** Modify Item Price  
**Prerequisites:** Manager is logged into the system.  

#### **Test Steps:**
1. Navigate to the Price Modification section.
2. Select item `"ITEM123"`.
3. Enter new price `"19.99"`.
4. Click on `"Save Changes"`.
5. Verify the updated price in the system.

**Test Data:**  
- Item: `ITEM123`  
- New Price: `19.99`  

**Expected Result:** The system saves the new price and reflects it in future transactions.

---

### **Test Case for TS_005: User Authentication**

**Test Case ID:** TC_005  
**Scenario ID:** TS_005  
**Test Case Title:** User Login  
**Prerequisites:** None  

#### **Test Steps:**
1. Navigate to the login page.
2. Enter valid username and password.
3. Click on `"Login"`.
4. Verify successful login.

**Test Data:**  
- Username: `valid_user`  
- Password: `valid_password`  

**Expected Result:** The user is successfully logged into the system.

---

## 4. Edge & Error Cases

### **Test Case for Transaction Failure**

**Test Case ID:** TC_EC_001  
**Scenario ID:** TS_001  
**Test Case Title:** Handle Payment Transaction Failure  
**Prerequisites:** Sales clerk is logged into the system.  

#### **Test Steps:**
1. Start a new transaction.
2. Enter item code `"ITEM123"`.
3. Enter quantity `"2"`.
4. Simulate a payment failure.
5. Attempt to finalize the sale.

**Test Data:**  
- Item Code: `ITEM123`  
- Quantity: `2`  

**Expected Result:** The system prevents the sale from finalizing and displays an error message.

---

### **Test Case for Inventory Discrepancy**

**Test Case ID:** TC_EC_002  
**Scenario ID:** TS_002  
**Test Case Title:** Check Inventory with Discrepancy  
**Prerequisites:** Manager is logged into the system.  

#### **Test Steps:**
1. Navigate to the Inventory Management section.
2. Click on `"Check Inventory"`.
3. Simulate an inventory update failure.
4. Observe the displayed stock levels.

**Test Data:** None  

**Expected Result:** The system alerts the manager about the inventory discrepancy.

---

### **Test Case for Unauthorized Access**

**Test Case ID:** TC_EC_003  
**Scenario ID:** TS_005  
**Test Case Title:** Access Restricted Area Without Authentication  
**Prerequisites:** None  

#### **Test Steps:**
1. Attempt to access the Inventory Management section without logging in.

**Test Data:** None  

**Expected Result:** The system denies access and prompts for authentication.

---

### **Test Case for System Downtime**

**Test Case ID:** TC_EC_004  
**Scenario ID:** TS_001  
**Test Case Title:** System Downtime During Transaction  
**Prerequisites:** Sales clerk is logged into the system.  

#### **Test Steps:**
1. Start a new transaction.
2. Simulate system downtime during payment processing.
3. Attempt to finalize the sale.

**Test Data:**  
- Item Code: `ITEM123`  
- Quantity: `2`  

**Expected Result:** The system should have recovery procedures to resume operations quickly.

---

### **Test Case for Data Loss**

**Test Case ID:** TC_EC_005  
**Scenario ID:** TS_003  
**Test Case Title:** Data Backup Failure Alert  
**Prerequisites:** None  

#### **Test Steps:**
1. Simulate a data backup failure.
2. Attempt to generate a sales report.

**Test Data:**  
- Date Range: `01/01/2023 to 01/31/2023`  

**Expected Result:** The system alerts administrators about the potential data loss.

---
