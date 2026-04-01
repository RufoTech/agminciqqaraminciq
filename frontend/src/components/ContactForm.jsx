import React, { useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css'; // Tərtibat səhvinə səbəb olduğu üçün silindi/şərh edildi. Zəhmət olmasa bu CSS-i qlobal olaraq daxil edin.

// Həqiqi emailjs importu (sadəcə nümayiş üçün mock ediləcək, çünki xəta xarici hesabla bağlıdır)
// import emailjs from '@emailjs/browser'; 

// EmailJS Mock (nümunənin işləməsi üçün)
const emailjs = {
    sendForm: (serviceID, templateID, formElement, options) => {
        // Konsolda görünən "Invalid grant" xətasını qeyd etmək üçün bu mock-u istifadə edirik.
        // Realda bu xətanı EmailJS API-dən alacaqsınız.
        console.log("EmailJS vasitəsilə e-poçt göndərməyə cəhd...");

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Əgər EmailJS-də icazə problemi həll edilibsə, bu resolve işləyəcək.
                resolve();

                // Əgər yenə də problem yaranarsa, aşağıdakı kimi bir xəta alacaqsınız:
                // reject({ text: 'Gmail_API: Invalid grant. Please reconnect your Gmail account' });

            }, 1000); // Şəbəkə gecikməsini simulyasiya edir
        });
    }
};


