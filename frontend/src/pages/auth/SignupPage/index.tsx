import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../../components/layout';
import { Badge, Button, Input } from '../../../components/ui';
import { containerVariants, itemVariants } from '../../../lib/animations';
import { PLANS, ROUTES } from '../../../lib/constants';
import styles from './SignupPage.module.css';

type SignupStep = 1 | 2;
type Direction = 1 | -1;

type SignupFormData = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  charityId: string;
  contributionPercentage: number;
};

type SignupErrors = Partial<Record<keyof SignupFormData, string>>;

type CharityOption = {
  id: string;
  name: string;
  category: string;
  description: string;
};

const CHARITY_OPTIONS: CharityOption[] = [
  {
    id: 'golf-foundation',
    name: 'Golf Foundation',
    category: 'Youth',
    description: 'Opening pathways for children to access coaching, equipment, and local club sessions.',
  },
  {
    id: 'veterans-golf-society',
    name: 'Veterans Golf Society',
    category: 'Mental Health',
    description: 'Supporting veterans through community rounds, mentoring, and wellbeing programs.',
  },
  {
    id: 'caddy-scholarship-fund',
    name: 'Caddy Scholarship Fund',
    category: 'Education',
    description: 'Funding education grants for caddies and their families across the UK and Ireland.',
  },
  {
    id: 'inclusive-fairways',
    name: 'Inclusive Fairways',
    category: 'Inclusion',
    description: 'Improving access to golf for players with disabilities through adaptive equipment support.',
  },
  {
    id: 'greens-for-good',
    name: 'Greens for Good',
    category: 'Environment',
    description: 'Helping clubs invest in biodiversity projects, water conservation, and sustainable turf care.',
  },
  {
    id: 'junior-links-network',
    name: 'Junior Links Network',
    category: 'Community',
    description: 'Running local school partnerships and affordable beginner programs in underserved areas.',
  },
];

const getCategoryVariant = (category: string) => {
  switch (category) {
    case 'Environment':
      return 'success' as const;
    case 'Mental Health':
      return 'info' as const;
    case 'Education':
      return 'warning' as const;
    case 'Inclusion':
      return 'neutral' as const;
    case 'Community':
      return 'info' as const;
    default:
      return 'success' as const;
  }
};

const isEmailValid = (value: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const getPasswordStrength = (password: string) => {
  if (!password) {
    return { score: 0, label: 'Weak', color: 'var(--color-bg-raised)' };
  }

  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSymbols = /[^a-zA-Z\d]/.test(password);

  if (password.length < 8) {
    return { score: 1, label: 'Weak', color: 'var(--color-error)' };
  }

  if (password.length >= 12 && hasLetters && hasNumbers && hasSymbols) {
    return { score: 5, label: 'Very strong', color: 'var(--color-success)' };
  }

  if (hasLetters && hasNumbers && hasSymbols) {
    return { score: 4, label: 'Strong', color: 'var(--color-success)' };
  }

  if (hasLetters && hasNumbers) {
    return { score: 3, label: 'Good', color: 'var(--color-warning)' };
  }

  return { score: 2, label: 'Fair', color: 'var(--color-warning)' };
};

const validateField = (field: keyof SignupFormData, formData: SignupFormData): string => {
  if (field === 'fullName') {
    if (!formData.fullName.trim()) {
      return 'Full name is required.';
    }

    if (formData.fullName.trim().length < 2) {
      return 'Full name must be at least 2 characters.';
    }
  }

  if (field === 'email') {
    if (!formData.email.trim()) {
      return 'Email is required.';
    }

    if (!isEmailValid(formData.email)) {
      return 'Please enter a valid email address.';
    }
  }

  if (field === 'password') {
    if (!formData.password) {
      return 'Password is required.';
    }

    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters.';
    }
  }

  if (field === 'confirmPassword') {
    if (!formData.confirmPassword) {
      return 'Please confirm your password.';
    }

    if (formData.confirmPassword !== formData.password) {
      return 'Passwords do not match.';
    }
  }

  if (field === 'charityId' && !formData.charityId) {
    return 'Please select a charity.';
  }

  return '';
};

