const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const User = require("./src/models/User");
const config = require("./src/config/env");

async function seedDemoUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Hash demo password
    const hashedPassword = await bcryptjs.hash("Demo@123456", 10);

    // Demo authority user data
    const demoAuthority = {
      authorityId: "DEMO001",
      name: "Demo Authority",
      email: "demo@wardair.com",
      wardId: 1,
      password: hashedPassword,
      role: "authority",
      wardName: "Ward 1",
      designation: "Senior Manager",
      isVerified: true,
      permissions: {
        canEditAQIData: true,
        canManageAlerts: true,
        canViewAnalytics: true,
        canManageOfficers: true,
      },
      metadata: {
        lastLogin: new Date(),
        loginCount: 1,
        totalSubmissions: 0,
      },
    };

    // Check if demo user already exists
    const existingUser = await User.AuthorityUser.findOne({
      authorityId: "DEMO001",
    });

    if (existingUser) {
      console.log("Demo user already exists. Updating...");
      await User.AuthorityUser.updateOne(
        { authorityId: "DEMO001" },
        demoAuthority
      );
      console.log("✓ Demo user updated successfully");
    } else {
      console.log("Creating demo user...");
      const newUser = new User.AuthorityUser(demoAuthority);
      await newUser.save();
      console.log("✓ Demo user created successfully");
    }

    console.log("\n========================================");
    console.log("DEMO USER CREDENTIALS");
    console.log("========================================");
    console.log("Authority ID: DEMO001");
    console.log("Password: Demo@123456");
    console.log("Email: demo@wardair.com");
    console.log("Ward: Ward 1");
    console.log("========================================\n");

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding demo user:", error);
    process.exit(1);
  }
}

seedDemoUser();