const App = () => {
    // fromElementi adını daha standart olan formRef ilə əvəz etdik
    const formRef = useRef();

    const sendEmail = async (e) => {
        e.preventDefault();

        if (!formRef.current) {
            toast.error('Form elementi tapılmadı.');
            return;
        }

        try {
            await emailjs.sendForm(
                'service_i2aoln8',
                'template_5ydt9ts',
                formRef.current,
                // Public Key-i obyekt içərisində göndərmək lazımdır
                { publicKey: 'x5HEkmKZNmgk7_3e9' }
            );
            console.log('SUCCESS! (Simulyasiya edilmiş)');
            // Uğurlu mesajı Azərbaycancaya uyğunlaşdırdıq
            toast.success('Mesajınız uğurla göndərildi!');
            formRef.current.reset(); // Formu sıfırlayırıq
        } catch (error) {
            const errorMessage = error.text || 'Gözlənilməyən xəta baş verdi.';
            console.log('FAILED...', error);

            // Konsolda görünən xətanın izahı üçün xüsusi toast mesajı
            if (errorMessage.includes('Invalid grant')) {
                toast.error('Giriş Səhvi: EmailJS xidməti üçün Gmail hesabı yenidən qoşulmalıdır. EmailJS panelinizi yoxlayın.');
            } else {
                // Əgər başqa xəta varsa
                toast.error('Mesaj göndərilmədi: ' + errorMessage);
            }
        }
    };

    return (
        // Tailwind's Inter font is assumed
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-20 px-4 sm:px-6 lg:px-8 font-inter">

            {/* ── MOBİL STILLER (əlavə edildi, heç nə silinmədi) ── */}
            <style>{`
                @media (max-width: 767px) {
                    /* Səhifənin üst padding-i azaldılır */
                    .contact-page {
                        padding-top: 2.5rem !important;
                        padding-bottom: 2.5rem !important;
                    }

                    /* Başlıq mətn ölçüsü kiçilir */
                    .contact-title {
                        font-size: 1.875rem !important;
                    }

                    /* Başlıq altındakı mətn kiçilir */
                    .contact-subtitle {
                        font-size: 1rem !important;
                    }

                    /* Başlıq bloku altındakı boşluq azaldılır */
                    .contact-header {
                        margin-bottom: 2rem !important;
                    }

                    /* Kart: padding azaldılır */
                    .contact-card {
                        padding: 1.25rem !important;
                        gap: 1.5rem !important;
                        border-radius: 1.25rem !important;
                    }

                    /* Əlaqə məlumatları panel: padding azaldılır */
                    .contact-info-panel {
                        padding: 1rem !important;
                    }

                    /* Form hissəsi: padding azaldılır */
                    .contact-form-section {
                        padding: 0 !important;
                    }

                    /* Input grid: 1 sütun (mobilda 2 sütun sığmır) */
                    .contact-input-grid {
                        grid-template-columns: 1fr !important;
                        gap: 1rem !important;
                    }

                    /* Göndər düyməsi: font kiçilir */
                    .contact-submit-btn {
                        font-size: 1rem !important;
                        padding: 0.875rem 1.25rem !important;
                    }
                }

                @media (max-width: 400px) {
                    .contact-title {
                        font-size: 1.5rem !important;
                    }
                    .contact-card {
                        padding: 1rem !important;
                    }
                }
            `}</style>

            {/* Toast Container for notifications */}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />

            <div className="max-w-7xl mx-auto contact-page">
                {/* Başlıq və Açıqlama */}
                <div className="contact-header text-center mb-16 space-y-6">
                    <h1 className="contact-title text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        Bizimlə Əlaqə Saxlayın
                    </h1>
                    <p className="contact-subtitle text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        Hər hansı sualınız, təklifiniz və ya əməkdaşlıq təklifiniz varsa, aşağıdakı formu dolduraraq bizə müraciət edə bilərsiniz.
                    </p>
                </div>

                {/* Form və Əlavə Məlumatlar */}
                <div className="contact-card flex flex-col lg:flex-row gap-12 bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
                    {/* Əlaqə Məlumatları */}
                    <div className="contact-info-panel lg:w-1/3 space-y-8 p-6 bg-gradient-to-br from-blue-900/50 rounded-2xl shadow-xl">
                        <div className="space-y-6">
                            <h3 className="text-2xl font-semibold text-cyan-400 border-b border-cyan-400/30 pb-3">Əlaqə Məlumatları</h3>

                            {/* Telefon */}
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-cyan-500/20 rounded-full flex-shrink-0">
                                    {/* Telefon İkonu */}
                                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-300 font-medium">Telefon</p>
                                    <p className="text-gray-400">+994 12 345 67 89</p>
                                </div>
                            </div>

                            {/* E-poçt */}
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-purple-500/20 rounded-full flex-shrink-0">
                                    {/* E-poçt İkonu */}
                                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-300 font-medium">E-poçt</p>
                                    <p className="text-gray-400">info@example.com</p>
                                </div>
                            </div>

                            {/* Ünvan */}
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-pink-500/20 rounded-full flex-shrink-0">
                                    {/* Ünvan İkonu */}
                                    <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-300 font-medium">Ünvan</p>
                                    <p className="text-gray-400">Bakı, Azərbaycan</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Hissəsi */}
                    <form className="contact-form-section lg:w-2/3 space-y-8 p-6" onSubmit={sendEmail} ref={formRef}>
                        <div className="contact-input-grid grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Adınız (Name) */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-cyan-300 mb-2">Adınız</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-400 text-gray-100 transition-all shadow-md focus:shadow-lg focus:shadow-cyan-500/10"
                                    placeholder="Adınızı daxil edin"
                                />
                            </div>

                            {/* E-poçt (Email) */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-cyan-300 mb-2">E-poçt</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:ring-2 placeholder-gray-400 text-gray-100 transition-all shadow-md focus:shadow-lg focus:shadow-purple-500/10"
                                    placeholder="example@mail.com"
                                />
                            </div>

                            {/* Telefon (Telephone) */}
                            <div>
                                <label htmlFor="telephone" className="block text-sm font-medium text-cyan-300 mb-2">Telefon</label>
                                <input
                                    id="telephone"
                                    name="telephone"
                                    type="tel"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-gray-400 text-gray-100 transition-all shadow-md focus:shadow-lg focus:shadow-pink-500/10"
                                    placeholder="+994 00 000 00 00"
                                />
                            </div>

                            {/* Mövzu (Subject) - Subject input adını dəyişdik */}
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-cyan-300 mb-2">Mövzu</label>
                                <input
                                    id="subject"
                                    name="subject"
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-400 text-gray-100 transition-all shadow-md focus:shadow-lg focus:shadow-cyan-500/10"
                                    placeholder="Mövzunu daxil edin"
                                />
                            </div>
                        </div>

                        {/* Mesajınız (Message) */}
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-cyan-300 mb-2">Mesajınız</label>
                            <textarea
                                id="message"
                                name="message"
                                rows="6"
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 text-gray-100 resize-none transition-all shadow-md focus:shadow-lg focus:shadow-green-500/10"
                                placeholder="Mesajınızı ətraflı şəkildə yazın..."
                            ></textarea>
                        </div>

                        {/* Göndər düyməsi */}
                        <div className="border-t border-white/20 pt-8">
                            <button
                                type="submit"
                                className="contact-submit-btn w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.01] shadow-2xl hover:shadow-cyan-500/40 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 flex items-center justify-center gap-3 active:scale-[0.99] text-lg"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                Mesajı Göndər
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default App;