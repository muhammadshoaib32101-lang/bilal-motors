"use client";

import { useState, useEffect } from "react";
import { Abril_Fatface, Poppins } from "next/font/google";

const abrilFatface = Abril_Fatface({
  weight: "400",
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});



const MOTORCYCLE_IMAGE      = "/images/motorcycle.png";       


export default function LoginPage() {
  const [username, setUsername]         = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg]     = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("registered") === "1") {
      setSuccessMsg("Account created! Please log in.");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Send the data to your API route
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        // 2. The path it takes on success (Your New Sale page)
        window.location.href = "/dashboard/sales/newSale"; 
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      alert("Network error. Make sure your server is running.");
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
        }

        html, body { height: 100%; overflow: hidden; }

        /* ─── OUTER WRAPPER ─── */
        .page {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
        }

        /* ════════════════════════════
           LEFT PANEL
        ════════════════════════════ */
        .left {
          width: 38%;
          min-width: 340px;
          background: #fff;
          display: flex;
          flex-direction: column;
          padding: 52px 56px 40px 56px;
          position: relative;
          overflow: hidden;
          animation: slideLeft 0.5s ease both;
        }

        /* Bicycle silhouette — subtle top-left watermark */
        .deco {
          position: absolute;
          top: 0;
          left: 0;
          width: 180px;
          height: 120px;
          object-fit: contain;
          object-position: top left;
          pointer-events: none;
          opacity: 0.10;
          /* Tints the black silhouette to teal */
          filter: invert(23%) sepia(40%) saturate(500%) hue-rotate(148deg) brightness(80%);
        }

        /* Brand */
        .brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-top: 44px;
          margin-bottom: 52px;
        }

        .brand-name {
          font-size: 27px;
          font-weight: 700;
          color: var(--teal);
          letter-spacing: -0.3px;
          line-height: 1.2;
        }

        .brand-sub {
          font-size: 13.5px;
          color: var(--mid);
          margin-top: 6px;
          font-weight: 400;
        }

        /* Form area */
        .form-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .form-title {
          font-size: 30px;
          color: var(--teal);
          text-align: center;
          margin-bottom: 7px;
          line-height: 1.2;
        }

        .form-sub {
          font-size: 13px;
          color: var(--light);
          text-align: center;
          margin-bottom: 36px;
          font-weight: 400;
        }

        /* Input groups */
        .group {
          margin-bottom: 20px;
        }

        .label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          font-weight: 500;
          color: var(--dark);
          margin-bottom: 8px;
        }

        .label .star { color: var(--red); }
        .label svg   { flex-shrink: 0; color: var(--mid); }

        .input-wrap { position: relative; }

        .field {
          width: 100%;
          padding: 13px 16px;
          border: 1.5px solid var(--border);
          border-radius: 8px;
          font-size: 13.5px;
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

        .pw-btn {
          position: absolute;
          right: 13px;
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

        /* Login button */
        .btn {
          width: 100%;
          padding: 15px;
          background: var(--teal);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          margin-top: 8px;
          letter-spacing: 0.4px;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
        }

        .btn:hover {
          background: var(--teal-hover);
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(26,68,75,0.26);
        }

        .btn:active { transform: translateY(0); box-shadow: none; }

        /* Success banner */
        .success-msg {
          background: #F0FAF4;
          border: 1px solid #A8D5B5;
          border-radius: 7px;
          padding: 10px 14px;
          font-size: 13px;
          color: #1A6B3A;
          margin-bottom: 18px;
          text-align: center;
        }

        /* Signup prompt */
        .signup-prompt {
          text-align: center;
          font-size: 13px;
          color: #AABBB8;
          margin-top: 16px;
        }

        .signup-prompt a {
          color: var(--teal);
          font-weight: 600;
          text-decoration: none;
          margin-left: 4px;
        }

        .signup-prompt a:hover { text-decoration: underline; }

        /* Footer */
        .footer {
          text-align: center;
          font-size: 12px;
          color: #AABBB9;
          padding-top: 20px;
          font-weight: 400;
        }

        /* ════════════════════════════
           RIGHT PANEL
        ════════════════════════════ */
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

        /* Placeholder (visible before image is added) */
        .placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(155deg, #2A5F6B 0%, #1A444B 50%, #0D2E33 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 18px;
          color: rgba(168,196,191,0.65);
        }

        .placeholder svg { opacity: 0.4; }

        .placeholder p {
          font-size: 13px;
          text-align: center;
          line-height: 1.7;
          padding: 0 24px;
          font-family: inherit;
        }

        .placeholder strong { opacity: 0.85; }

        /* ════════════════════════════
           ANIMATIONS
        ════════════════════════════ */
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ════════════════════════════
           RESPONSIVE
        ════════════════════════════ */
        @media (max-width: 768px) {
          html, body { overflow: auto; }
          .page  { flex-direction: column; height: auto; min-height: 100vh; }
          .left  { width: 100%; padding: 36px 28px 28px; }
          .right { height: 280px; flex: none; }
        }
      `}</style>

      <div className="page">

        {/* ─── LEFT PANEL ─── */}
        <div className="left">

        
          {/* Brand */}
          <div className="brand">
            <div className={`${poppins.className} brand-name`}>Bilal Motors</div>
            <div className={`${poppins.className} brand-sub`}>
              Sales &amp; Purchase Of New &amp; Old Bikes.
            </div>
          </div>

          {/* Form */}
          <div className="form-area">
            <h2 className={`${abrilFatface.className} form-title`}>Welcome Back</h2>
            <p  className={`${poppins.className}    form-sub`}>
              Welcome Back! &nbsp;Please enter your details
            </p>

            {successMsg && (
              <div className={`${poppins.className} success-msg`}>{successMsg}</div>
            )}

            <form onSubmit={handleSubmit}>

              <div className="group">
                <label className={`${poppins.className} label`}>
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                    <rect x="2" y="4" width="16" height="12" rx="2"
                      stroke="currentColor" strokeWidth="1.7"/>
                    <path d="M2 7l8 5 8-5"
                      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                  </svg>
                  Email / Username <span className="star">*</span>
                </label>
                <div className="input-wrap">
                  <input
                    type="text"
                    className={`${poppins.className} field`}
                    placeholder="Enter your email or username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="group">
                <label className={`${poppins.className} label`}>
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
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
                    type={showPassword ? "text" : "password"}
                    className={`${poppins.className} field`}
                    placeholder="••••••••••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    className="pw-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                        <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z"
                          stroke="currentColor" strokeWidth="1.6"/>
                        <circle cx="10" cy="10" r="2.5"
                          stroke="currentColor" strokeWidth="1.6"/>
                        <line x1="3" y1="3" x2="17" y2="17"
                          stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                        <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z"
                          stroke="currentColor" strokeWidth="1.6"/>
                        <circle cx="10" cy="10" r="2.5"
                          stroke="currentColor" strokeWidth="1.6"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className={`${poppins.className} btn`}>
                Login
              </button>

            </form>

            <p className={`${poppins.className} signup-prompt`}>
              Don&apos;t have an account?
              <a href="/auth/signup">Sign up</a>
            </p>
          </div>

          <div className={`${poppins.className} footer`}>
            Designed &amp; &nbsp;Developed By ImTechNow
          </div>
        </div>

        {/* ─── RIGHT PANEL ─── */}
        {/*
          MOTORCYCLE PHOTO (Image 1 — the teal-wall motorcycle)
          — fills the entire right half of the screen
          — once you set MOTORCYCLE_IMAGE above, the placeholder disappears automatically
        */}
        <div className="right">
          {MOTORCYCLE_IMAGE !== "/images/motorcycle.jpg" ? (
            <img src={MOTORCYCLE_IMAGE} alt="Bilal Motors" />
          ) : (
            <div className={`${poppins.className} placeholder`}>
              <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="5" width="20" height="14" rx="2"
                  stroke="currentColor" strokeWidth="1.3"/>
                <circle cx="12" cy="12" r="3.5"
                  stroke="currentColor" strokeWidth="1.3"/>
                <circle cx="17.5" cy="8" r="1" fill="currentColor"/>
              </svg>
              <p>
                Add your motorcycle photo here.<br/>
                Open <strong>page.jsx</strong> → find line:<br/>
                <strong>MOTORCYCLE_IMAGE</strong><br/>
                and change the path.
              </p>
            </div>
          )}
        </div>

      </div>
    </>
  );
}