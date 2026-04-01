import React from 'react'
import History from '../components/History'
import LogoSection from '../components/LogoSection'
import Shipping from '../components/Shipping'

const About = () => {
    return (
        <>
        <section class="relative bg-gradient-to-r from-blue-50 to-indigo-50 py-16 md:py-24 overflow-hidden">
    
    <div class="absolute -left-12 top-1/2 -translate-y-1/2 w-24 h-24 bg-blue-200/30 rounded-full blur-xl animate-pulse"></div>
    <div class="absolute right-0 bottom-0 w-32 h-32 bg-indigo-200/20 rounded-full blur-lg"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <nav class="flex items-center space-x-2 text-sm md:text-lg mb-4 text-blue-600">
            <a href="#" class="hover:text-blue-800 transition-colors duration-300">Home</a>
            <span class="text-blue-400">/</span>
            <span class="text-blue-800 font-medium">About</span>
        </nav>

        
        <div class="relative z-10">
            <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                About Us
            </h1>
            <p class="text-lg md:text-xl text-gray-600 max-w-3xl leading-relaxed">
                Innovativ həllər və istedadlı komanda ilə sənayedə liderlik edirik. Hər addımda müştəri məmnuniyyətini ən üstdə tuturuq.
            </p>
        </div>

        
        <div class="mt-8 w-24 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"></div>
    </div>
</section>
        <History />
        <Shipping />
        <LogoSection />
        </>
    )
}

export default About