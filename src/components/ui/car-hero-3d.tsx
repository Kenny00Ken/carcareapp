'use client'

import { SplineScene } from "@/components/ui/spline";
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
import { Button } from 'antd'
import { ArrowRightOutlined, CarOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
 
interface CarHero3DProps {
  onGetStarted?: () => void;
  onLearnMore?: () => void;
  user?: any;
  firebaseUser?: any;
}

export function CarHero3D({ onGetStarted, onLearnMore, user, firebaseUser }: CarHero3DProps) {
  return (
    <Card className="w-full h-[600px] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden border-slate-700 shadow-2xl">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="rgb(59, 130, 246)"
      />
      
      <div className="flex h-full">
        {/* Left content */}
        <div className="flex-1 p-8 md:p-12 relative z-10 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white via-blue-100 to-blue-300 mb-6 leading-tight">
              AutoCare
              <span className="block text-2xl md:text-3xl mt-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Connect • Diagnose • Fix
              </span>
            </h1>
            
            <p className="mt-6 text-slate-300 max-w-lg text-lg leading-relaxed mb-8">
              Experience Ghana's most advanced automotive platform. Connect with certified mechanics, 
              get precise diagnostics, and access genuine parts - all in one intelligent ecosystem.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {firebaseUser ? (
                user ? (
                  <Button
                    type="primary"
                    size="large"
                    icon={<CarOutlined />}
                    onClick={onGetStarted}
                    className="!h-14 !px-8 !text-lg font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-none rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                  >
                    Go to Dashboard <ArrowRightOutlined />
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    onClick={onGetStarted}
                    className="!h-14 !px-8 !text-lg font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-none rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                  >
                    Complete Profile <ArrowRightOutlined />
                  </Button>
                )
              ) : (
                <>
                  <Button
                    type="primary"
                    size="large"
                    onClick={onGetStarted}
                    className="!h-14 !px-8 !text-lg font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-none rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                  >
                    Get Started <ArrowRightOutlined />
                  </Button>
                  <Button
                    size="large"
                    onClick={onLearnMore}
                    className="!h-14 !px-8 !text-lg font-semibold text-slate-300 hover:text-white border-slate-500 hover:border-blue-400 bg-transparent hover:bg-slate-800/50 rounded-xl transition-all duration-300"
                  >
                    Learn More
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right content - 3D Car Scene */}
        <div className="flex-1 relative">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="w-full h-full"
          >
            <SplineScene 
              scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"
              className="w-full h-full"
            />
          </motion.div>
          
          {/* Fallback for when 3D doesn't load */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
            <div className="text-center">
              <CarOutlined className="text-8xl text-blue-400 mb-4" />
              <p className="text-slate-400 text-lg">3D Car Visualization</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decorative elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
    </Card>
  )
}
