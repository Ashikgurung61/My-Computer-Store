import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Phone, Eye, EyeOff, CheckCircle } from 'lucide-react';
import OtpInput from '@/components/ui/otp-input';

const Signup = () => {
  const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  const { signup, sendOTP, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/products', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // OTP timer countdown
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.emailOrPhone.trim()) {
      newErrors.emailOrPhone = 'Email or phone number is required';
    } else if (formData.emailOrPhone.includes('@')) {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.emailOrPhone)) {
        newErrors.emailOrPhone = 'Please enter a valid email address';
      }
    } else {
      // Phone validation
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(formData.emailOrPhone.replace(/\s/g, ''))) {
        newErrors.emailOrPhone = 'Please enter a valid phone number';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOTP = () => {
    const newErrors = {};

    if (!formData.otp) {
      newErrors.otp = 'OTP is required';
    } else if (formData.otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear signup error
    if (signupError) {
      setSignupError('');
    }
  };

  const handleSendOTP = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSignupError('');

    try {
      // await sendOTP(formData.emailOrPhone); // Temporarily disabled for development
      setOtpSent(true);
      setStep(2);
      setOtpTimer(60); // 60 seconds countdown
      setFormData(prev => ({ ...prev, otp: '123456' }));
    } catch (error) {
      setSignupError(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      // await sendOTP(formData.emailOrPhone); // Temporarily disabled for development
      setOtpTimer(60);
    } catch (error) {
      setSignupError(error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!validateOTP()) {
      return;
    }

    setIsLoading(true);
    setSignupError('');

    try {
      await signup(formData);
      navigate('/products', { replace: true });
    } catch (error) {
      setSignupError(error.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isEmailInput = formData.emailOrPhone.includes('@');

  if (step === 2) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Verify OTP</CardTitle>
            <CardDescription className="text-center">
              We've sent a verification code to<br />
              <strong>{formData.emailOrPhone}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              {signupError && (
                <Alert variant="destructive">
                  <AlertDescription>{signupError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="otp">Enter 6-digit OTP</Label>
                <OtpInput length={6} onChange={(otp) => setFormData(prev => ({ ...prev, otp }))} />
                {errors.otp && (
                  <p className="text-sm text-destructive">{errors.otp}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Create Account'
                )}
              </Button>

              <div className="text-center">
                {otpTimer > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Resend OTP in {otpTimer} seconds
                  </p>
                ) : (
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="text-sm"
                  >
                    Resend OTP
                  </Button>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep(1)}
              >
                Back to Form
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Sign up to start shopping for premium laptops
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleSendOTP(); }} className="space-y-4">
            {signupError && (
              <Alert variant="destructive">
                <AlertDescription>{signupError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="emailOrPhone">Email or Phone Number</Label>
              <div className="relative">
                <Input
                  id="emailOrPhone"
                  name="emailOrPhone"
                  type="text"
                  placeholder="Enter your email or phone number"
                  value={formData.emailOrPhone}
                  onChange={handleInputChange}
                  className={errors.emailOrPhone ? 'border-destructive' : ''}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isEmailInput ? (
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
              {errors.emailOrPhone && (
                <p className="text-sm text-destructive">{errors.emailOrPhone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password (min. 6 characters)"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? 'border-destructive' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={errors.confirmPassword ? 'border-destructive' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                'Send OTP'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;

