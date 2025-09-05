const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function fixMobileNumberIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    
    // Check current indexes
    console.log('Current indexes:');
    const indexes = await collection.indexes();
    console.log(JSON.stringify(indexes, null, 2));
    
    // Drop the problematic mobile_number unique index if it exists
    try {
      await collection.dropIndex("mobile_number_1");
      console.log('✅ Dropped mobile_number_1 index');
    } catch (error) {
      console.log('ℹ️  mobile_number_1 index does not exist or already dropped');
    }
    
    // Create a partial unique index that only enforces uniqueness when mobile_number exists and is not null
    await collection.createIndex(
      { mobile_number: 1 },
      { 
        unique: true, 
        partialFilterExpression: { 
          mobile_number: { $type: "string" }
        },
        name: "mobile_number_partial_unique"
      }
    );
    console.log('✅ Created partial unique index for mobile_number');
    
    // Verify new indexes
    console.log('\nNew indexes:');
    const newIndexes = await collection.indexes();
    console.log(JSON.stringify(newIndexes, null, 2));
    
    await mongoose.disconnect();
    console.log('✅ Index fix completed successfully');
  } catch (error) {
    console.error('❌ Error fixing mobile number index:', error);
    process.exit(1);
  }
}

fixMobileNumberIndex();
