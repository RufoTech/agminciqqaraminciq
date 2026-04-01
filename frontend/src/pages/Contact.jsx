import React, { useState } from 'react';

// Xəritə komponenti
const Harita = () => {
  return (
    <iframe
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d194473.22199065257!2d49.70845994999999!3d40.39479125!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40307d6bd6211cf9%3A0x343f6b5e7ae56c6b!2zQmFrxLEsIEF6yZlyYmF5Y2Fu!5e0!3m2!1str!2s!4v1234567890123!5m2!1str!2s"
      width="100%"
      height="100%"
      style={{ border: 0 }}
      allowFullScreen=""
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title="Ofis Yeri"
    />
  );
};

// ContactForm komponenti
const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [focused, setFocused] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Mesajınız göndərildi!');
    setFormData({ name: '', email: '', message: '' });
  };

  const inputStyle = (field) => ({
    width: '100%',
    padding: '14px 16px',
    border: `2px solid ${focused === field ? '#E53935' : 'rgba(229,57,53,0.15)'}`,
    borderRadius: 12,
    outline: 'none',
    fontSize: 14,
    background: focused === field ? '#fff' : 'rgba(229,57,53,0.02)',
    transition: 'all 0.2s ease',
    color: '#1a1a1a',
  });

  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#B71C1C',
    marginBottom: 8,
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <label style={labelStyle}>Ad Soyad</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          onFocus={() => setFocused('name')}
          onBlur={() => setFocused('')}
          required
          style={inputStyle('name')}
          placeholder="Adınızı yazın"
        />
      </div>

      <div>
        <label style={labelStyle}>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onFocus={() => setFocused('email')}
          onBlur={() => setFocused('')}
          required
          style={inputStyle('email')}
          placeholder="email@example.com"
        />
      </div>

      <div>
        <label style={labelStyle}>Mesajınız</label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          onFocus={() => setFocused('message')}
          onBlur={() => setFocused('')}
          required
          rows="5"
          style={{ ...inputStyle('message'), resize: 'none' }}
          placeholder="Mesajınızı yazın..."
        />
      </div>

      <button
        onClick={handleSubmit}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, #B71C1C, #E53935)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 15,
          padding: '14px 24px',
          borderRadius: 12,
          border: 'none',
          cursor: 'pointer',
          letterSpacing: '0.02em',
          boxShadow: '0 4px 20px rgba(229,57,53,0.35)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 28px rgba(229,57,53,0.45)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(229,57,53,0.35)';
        }}
      >
        Göndər →
      </button>
    </div>
  );
};

// Info kartı
const InfoCard = ({ icon, title, children }) => (
  <div
    style={{
      background: '#fff',
      border: '1px solid rgba(229,57,53,0.12)',
      borderRadius: 16,
      padding: '20px 22px',
      display: 'flex',
      gap: 16,
      alignItems: 'flex-start',
      boxShadow: '0 2px 12px rgba(229,57,53,0.06)',
    }}
  >
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: 12,
        background: 'linear-gradient(135deg, #E53935, #B71C1C)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(229,57,53,0.3)',
      }}
    >
      {icon}
    </div>
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#B71C1C', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        {title}
      </p>
      {children}
    </div>
  </div>
);

const Contact = () => {
  return (
    <main style={{ minHeight: '100vh', background: '#F9F9F9' }}>

      {/* Banner / Başlıq */}
      <section
        style={{
          background: 'linear-gradient(135deg, #B71C1C 0%, #D32F2F 40%, #E53935 70%, #EF5350 100%)',
          padding: '60px 0 70px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Dekorativ dairələr */}
        <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', top: -80, left: -60, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', bottom: -50, right: 100, pointerEvents: 'none' }} />

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <a href="/" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>Ana səhifə</a>
            <span style={{ color: 'rgba(255,255,255,0.35)' }}>›</span>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>Əlaqə</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 12, textShadow: '0 2px 20px rgba(0,0,0,0.15)' }}>
            Bizimlə Əlaqə
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, maxWidth: 480 }}>
            Suallarınız, təklifləriniz və ya sifarişlər üçün bizimlə əlaqə saxlayın.
          </p>
        </div>
      </section>

      {/* Form + Info kartları */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32 }}>

          {/* Üst: Info kartları */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <InfoCard
              title="Telefon"
              icon={
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              }
            >
              <a href="tel:+994501234567" style={{ color: '#555', fontSize: 14, textDecoration: 'none', display: 'block' }}>+994 50 123 45 67</a>
            </InfoCard>

            <InfoCard
              title="Email"
              icon={
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M22 6l-10 7L2 6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              }
            >
              <a href="mailto:info@company.az" style={{ color: '#555', fontSize: 14, textDecoration: 'none', display: 'block' }}>info@company.az</a>
            </InfoCard>

            <InfoCard
              title="Ünvan"
              icon={
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                  <circle cx="12" cy="9" r="2.5" stroke="#fff" strokeWidth="1.8"/>
                </svg>
              }
            >
              <p style={{ color: '#555', fontSize: 14, margin: 0 }}>Bakı şəhəri,<br/>Nəsimi rayonu</p>
            </InfoCard>

            <InfoCard
              title="İş Saatları"
              icon={
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="1.8"/>
                  <path d="M12 6v6l4 2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              }
            >
              <p style={{ color: '#555', fontSize: 14, margin: 0 }}>B.ertəsi – Cümə<br/>09:00 – 18:00</p>
            </InfoCard>
          </div>

          {/* Forma */}
          <div
            style={{
              background: '#fff',
              borderRadius: 24,
              padding: '36px 32px',
              boxShadow: '0 4px 24px rgba(229,57,53,0.08)',
              border: '1px solid rgba(229,57,53,0.1)',
            }}
          >
            {/* Forma başlığı */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
              <div style={{ width: 4, height: 28, borderRadius: 4, background: 'linear-gradient(180deg, #E53935, #B71C1C)' }} />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a1a1a', margin: 0 }}>Mesaj göndərin</h2>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Xəritə */}
      <section
        style={{
          background: '#fff',
          borderTop: '1px solid rgba(229,57,53,0.1)',
          padding: '48px 24px',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 4, height: 28, borderRadius: 4, background: 'linear-gradient(180deg, #E53935, #B71C1C)' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a1a1a', margin: 0 }}>Ofisimizin yeri</h2>
          </div>

          <div
            style={{
              borderRadius: 20,
              overflow: 'hidden',
              border: '2px solid rgba(229,57,53,0.15)',
              boxShadow: '0 8px 32px rgba(229,57,53,0.1)',
              height: 480,
            }}
          >
            <Harita />
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;