import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import { errorMessage } from '../api/client.js';
import { AuthCard, Field, SubmitButton } from '../components/AuthForm.jsx';
import { ErrorBox } from '../components/Status.jsx';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(form.name, form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title="Create an account"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" state={location.state} className="font-medium text-gold-ink hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <ErrorBox>{error}</ErrorBox>}
        <Field label="Name" name="name" autoComplete="name" required maxLength={60} value={form.name} onChange={update} />
        <Field label="Email" name="email" type="email" autoComplete="email" required value={form.email} onChange={update} />
        <Field label="Password" name="password" type="password" autoComplete="new-password" required minLength={8} value={form.password} onChange={update} />
        <SubmitButton busy={busy}>Sign up</SubmitButton>
      </form>
    </AuthCard>
  );
}
