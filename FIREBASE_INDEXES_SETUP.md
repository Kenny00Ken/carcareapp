# Firebase Firestore Indexes Setup Guide

This document contains the required Firestore indexes for the Car Care application to function properly.

## Required Indexes

### 1. Parts Collection Indexes

#### Index 1: dealer_id + is_active + created_at
```
Collection: parts
Fields:
- dealer_id (Ascending)
- is_active (Ascending) 
- created_at (Descending)
```

#### Index 2: dealer_id + status + created_at
```
Collection: parts
Fields:
- dealer_id (Ascending)
- status (Ascending)
- created_at (Descending)
```

### 2. Transactions Collection Indexes

#### Index 3: dealer_id + created_at
```
Collection: transactions
Fields:
- dealer_id (Ascending)
- created_at (Descending)
```

#### Index 4: dealer_id + status + created_at
```
Collection: transactions
Fields:
- dealer_id (Ascending)
- status (Ascending)
- created_at (Descending)
```

### 3. Requests Collection Indexes

#### Index 5: mechanic_id + status + created_at
```
Collection: requests
Fields:
- mechanic_id (Ascending)
- status (Ascending)
- created_at (Descending)
```

#### Index 6: owner_id + created_at
```
Collection: requests
Fields:
- owner_id (Ascending)
- created_at (Descending)
```

### 4. Chat Messages Collection Indexes

#### Index 7: request_id + created_at
```
Collection: chat_messages
Fields:
- request_id (Ascending)
- created_at (Ascending)
```

### 5. Activity Logs Collection Indexes

#### Index 8: user_id + created_at
```
Collection: activity_logs
Fields:
- user_id (Ascending)
- created_at (Descending)
```

#### Index 9: request_id + created_at
```
Collection: activity_logs
Fields:
- request_id (Ascending)
- created_at (Descending)
```

## How to Create Indexes

### Option 1: Using Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `mechanicsweb`
3. Navigate to **Firestore Database** > **Indexes**
4. Click **Create Index**
5. For each index above:
   - Enter the collection name
   - Add fields in the specified order with the correct sort direction
   - Click **Create**

### Option 2: Using Firebase CLI

Create a `firestore.indexes.json` file in your project root:

```json
{
  "indexes": [
    {
      "collectionGroup": "parts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "dealer_id", "order": "ASCENDING" },
        { "fieldPath": "is_active", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION", 
      "fields": [
        { "fieldPath": "dealer_id", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "dealer_id", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "requests", 
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "mechanic_id", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "requests",
      "queryScope": "COLLECTION", 
      "fields": [
        { "fieldPath": "owner_id", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "chat_messages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "request_id", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "activity_logs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "user_id", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "activity_logs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "request_id", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Then run:
```bash
firebase deploy --only firestore:indexes
```

### Option 3: Click Error Links

When you see the index errors in the console, you can click the provided links to automatically create the indexes. The error messages contain direct links to create the specific indexes needed.

## Index Creation Status

After creating indexes, they may take a few minutes to build. You can monitor the status in the Firebase Console under **Firestore Database** > **Indexes**.

## Notes

- Indexes are required for compound queries (queries with multiple where clauses or orderBy)
- Single-field queries usually don't require custom indexes
- Index creation is free, but there are storage costs for maintaining them
- Always test your queries after creating indexes to ensure they work as expected

## Troubleshooting

If you continue to see index errors after creating these indexes:

1. Wait 5-10 minutes for indexes to fully build
2. Check that field names match exactly (case-sensitive)
3. Verify the sort order (ascending vs descending) matches the query
4. Clear browser cache and refresh the application