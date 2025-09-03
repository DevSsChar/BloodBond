import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

import connectDB from "@/db/connectDB";
import User from "@/model/user";

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
          
          // Return user object
          return {
            id: user._id.toString(),
            email: user.email,
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
          // Just update the login date
          $set: {
            lastLoginDate: new Date(),
          },
          // Only set this when creating a new user
        //   $setOnInsert: {
        //     password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10), // Random password for OAuth users
        //   },
        },
        { upsert: true, new: true }
      );

      // Add user ID to the user object for the JWT
      user.id = dbUser._id.toString();

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.userId;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };