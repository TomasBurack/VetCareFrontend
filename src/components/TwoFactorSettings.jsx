import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { authApi } from '../api/endpoints';
import { ApiError } from '../api/client';
import { ErrorBanner } from './ErrorBanner';
import { Field } from './Field';
import { Button } from './Button';
import { useLanguage } from '../i18n/useLanguage';

const STEP = {
  IDLE: 'idle',
  ENROLLING: 'enrolling',
  DISABLING: 'disabling',
};

export function TwoFactorSettings() {
  const { t } = useLanguage();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(null);
  const [step, setStep] = useState(STEP.IDLE);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    refreshStatus();
  }, []);

  function refreshStatus() {
    authApi.me().then((result) => setTwoFactorEnabled(result.twoFactorEnabled));
  }

  async function handleStartEnrollment() {
    setErrors([]);
    setSubmitting(true);
    try {
      const { otpAuthUri } = await authApi.enableTwoFactor();
      const dataUrl = await QRCode.toDataURL(otpAuthUri);
      setQrDataUrl(dataUrl);
      setStep(STEP.ENROLLING);
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : [t.twoFactor.enableError]);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmEnrollment(e) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      await authApi.confirmTwoFactor(code);
      setCode('');
      setStep(STEP.IDLE);
      setQrDataUrl(null);
      refreshStatus();
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : [t.twoFactor.invalidCode]);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDisable(e) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      await authApi.disableTwoFactor(password);
      setPassword('');
      setStep(STEP.IDLE);
      refreshStatus();
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : [t.twoFactor.disableError]);
    } finally {
      setSubmitting(false);
    }
  }

  if (twoFactorEnabled === null) {
    return null;
  }

  if (step === STEP.ENROLLING) {
    return (
      <div className="danger-zone">
        <div className="t">{t.twoFactor.scanTitle}</div>
        <div className="sub">{t.twoFactor.scanSub}</div>
        <ErrorBanner messages={errors} />
        {qrDataUrl && <img src={qrDataUrl} alt={t.twoFactor.qrAlt} style={{ margin: '0.75rem 0' }} />}
        <form onSubmit={handleConfirmEnrollment}>
          <Field
            label={t.twoFactor.codeLabel}
            required
            autoFocus
            placeholder={t.twoFactor.codeInputPlaceholder}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '.6rem' }}>
            <Button type="submit" disabled={submitting}>
              {submitting ? t.twoFactor.confirming : t.twoFactor.confirm}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setStep(STEP.IDLE);
                setQrDataUrl(null);
                setErrors([]);
              }}
            >
              {t.common.cancel}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  if (step === STEP.DISABLING) {
    return (
      <div className="danger-zone">
        <div className="t">{t.twoFactor.disableTitle}</div>
        <div className="sub">{t.twoFactor.disableSub}</div>
        <ErrorBanner messages={errors} />
        <form onSubmit={handleDisable}>
          <Field
            label={t.common.password}
            type="password"
            required
            autoFocus
            placeholder={t.common.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '.6rem' }}>
            <Button type="submit" variant="danger" disabled={submitting}>
              {submitting ? t.twoFactor.disabling : t.twoFactor.disable}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setStep(STEP.IDLE);
                setPassword('');
                setErrors([]);
              }}
            >
              {t.common.cancel}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="danger-zone">
      <div className="t">{t.twoFactor.settingsTitle}</div>
      <div className="sub">
        {twoFactorEnabled ? t.twoFactor.statusOn : t.twoFactor.statusOff}
      </div>
      <ErrorBanner messages={errors} />
      <div style={{ display: 'flex', gap: '.6rem' }}>
        {twoFactorEnabled ? (
          <Button variant="danger" onClick={() => setStep(STEP.DISABLING)}>
            {t.twoFactor.disable}
          </Button>
        ) : (
          <Button onClick={handleStartEnrollment} disabled={submitting}>
            {submitting ? t.twoFactor.generating : t.twoFactor.enable}
          </Button>
        )}
      </div>
    </div>
  );
}
