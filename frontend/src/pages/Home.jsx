import React from 'react'
import Categories from '../components/Categories'
import WeeklyDeal from '../components/WeeklyDeal'
import LogoSection from '../components/LogoSection'
import DiscountSubscribe from '../components/DiscountSubscribe'
import Sever from '../components/Sever'
import Testimonials from '../components/Testimonials'

const Home = () => {
    
    return (
        <>
        <Categories/>
        <WeeklyDeal/>
        <LogoSection/>
        <DiscountSubscribe/>
        <Sever/>
        {/* <Testimonials/> */}
        </>
    )
}

export default Home