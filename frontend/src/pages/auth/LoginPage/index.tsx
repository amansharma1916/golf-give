import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../../components/layout';
import { Button, Input } from '../../../components/ui';
import { containerVariants, itemVariants } from '../../../lib/animations';
import { ROUTES } from '../../../lib/constants';
import { getMe, signInWithPassword } from '../../../services/auth.service';
import { useToastStore } from '../../../stores/toastStore';
import { useUserStore } from '../../../stores/userStore';
import styles from './LoginPage.module.css';

type LoginFormData = {
  email: string;
  password: string;
};

type LoginErrors = Partial<Record<keyof LoginFormData, string>>;

const isEmailValid = (value: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);
  const setSubscription = useUserStore((state) => state.setSubscription);
  const setAuthToken = useUserStore((state) => state.setAuthToken);
  const addToast = useToastStore((state) => state.addToast);

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

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await signInWithPassword(formData.email, formData.password);
      setAuthToken(session.access_token);
      const me = await getMe();
      setUser(me.user);
      setSubscription(me.subscription);
      navigate(me.user.isAdmin ? ROUTES.ADMIN_USERS : ROUTES.DASHBOARD);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      addToast({
        type: 'error',
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = (email: string, password: string) => {
    setFormData({ email, password });
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
              onClick={() => handleDemoLogin('member@example.com', 'Password123!')}
            >
              Fill Member Credentials
            </Button>
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => handleDemoLogin('admin@example.com', 'Password123!')}
            >
              Fill Admin Credentials
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AuthLayout>
  );
};
