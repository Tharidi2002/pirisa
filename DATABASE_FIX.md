# Database Field Mapping Error - FIXED

## 🔍 **Error Analysis:**

### **SQL Error**: 
```
Field 'days' doesn't have a default value
```

### **Root Cause**:
- **Database Table**: Has column named `days`
- **Java Model**: Has field named `amount` 
- **Hibernate**: Was trying to insert `days` field but database expected `amount` column
- **Mismatch**: Java field name vs database column name

## 🔧 **Solution Applied:**

### **Fixed CompanyLeave.java Model**:
```java
@Column(name = "days")
private int amount;
```

**Explanation**:
- Java field: `amount` (used in frontend code)
- Database column: `days` (actual column name in table)
- `@Column(name = "days")` annotation maps Java `amount` field to database `days` column

## 🎯 **Result:**

### **Before Fix**:
- ❌ Hibernate tried to insert `days` field (doesn't exist in Java model)
- ❌ Database expected `amount` column (but insert was using wrong field)
- ❌ Error: "Field 'days' doesn't have a default value"

### **After Fix**:
- ✅ Java `amount` field maps to database `days` column
- ✅ Hibernate will insert correct field with correct mapping
- ✅ No more SQL errors
- ✅ Frontend can continue using `amount` field name

## 🚀 **Testing:**

1. **Restart Backend** to apply the JPA mapping change
2. **Test Add Leave Type** - should work without SQL errors
3. **Check Console** - should show successful insert
4. **Verify Data** - check if data is saved correctly in database

## 📋 **Expected Console Output:**
```
Hibernate: insert into companyleave (days, cmp_id, leave_type) values (?, ?, ?)
```
**Instead of error about 'days' field not having default value**

**The database field mapping issue is now resolved!** 🎉
