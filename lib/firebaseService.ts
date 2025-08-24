import { 
  signInWithPhoneNumber, 
  ConfirmationResult, 
  PhoneAuthProvider,
  signInWithCredential,
  User
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  doc, 
  setDoc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { auth, db, setupRecaptcha } from './firebase';
import toast from 'react-hot-toast';

export interface UserData {
  phone: string;
  name: string;
  email: string;
  age: number;
  sex: 'male' | 'female' | 'other';
  weight: number;
  lifestyle: 'gym' | 'non-gym';
  diet: 'veg' | 'egg' | 'non-veg';
  proteinRange?: {
    min: number;
    max: number;
  };
  uid?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

class FirebaseService {
  private recaptchaVerifier: any = null;
  private confirmationResult: ConfirmationResult | null = null;

  // Initialize recaptcha
  initRecaptcha(containerId: string = 'recaptcha-container') {
    try {
      if (!this.recaptchaVerifier) {
        this.recaptchaVerifier = setupRecaptcha(containerId);
      }
      return this.recaptchaVerifier;
    } catch (error) {
      console.error('Error initializing recaptcha:', error);
      throw error;
    }
  }

  // Send OTP to phone number
  async sendOTP(phoneNumber: string): Promise<boolean> {
    try {
      // Ensure recaptcha is initialized
      if (!this.recaptchaVerifier) {
        throw new Error('Recaptcha not initialized');
      }

      console.log('Sending OTP to:', phoneNumber);
      
      this.confirmationResult = await signInWithPhoneNumber(
        auth, 
        phoneNumber, 
        this.recaptchaVerifier
      );
      
      toast.success('OTP sent successfully!');
      return true;
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      
      // Handle specific error cases
      if (error.code === 'auth/invalid-phone-number') {
        toast.error('Invalid phone number format');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many requests. Please try again later.');
      } else if (error.code === 'auth/captcha-check-failed') {
        toast.error('Captcha verification failed. Please try again.');
      } else {
        toast.error('Failed to send OTP. Please try again.');
      }
      
      // Reset recaptcha on error
      if (this.recaptchaVerifier) {
        this.recaptchaVerifier.clear();
        this.recaptchaVerifier = null;
      }
      
      throw error;
    }
  }

  // Verify OTP
  async verifyOTP(otp: string): Promise<User | null> {
    try {
      if (!this.confirmationResult) {
        throw new Error('No confirmation result available. Please request OTP first.');
      }

      const result = await this.confirmationResult.confirm(otp);
      const user = result.user;
      
      console.log('OTP verified successfully:', user.uid);
      toast.success('Phone number verified!');
      
      return user;
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      
      if (error.code === 'auth/invalid-verification-code') {
        toast.error('Invalid OTP. Please check and try again.');
      } else if (error.code === 'auth/code-expired') {
        toast.error('OTP has expired. Please request a new one.');
      } else {
        toast.error('Failed to verify OTP. Please try again.');
      }
      
      throw error;
    }
  }

  // Save user data to Firestore
  async saveUserData(userData: UserData, userId: string): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', userId);
      
      const dataToSave = {
        ...userData,
        uid: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(userDocRef, dataToSave);
      
      console.log('User data saved successfully');
      toast.success('Registration completed successfully!');
    } catch (error) {
      console.error('Error saving user data:', error);
      toast.error('Failed to save user data. Please try again.');
      throw error;
    }
  }

  // Calculate protein requirements
  calculateProtein(weight: number, lifestyle: 'gym' | 'non-gym'): { min: number; max: number } {
    const min = Math.round(weight * 0.8);
    const max = Math.round(weight * (lifestyle === 'gym' ? 2.0 : 1.2));
    return { min, max };
  }

  // Reset auth state
  resetAuth() {
    this.confirmationResult = null;
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
    }
  }

  // Sign out
  async signOut() {
    try {
      await auth.signOut();
      this.resetAuth();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  }
}

export const firebaseService = new FirebaseService();