const stepVariants = {
  initial: (direction: Direction) => ({
    opacity: 0,
    x: direction > 0 ? 30 : -30,
  }),
  animate: { opacity: 1, x: 0 },
  exit: (direction: Direction) => ({
    opacity: 0,
    x: direction > 0 ? -30 : 30,
  }),
};

export const SignupPage = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<SignupStep>(1);
  const [direction, setDirection] = useState<Direction>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    charityId: '',
    contributionPercentage: 10,
  });

  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);

  const handleChange = (field: keyof SignupFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }

    if (field === 'password' && errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: '' }));
    }
  };

  const handleBlur = (field: keyof SignupFormData) => {
    const message = validateField(field, formData);
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const validateStepOne = () => {
    const fields: Array<keyof SignupFormData> = ['fullName', 'email', 'password', 'confirmPassword'];

    const nextErrors: SignupErrors = {};

    fields.forEach((field) => {
      const message = validateField(field, formData);
      if (message) {
        nextErrors[field] = message;
      }
    });

    setErrors((prev) => ({ ...prev, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const goToStepTwo = async () => {
    setIsSubmitting(true);

    const isValid = validateStepOne();

    if (isValid) {
      setDirection(1);
      setCurrentStep(2);
    }

    setTimeout(() => {
      setIsSubmitting(false);
    }, 250);
  };

  const goBack = () => {
    setDirection(-1);
    setCurrentStep(1);
  };

  const handleCreateAccount = async () => {
    const charityError = validateField('charityId', formData);

    if (charityError) {
      setErrors((prev) => ({ ...prev, charityId: charityError }));
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      navigate(`${ROUTES.SUBSCRIBE}?plan=monthly`);
    }, 1500);
  };

  const filledRange = `${((formData.contributionPercentage - 10) / 90) * 100}%`;

  const monthlyContribution = ((PLANS.monthly.amount / 100) * formData.contributionPercentage) / 100;
  const yearlyContribution = ((PLANS.yearly.amount / 100) * formData.contributionPercentage) / 100;

  return (
    <AuthLayout>
      <div className={styles.page}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {currentStep === 1 ? (
              <>
                <h1 className={styles.heading}>Create your account</h1>
                <p className={styles.subtext}>
                  Already have an account? <Link to={ROUTES.LOGIN}>Log in</Link>
                </p>

                <div className={styles.stepIndicator}>
                  {[{ step: 1, label: '1 Account' }, { step: 2, label: '2 Charity' }].map((pill) => {
                    const isActive = currentStep === pill.step;

                    return (
                      <button
                        key={pill.step}
                        type="button"
                        className={`${styles.stepPill} ${isActive ? styles.stepPillActive : styles.stepPillInactive}`}
                        aria-current={isActive ? 'step' : undefined}
                      >
                        {isActive && <motion.span layoutId="stepIndicator" className={styles.stepPillBg} />}
                        <span className={styles.stepPillLabel}>{pill.label}</span>
                      </button>
                    );
                  })}
                </div>

                <motion.form className={styles.form} variants={containerVariants} initial="initial" animate="animate">
                  <motion.div variants={itemVariants}>
                    <Input
                      label="Full name"
                      placeholder="James Whitfield"
                      value={formData.fullName}
                      onChange={(event) => handleChange('fullName', event.target.value)}
                      onBlur={() => handleBlur('fullName')}
                      error={errors.fullName}
                      required
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Input
                      label="Email address"
                      type="email"
                      placeholder="james@example.com"
                      value={formData.email}
                      onChange={(event) => handleChange('email', event.target.value)}
                      onBlur={() => handleBlur('email')}
                      error={errors.email}
                      required
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
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

                    <div className={styles.passwordStrength}>
                      <div className={styles.strengthBars}>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <span key={index} className={styles.strengthBar}>
                            <motion.span
                              className={styles.strengthBarFill}
                              animate={{
                                width: index < passwordStrength.score ? '100%' : '0%',
                                backgroundColor: passwordStrength.color,
                              }}
                              transition={{ duration: 0.25 }}
                            />
                          </span>
                        ))}
                      </div>
                      <span className={styles.strengthLabel}>{passwordStrength.label}</span>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Input
                      label="Confirm password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repeat your password"
                      value={formData.confirmPassword}
                      onChange={(event) => handleChange('confirmPassword', event.target.value)}
                      onBlur={() => handleBlur('confirmPassword')}
                      error={errors.confirmPassword}
                      rightIcon={
                        <button
                          type="button"
                          className={styles.passwordToggle}
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? 'Hide' : 'Show'}
                        </button>
                      }
                      required
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Button variant="primary" size="lg" fullWidth loading={isSubmitting} onClick={goToStepTwo}>
                      Continue
                    </Button>
                    <p className={styles.termsNote}>
                      By continuing you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </motion.div>
                </motion.form>
              </>
            ) : (
              <>
                <button type="button" className={styles.backBtn} onClick={goBack}>
                  <span aria-hidden="true">←</span>
                  Back
                </button>

                <h2 className={styles.heading}>Choose your charity</h2>
                <p className={styles.subtext}>
                  Your chosen charity receives a portion of your subscription every month.
                </p>

                <div className={styles.charityGrid}>
                  {CHARITY_OPTIONS.map((charity) => {
                    const isSelected = formData.charityId === charity.id;

                    return (
                      <motion.div
                        key={charity.id}
                        className={`${styles.charityOption} ${
                          isSelected ? styles.charityOptionSelected : styles.charityOptionUnselected
                        }`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleChange('charityId', charity.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            handleChange('charityId', charity.id);
                          }
                        }}
                      >
                        <AnimatePresence>
                          {isSelected ? (
                            <motion.span
                              className={styles.charityCheckmark}
                              initial={{ opacity: 0, scale: 0.7 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.7 }}
                              transition={{ duration: 0.2 }}
                            >
                              ✓
                            </motion.span>
                          ) : null}
                        </AnimatePresence>
                        <p className={styles.charityName}>{charity.name}</p>
                        <div className={styles.charityMeta}>
                          <Badge variant={getCategoryVariant(charity.category)} size="sm">
                            {charity.category}
                          </Badge>
                        </div>
                        <p className={styles.charityDesc}>{charity.description}</p>
                      </motion.div>
                    );
                  })}
                </div>

                {errors.charityId ? <p className={styles.inlineError}>{errors.charityId}</p> : null}

                <Link to={ROUTES.CHARITIES} className={styles.browseLink}>
                  Don&apos;t see your charity? Browse all charities →
                </Link>

                <div className={styles.contributionSection}>
                  <p className={styles.contributionLabel}>Your monthly contribution</p>
                  <p className={styles.contributionSubtitle}>
                    Minimum 10% of your subscription goes to your charity
                  </p>

                  <div className={styles.contributionDisplay}>
                    <motion.span
                      key={formData.contributionPercentage}
                      className={styles.contributionValue}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.2 }}
                    >
                      {formData.contributionPercentage}%
                    </motion.span>
                    <span className={styles.contributionUnit}>of your subscription</span>
                  </div>

                  <input
                    className={styles.rangeInput}
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={formData.contributionPercentage}
                    onChange={(event) => handleChange('contributionPercentage', Number(event.target.value))}
                    style={{
                      background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${filledRange}, var(--color-border) ${filledRange}, var(--color-border) 100%)`,
                    }}
                    aria-label="Contribution percentage"
                  />

                  <p className={styles.contextNote}>
                    £{monthlyContribution.toFixed(2)} - £{yearlyContribution.toFixed(2)} / month depending on your plan
                  </p>
                </div>

                <Button variant="primary" size="lg" fullWidth loading={isSubmitting} onClick={handleCreateAccount}>
                  {isSubmitting ? 'Creating account...' : 'Create account'}
                </Button>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </AuthLayout>
  );
};
