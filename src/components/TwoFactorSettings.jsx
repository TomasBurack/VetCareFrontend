import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { authApi } from '../api/endpoints';
import { ApiError } from '../api/client';
import { ErrorBanner } from './ErrorBanner';
import { Field } from './Field';
import { Button } from './Button';

const STEP = {
  IDLE: 'idle',
  ENROLLING: 'enrolling',
  SHOWING_RECOVERY_CODES: 'showing_recovery_codes',
  DISABLING: 'disabling',
};

export function TwoFactorSettings() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(null);
  const [step, setStep] = useState(STEP.IDLE);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState([]);
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
      setErrors(err instanceof ApiError ? err.messages : ['No se pudo iniciar la activación.']);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmEnrollment(e) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      const { recoveryCodes: codes } = await authApi.confirmTwoFactor(code);
      setRecoveryCodes(codes);
      setStep(STEP.SHOWING_RECOVERY_CODES);
      setCode('');
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : ['Código inválido. Intentá de nuevo.']);
    } finally {
      setSubmitting(false);
    }
  }

  function handleFinishEnrollment() {
    setStep(STEP.IDLE);
    setQrDataUrl(null);
    setRecoveryCodes([]);
    refreshStatus();
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
      setErrors(err instanceof ApiError ? err.messages : ['No se pudo desactivar. Verificá tu contraseña.']);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegenerateRecoveryCodes() {
    setErrors([]);
    setSubmitting(true);
    try {
      const { recoveryCodes: codes } = await authApi.regenerateRecoveryCodes();
      setRecoveryCodes(codes);
      setStep(STEP.SHOWING_RECOVERY_CODES);
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : ['No se pudieron regenerar los códigos.']);
    } finally {
      setSubmitting(false);
    }
  }

  if (twoFactorEnabled === null) {
    return null;
  }

  if (step === STEP.SHOWING_RECOVERY_CODES) {
    return (
      <div className="danger-zone">
        <div className="t">Guardá tus códigos de recuperación</div>
        <div className="sub">
          Cada código sirve una sola vez y te permite ingresar si perdés acceso a tu app de autenticación. No se van a
          volver a mostrar.
        </div>
        <ErrorBanner messages={errors} />
        <ul style={{ fontFamily: 'var(--font-mono)', lineHeight: 1.8 }}>
          {recoveryCodes.map((rc) => (
            <li key={rc}>{rc}</li>
          ))}
        </ul>
        <Button onClick={handleFinishEnrollment}>Ya los guardé</Button>
      </div>
    );
  }

  if (step === STEP.ENROLLING) {
    return (
      <div className="danger-zone">
        <div className="t">Escaneá el código QR</div>
        <div className="sub">
          Usá Google Authenticator, Authy u otra app compatible con TOTP. Después ingresá el código de 6 dígitos para
          confirmar.
        </div>
        <ErrorBanner messages={errors} />
        {qrDataUrl && <img src={qrDataUrl} alt="Código QR para 2FA" style={{ margin: '0.75rem 0' }} />}
        <form onSubmit={handleConfirmEnrollment}>
          <Field
            label="Código de verificación"
            required
            autoFocus
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '.6rem' }}>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Confirmando…' : 'Confirmar'}
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
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    );
  }

  if (step === STEP.DISABLING) {
    return (
      <div className="danger-zone">
        <div className="t">Desactivar verificación en dos pasos</div>
        <div className="sub">Ingresá tu contraseña para confirmar.</div>
        <ErrorBanner messages={errors} />
        <form onSubmit={handleDisable}>
          <Field
            label="Contraseña"
            type="password"
            required
            autoFocus
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '.6rem' }}>
            <Button type="submit" variant="danger" disabled={submitting}>
              {submitting ? 'Desactivando…' : 'Desactivar'}
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
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="danger-zone">
      <div className="t">Verificación en dos pasos</div>
      <div className="sub">
        {twoFactorEnabled
          ? 'Está activada. Se te va a pedir un código además de tu contraseña al iniciar sesión.'
          : 'Agregá una capa extra de seguridad pidiendo un código de tu app de autenticación al iniciar sesión.'}
      </div>
      <ErrorBanner messages={errors} />
      <div style={{ display: 'flex', gap: '.6rem' }}>
        {twoFactorEnabled ? (
          <>
            <Button variant="secondary" onClick={handleRegenerateRecoveryCodes} disabled={submitting}>
              Regenerar códigos de recuperación
            </Button>
            <Button variant="danger" onClick={() => setStep(STEP.DISABLING)}>
              Desactivar
            </Button>
          </>
        ) : (
          <Button onClick={handleStartEnrollment} disabled={submitting}>
            {submitting ? 'Generando…' : 'Activar'}
          </Button>
        )}
      </div>
    </div>
  );
}
