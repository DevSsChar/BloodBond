import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

// Use explicit .mjs to avoid dual module instances (prevents duplicate mongoose models / stale reads)
import connectDB from "@/db/connectDB.mjs";
import User from "@/models/user.js";

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: { params: { scope: "read:user user:email" } },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          await connectDB();
          
          // Find user by email
          const user = await User.findOne({ email: credentials.email.toLowerCase() });
          
          if (!user) {
            return null;
          }
          
          // Check if password matches
          const isValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isValid) {
            return null;
          }
          
          // Update login date
          user.lastLoginDate = new Date();
          await user.save();
          
          // Return user object - consistent with OAuth signin
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            isRegistrationComplete: user.isRegistrationComplete
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== "production",

  callbacks: {
    // Handle OAuth sign-in
    async signIn({ user, account, profile }) {
      // Skip for credential login
      if (account.provider === "credentials") {
        return true;
      }

      await connectDB();

      // Normalize email
      let email = user?.email || profile?.email || null;

      // GitHub often hides email; fallback to a no-reply based on login
      if (!email && account.provider === "github" && profile?.login) {
        email = `${profile.login}@users.noreply.github.com`;
      }

      if (!email) {
        // Cannot satisfy required field "email"
        return false;
      }

      email = String(email).toLowerCase().trim();

      // Find or create user
      const dbUser = await User.findOneAndUpdate(
        { email },
        {
          // Just update the login date for existing users
          $set: {
            lastLoginDate: new Date(),
          },
          // Only set these fields when creating a new user
          $setOnInsert: {
            email: email,
            name: user?.name || profile?.name || profile?.login || email.split('@')[0],
            password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10), // Random password for OAuth users
            // Explicitly set role to null for new users - will be set during role selection
            role: null,
            isRegistrationComplete: false
          },
        },
        { upsert: true, new: true }
      );

      console.log('SignIn callback - User from DB:', {
        id: dbUser._id,
        email: dbUser.email,
        role: dbUser.role,
        isNewUser: !dbUser.lastLoginDate || dbUser.role === null
      });

      // Add user ID to the user object for the JWT
      user.id = dbUser._id.toString();

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      console.log('JWT Callback called - trigger:', trigger, 'user:', !!user, 'token.userId:', token.userId);
      
      if (user) {
        token.userId = user.id;
        // Fetch user role from database
        try {
          await connectDB();
          const dbUser = await User.findById(user.id);
          if (dbUser) {
            token.role = dbUser.role;
            token.name = dbUser.name;
            token.isRegistrationComplete = dbUser.isRegistrationComplete;
            console.log('JWT callback (initial) - User role from DB:', dbUser.role, 'Registration complete:', dbUser.isRegistrationComplete);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }
      
      // Always refresh data if registration status is incomplete or undefined, or if update is triggered
      const shouldRefresh = trigger === "update" || 
                          token.isRegistrationComplete === undefined || 
                          token.isRegistrationComplete === false ||
                          token.isRegistrationComplete === null;
      
      if (shouldRefresh && token.userId) {
        console.log('JWT callback - Refreshing user data (trigger:', trigger, 'isRegistrationComplete:', token.isRegistrationComplete, ')');
        try {
          await connectDB();
          const dbUser = await User.findById(token.userId);
          if (dbUser) {
            token.role = dbUser.role;
            token.name = dbUser.name;
            token.isRegistrationComplete = dbUser.isRegistrationComplete;
            console.log('JWT callback (refresh) - User role from DB:', dbUser.role, 'Registration complete:', dbUser.isRegistrationComplete);
          } else {
            console.log('JWT callback (refresh) - User not found in database');
          }
        } catch (error) {
          console.error("Error refreshing user data:", error);
        }
      }
      
      console.log('JWT callback - Final token:', { 
        userId: token.userId, 
        role: token.role, 
        isRegistrationComplete: token.isRegistrationComplete 
      });
      
      return token;
    },

    async session({ session, token }) {
      console.log('Session callback called');
      if (session?.user) {
        session.user.id = token.userId;
        session.user.role = token.role;
        session.user.isRegistrationComplete = token.isRegistrationComplete;
        if (token.name) {
          session.user.name = token.name;
        }
        
        console.log('Session callback - Final session.user:', {
          id: session.user.id,
          role: session.user.role,
          isRegistrationComplete: session.user.isRegistrationComplete,
          name: session.user.name
        });
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };