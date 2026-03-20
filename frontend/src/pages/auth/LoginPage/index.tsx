import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../../components/layout';
import { Button, Input } from '../../../components/ui';
import { containerVariants, itemVariants } from '../../../lib/animations';
import { ROUTES } from '../../../lib/constants';
import { MOCK_ADMIN_USER, MOCK_MEMBER_USER, MOCK_SUBSCRIPTION } from '../../../lib/mockData';
import { useUserStore } from '../../../stores/userStore';
import type { Subscription, User } from '../../../types';
import styles from './LoginPage.module.css';

type LoginFormData = {
  email: string;
  password: string;
};

type LoginErrors = Partial<Record<keyof LoginFormData, string>>;

const isEmailValid = (value: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const createSubscriptionForUser = (user: User): Subscription => ({
  ...MOCK_SUBSCRIPTION,
  id: `${MOCK_SUBSCRIPTION.id}-${user.id}`,
  userId: user.id,
});

export const LoginPage = () => {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);
  const setSubscription = useUserStore((state) => state.setSubscription);

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (field: keyof LoginFormData, value: string): string => {
    if (field === 'email') {
      if (!value.trim()) {
        return 'Email is required.';
      }

      if (!isEmailValid(value)) {
        return 'Please enter a valid email address.';
      }
    }

    if (field === 'password' && !value.trim()) {
      return 'Password is required.';
    }

    return '';
  };

  const handleBlur = (field: keyof LoginFormData) => {
    const message = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const handleChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const nextErrors: LoginErrors = {
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
    };

    setErrors(nextErrors);
    return !nextErrors.email && !nextErrors.password;
  };

  const finalizeLogin = (user: User, destination: string) => {
    setUser(user);
    setSubscription(createSubscriptionForUser(user));
    navigate(destination);
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      finalizeLogin(
        {
          id: '1',
          email: formData.email,
          fullName: 'James Whitfield',
          isAdmin: false,
          createdAt: '2024-06-01T00:00:00Z',
        },
        ROUTES.DASHBOARD,
      );
    }, 1000);
  };

  const handleDemoLogin = (user: User, destination: string) => {
    finalizeLogin(user, destination);
  };

  return (
    <AuthLayout>
      <motion.div className={styles.page} variants={containerVariants} initial="initial" animate="animate">
        <motion.h1 variants={itemVariants} className={styles.heading}>
          Welcome back.
        </motion.h1>
        <motion.p variants={itemVariants} className={styles.subtext}>
          Don&apos;t have an account? <Link to={ROUTES.SIGNUP}>Sign up</Link>
        </motion.p>

        <motion.form className={styles.form} variants={containerVariants} initial="initial" animate="animate">
          <motion.div variants={itemVariants}>
            <Input
              label="Email address"
              type="email"
              value={formData.email}
              onChange={(event) => handleChange('email', event.target.value)}
              onBlur={() => handleBlur('email')}
              error={errors.email}
              required
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className={styles.passwordLabelRow}>
              <span>Password</span>
              <Link className={styles.forgotLink} to={ROUTES.RESET_PASSWORD}>
                Forgot password?
              </Link>
            </div>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(event) => handleChange('password', event.target.value)}
              onBlur={() => handleBlur('password')}
              error={errors.password}
              rightIcon={
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              }
              required
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button variant="primary" size="lg" fullWidth loading={isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? 'Logging in...' : 'Log in'}
            </Button>
          </motion.div>
        </motion.form>

        <motion.div className={styles.divider} variants={itemVariants}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>or</span>
          <span className={styles.dividerLine} />
        </motion.div>

        <motion.div className={styles.demoCard} variants={itemVariants}>
          <span className={styles.demoLabel}>Demo accounts</span>
          <div className={styles.demoButtons}>
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => handleDemoLogin(MOCK_MEMBER_USER, ROUTES.DASHBOARD)}
            >
              Login as Member
            </Button>
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => handleDemoLogin(MOCK_ADMIN_USER, ROUTES.ADMIN_USERS)}
            >
              Login as Admin
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AuthLayout>
  );
};
