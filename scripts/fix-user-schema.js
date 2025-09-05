const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function fixUserSchema() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Update all users that are missing the isRegistrationComplete field
    const result = await mongoose.connection.db.collection('users').updateMany(
      { isRegistrationComplete: { $exists: false } },
      { 
        $set: { 
          isRegistrationComplete: false,
          lastLoginDate: new Date(),
          createdAt: new Date()
        }
      }
    );
    
    console.log('Updated users:', result.modifiedCount);
    
    // Verify the specific user
    const user = await mongoose.connection.db.collection('users').findOne(
      { _id: new mongoose.Types.ObjectId('68bb19e3bfa633823ba4521e') }
    );
    
    console.log('User after update:', JSON.stringify(user, null, 2));
    
    await mongoose.disconnect();
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

fixUserSchema();
