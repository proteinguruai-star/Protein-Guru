import { 
  signInWithPhoneNumber, 
  ConfirmationResult, 
  User,
  RecaptchaVerifier
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { auth, db } from './firebase';
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
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private confirmationResult: ConfirmationResult | null = null;

  // Initialize recaptcha - FIXED VERSION
  initRecaptcha(containerId: string = 'recaptcha-container') {
    try {
      if (typeof window === 'undefined') return;

      // Clear existing verifier
      if (this.recaptchaVerifier) {
        this.recaptchaVerifier.clear();
        this.recaptchaVerifier = null;
      }

      // Create new verifier with proper error handling
      this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => console.log('Recaptcha solved'),
        'expired-callback': () => {
          console.log('Recaptcha expired');
          this.recaptchaVerifier = null;
        }
      });

      return this.recaptchaVerifier;
    } catch (error) {
      console.error('Recaptcha init error:', error);
      throw error;
    }
  }

  // Send OTP - FIXED VERSION
  async sendOTP(phoneNumber: string): Promise<boolean> {
    try {
      // Validate phone format
      if (!phoneNumber.match(/^\+91\d{10}$/)) {
        throw new Error('Invalid phone number format');
      }

      // Ensure recaptcha is ready
      if (!this.recaptchaVerifier) {
        this.initRecaptcha();
        // Wait for initialization
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      this.confirmationResult = await signInWithPhoneNumber(
        auth, 
        phoneNumber, 
        this.recaptchaVerifier!
      );
      
      toast.success('OTP sent successfully!');
      return true;
    } catch (error: any) {
      console.error('Send OTP error:', error);
      
      // Clear and retry once on captcha failure
      if (error.code === 'auth/captcha-check-failed') {
        try {
          this.recaptchaVerifier?.clear();
          this.recaptchaVerifier = null;
          this.initRecaptcha();
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          this.confirmationResult = await signInWithPhoneNumber(
            auth, 
            phoneNumber, 
            this.recaptchaVerifier!
          );
          toast.success('OTP sent successfully!');
          return true;
        } catch (retryError) {
          toast.error('Verification failed. Please refresh and try again.');
        }
      } else {
        toast.error('Failed to send OTP. Please try again.');
      }
      
      throw error;
    }
  }

  // Verify OTP
  async verifyOTP(otp: string): Promise<User | null> {
    try {
      if (!this.confirmationResult) {
        throw new Error('No confirmation result available');
      }

      const result = await this.confirmationResult.confirm(otp);
      toast.success('Phone verified!');
      return result.user;
    } catch (error: any) {
      if (error.code === 'auth/invalid-verification-code') {
        toast.error('Invalid OTP code');
      } else {
        toast.error('Verification failed');
      }
      throw error;
    }
  }

  // Save user data
  async saveUserData(userData: UserData, userId: string): Promise<void> {
    try {
      await setDoc(doc(db, 'users', userId), {
        ...userData,
        uid: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success('Registration completed!');
    } catch (error) {
      toast.error('Failed to save data');
      throw error;
    }
  }

  calculateProtein(weight: number, lifestyle: 'gym' | 'non-gym') {
    return {
      min: Math.round(weight * 0.8),
      max: Math.round(weight * (lifestyle === 'gym' ? 2.0 : 1.2))
    };
  }

  resetAuth() {
    this.confirmationResult = null;
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
    }
  }
}

export const firebaseService = new FirebaseService();
