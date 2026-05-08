"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Abril_Fatface, Poppins } from "next/font/google";

const abrilFatface = Abril_Fatface({ weight: "400", subsets: ["latin"] });
const poppins = Poppins({ weight: ["400", "500", "600", "700"], subsets: ["latin"] });

const MOTORCYCLE_IMAGE = "/images/motorcycle.png";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "", username: "", email: "", phone: "", password: "", confirmPassword: "",
  });
  const [showPw, setShowPw]   = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setErrors(err => ({ ...err, [k]: "", form: "" }));
  };

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim())  e.fullName = "Full name is required";
    if (!form.username.trim())  e.username = "Username is required";
    else if (form.username.trim().length < 3) e.username = "At least 3 characters";
    if (!form.email.trim())     e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password)         e.password = "Password is required";
    else if (form.password.length < 8) e.password = "At least 8 characters";
    if (!form.confirmPassword)  e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          username: form.username.trim(),
          email:    form.email.trim(),
          phone:    form.phone.trim(),
          password: form.password,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/auth/login?registered=1");
      } else {
        setErrors({ form: data.message || "Signup failed" });
      }
    } catch {
      setErrors({ form: "Network error. Make sure your server is running." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --teal:       #1A444B;
          --teal-hover: #122F35;
          --white:      #FFFFFF;
          --dark:       #1A1A1A;
          --mid:        #555555;
          --light:      #888888;
          --border:     #D6E4E1;
          --input-bg:   #F8FBFB;
          --red:        #B92C14;
          --green:      #1A6B3A;
        }

        html, body { height: 100%; }

        .page {
          display: flex;
          flex-direction: row-reverse;
          min-height: 100vh;
          width: 100vw;
        }

        /* ════ LEFT PANEL ════ */
        .left {
          width: 42%;
          min-width: 360px;
          background: #fff;
          display: flex;
          flex-direction: column;
          padding: 36px 52px 32px 52px;
          overflow-y: auto;
          animation: slideLeft 0.5s ease both;
        }

        .brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-top: 16px;
          margin-bottom: 24px;
        }

        .brand-name {
          font-size: 27px;
          font-weight: 700;
          color: var(--teal);
          letter-spacing: -0.3px;
          line-height: 1.2;
        }

        .brand-sub {
          font-size: 13px;
          color: var(--mid);
          margin-top: 5px;
          font-weight: 400;
        }

        .form-title {
          font-size: 28px;
          color: var(--teal);
          text-align: center;
          margin-bottom: 5px;
          line-height: 1.2;
        }

        .form-sub {
          font-size: 13px;
          color: var(--light);
          text-align: center;
          margin-bottom: 22px;
          font-weight: 400;
        }

        /* Two-column row */
        .row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .group { margin-bottom: 14px; }

        .label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12.5px;
          font-weight: 500;
          color: var(--dark);
          margin-bottom: 6px;
        }

        .label .star { color: var(--red); }
        .label svg   { flex-shrink: 0; color: var(--mid); }

        .input-wrap { position: relative; }

        .field {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid var(--border);
          border-radius: 8px;
          font-size: 13px;
          font-family: inherit;
          color: var(--dark);
          background: var(--input-bg);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }

        .field::placeholder { color: #C0D0CE; }

        .field:focus {
          border-color: var(--teal);
          background: #fff;
          box-shadow: 0 0 0 3.5px rgba(26,68,75,0.10);
        }

        .field.error-field { border-color: var(--red); }

        .error-msg {
          font-size: 11.5px;
          color: var(--red);
          margin-top: 4px;
          font-weight: 400;
        }

        .form-error {
          background: #FEF2F0;
          border: 1px solid #F9C9C2;
          border-radius: 7px;
          padding: 10px 14px;
          font-size: 13px;
          color: var(--red);
          margin-bottom: 16px;
          text-align: center;
        }

        /* Eye button */
        .pw-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #AABBB8;
          display: flex;
          align-items: center;
          padding: 2px;
          transition: color 0.15s;
        }
        .pw-btn:hover { color: var(--teal); }

        /* Submit button */
        .btn {
          width: 100%;
          padding: 14px;
          background: var(--teal);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          margin-top: 6px;
          letter-spacing: 0.4px;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
        }

        .btn:hover:not(:disabled) {
          background: var(--teal-hover);
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(26,68,75,0.26);
        }

        .btn:active:not(:disabled) { transform: translateY(0); box-shadow: none; }
        .btn:disabled { opacity: 0.65; cursor: not-allowed; }

        /* Login link */
        .login-prompt {
          text-align: center;
          font-size: 13px;
          color: var(--light);
          margin-top: 16px;
        }

        .login-prompt a {
          color: var(--teal);
          font-weight: 600;
          text-decoration: none;
          margin-left: 4px;
        }

        .login-prompt a:hover { text-decoration: underline; }

        .footer {
          text-align: center;
          font-size: 12px;
          color: #AABBB9;
          padding-top: 18px;
          margin-top: auto;
          font-weight: 400;
        }

        /* ════ RIGHT PANEL ════ */
        .right {
          flex: 1;
          position: relative;
          overflow: hidden;
          animation: fadeIn 0.65s 0.1s ease both;
        }

        .right img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }

        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @media (max-width: 768px) {
          .page  { flex-direction: column; }
          .left  { width: 100%; padding: 28px 24px 24px; }
          .right { height: 240px; flex: none; }
          .row-2 { grid-template-columns: 1fr; gap: 0; }
        }
      `}</style>

      <div className="page">

        {/* ─── LEFT PANEL ─── */}
        <div className="left">

          <div className="brand">
            <div className={`${poppins.className} brand-name`}>Bilal Motors</div>
            <div className={`${poppins.className} brand-sub`}>
              Sales &amp; Purchase Of New &amp; Old Bikes.
            </div>
          </div>

          <h2 className={`${abrilFatface.className} form-title`}>Create Account</h2>
          <p className={`${poppins.className} form-sub`}>
            Fill in your details to get started
          </p>

          {errors.form && (
            <div className={`${poppins.className} form-error`}>{errors.form}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            {/* Full Name + Username */}
            <div className="row-2">
              <div className="group">
                <label className={`${poppins.className} label`}>
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.7"/>
                    <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6"
                      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                  </svg>
                  Full Name <span className="star">*</span>
                </label>
                <input
                  type="text"
                  className={`${poppins.className} field${errors.fullName ? " error-field" : ""}`}
                  placeholder="Muhammad Ali"
                  value={form.fullName}
                  onChange={set("fullName")}
                  autoComplete="name"
                />
                {errors.fullName && <p className={`${poppins.className} error-msg`}>{errors.fullName}</p>}
              </div>

              <div className="group">
                <label className={`${poppins.className} label`}>
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.7"/>
                    <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6"
                      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                  </svg>
                  Username <span className="star">*</span>
                </label>
                <input
                  type="text"
                  className={`${poppins.className} field${errors.username ? " error-field" : ""}`}
                  placeholder="m.ali"
                  value={form.username}
                  onChange={set("username")}
                  autoComplete="username"
                />
                {errors.username && <p className={`${poppins.className} error-msg`}>{errors.username}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="group">
              <label className={`${poppins.className} label`}>
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="4" width="16" height="12" rx="2"
                    stroke="currentColor" strokeWidth="1.7"/>
                  <path d="M2 7l8 5 8-5"
                    stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                </svg>
                Email <span className="star">*</span>
              </label>
              <input
                type="email"
                className={`${poppins.className} field${errors.email ? " error-field" : ""}`}
                placeholder="name@example.com"
                value={form.email}
                onChange={set("email")}
                autoComplete="email"
              />
              {errors.email && <p className={`${poppins.className} error-msg`}>{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="group">
              <label className={`${poppins.className} label`}>
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <rect x="4" y="2" width="12" height="16" rx="2"
                    stroke="currentColor" strokeWidth="1.7"/>
                  <circle cx="10" cy="15" r="0.8" fill="currentColor"/>
                </svg>
                Phone
              </label>
              <input
                type="tel"
                className={`${poppins.className} field`}
                placeholder="0300-0000000 (optional)"
                value={form.phone}
                onChange={set("phone")}
                autoComplete="tel"
              />
            </div>

            {/* Password + Confirm Password */}
            <div className="row-2">
              <div className="group">
                <label className={`${poppins.className} label`}>
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                    <rect x="4" y="9" width="12" height="9" rx="2"
                      stroke="currentColor" strokeWidth="1.7"/>
                    <path d="M7 9V6.5a3 3 0 016 0V9"
                      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                    <circle cx="10" cy="13.5" r="1.2" fill="currentColor"/>
                  </svg>
                  Password <span className="star">*</span>
                </label>
                <div className="input-wrap">
                  <input
                    type={showPw ? "text" : "password"}
                    className={`${poppins.className} field${errors.password ? " error-field" : ""}`}
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={set("password")}
                    autoComplete="new-password"
                    style={{ paddingRight: 40 }}
                  />
                  <button type="button" className="pw-btn" onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? "Hide password" : "Show password"}>
                    <EyeIcon crossed={showPw} />
                  </button>
                </div>
                {errors.password && <p className={`${poppins.className} error-msg`}>{errors.password}</p>}
              </div>

              <div className="group">
                <label className={`${poppins.className} label`}>
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                    <rect x="4" y="9" width="12" height="9" rx="2"
                      stroke="currentColor" strokeWidth="1.7"/>
                    <path d="M7 9V6.5a3 3 0 016 0V9"
                      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                    <circle cx="10" cy="13.5" r="1.2" fill="currentColor"/>
                  </svg>
                  Confirm <span className="star">*</span>
                </label>
                <div className="input-wrap">
                  <input
                    type={showCpw ? "text" : "password"}
                    className={`${poppins.className} field${errors.confirmPassword ? " error-field" : ""}`}
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={set("confirmPassword")}
                    autoComplete="new-password"
                    style={{ paddingRight: 40 }}
                  />
                  <button type="button" className="pw-btn" onClick={() => setShowCpw(v => !v)}
                    aria-label={showCpw ? "Hide password" : "Show password"}>
                    <EyeIcon crossed={showCpw} />
                  </button>
                </div>
                {errors.confirmPassword && <p className={`${poppins.className} error-msg`}>{errors.confirmPassword}</p>}
              </div>
            </div>

            <button type="submit" className={`${poppins.className} btn`} disabled={loading}>
              {loading ? "Creating Account…" : "Create Account"}
            </button>

          </form>

          <p className={`${poppins.className} login-prompt`}>
            Already have an account?
            <a href="/auth/login">Log in</a>
          </p>

          <div className={`${poppins.className} footer`}>
            Designed &amp; Developed By ImTechNow
          </div>
        </div>

        {/* ─── RIGHT PANEL ─── */}
        <div className="right">
          {MOTORCYCLE_IMAGE !== "/images/motorcycle.jpg" ? (
            <img src={MOTORCYCLE_IMAGE} alt="Bilal Motors" />
          ) : (
            <div style={{
              width: "100%", height: "100%",
              background: "linear-gradient(155deg, #2A5F6B 0%, #1A444B 50%, #0D2E33 100%)",
            }} />
          )}
        </div>

      </div>
    </>
  );
}

function EyeIcon({ crossed }: { crossed: boolean }) {
  return crossed ? (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z"
        stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
      <line x1="3" y1="3" x2="17" y2="17"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z"
        stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  );
}
