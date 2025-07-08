"use client";

import { cn } from "@/lib/utils";
import { Sparkles, ArrowRight, Star, Users, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
  onClick?: () => void;
  features?: string[];
  benefits?: string[];
}

function DisplayCard({
  className,
  icon = <Sparkles className="size-4 text-blue-300" />,
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
  iconClassName = "text-blue-500",
  titleClassName = "text-blue-500",
  onClick,
  features = [],
  benefits = [],
}: DisplayCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className={cn(
        "group relative flex h-36 w-[22rem] -skew-y-[8deg] select-none flex-col justify-between rounded-xl border-2 bg-muted/70 backdrop-blur-sm px-4 py-3 transition-all duration-700 cursor-pointer overflow-hidden",
        "hover:h-[320px] hover:w-[24rem] hover:skew-y-0 hover:z-30 hover:shadow-2xl hover:shadow-blue-500/20",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100",
        "after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-[20rem] after:bg-gradient-to-l after:from-background after:to-transparent after:content-[''] hover:after:opacity-0 after:transition-opacity after:duration-500",
        className
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-green-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/5 group-hover:to-green-500/10 transition-all duration-700 rounded-xl" />
      
      {/* Header section */}
      <div className="flex items-center gap-3 z-10 relative">
        <span 
          className={cn(
            "relative inline-block rounded-full p-2 transition-all duration-500",
            "bg-gradient-to-br from-slate-700 to-slate-800 group-hover:from-blue-600 group-hover:to-purple-600",
            "group-hover:shadow-lg group-hover:shadow-blue-500/25"
          )}
        >
          {icon}
          {/* Icon glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
        </span>
        
        <div>
          <p className={cn("text-lg font-semibold transition-colors duration-300", titleClassName)}>
            {title}
          </p>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <Star className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-muted-foreground">Professional</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="z-10 relative">
        <p className="text-base text-foreground/80 group-hover:text-foreground transition-colors duration-300">
          {description}
        </p>
      </div>

      {/* Date/Role info */}
      <p className="text-muted-foreground text-sm font-medium z-10 relative">
        {date}
      </p>

      {/* Expanded content on hover */}
      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 z-10 translate-y-4 group-hover:translate-y-0">
        {/* Features */}
        {features.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Key Features
            </h4>
            <ul className="space-y-1">
              {features.slice(0, 3).map((feature, index) => (
                <li
                  key={index}
                  className="text-xs text-muted-foreground flex items-center gap-2 transform translate-x-[-10px] group-hover:translate-x-0 transition-transform duration-300"
                  style={{ transitionDelay: `${0.1 + index * 0.05}s` }}
                >
                  <div className="w-1 h-1 bg-green-400 rounded-full flex-shrink-0" />
                  <span className="leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Benefits */}
        {benefits.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
              <Users className="w-3 h-3" />
              Benefits
            </h4>
            <ul className="space-y-1">
              {benefits.slice(0, 2).map((benefit, index) => (
                <li
                  key={index}
                  className="text-xs text-muted-foreground flex items-center gap-2 transform translate-x-[-10px] group-hover:translate-x-0 transition-transform duration-300"
                  style={{ transitionDelay: `${0.2 + index * 0.05}s` }}
                >
                  <div className="w-1 h-1 bg-blue-400 rounded-full flex-shrink-0" />
                  <span className="leading-relaxed">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA Button */}
        <button
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
          style={{ transitionDelay: '0.3s' }}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          Get Started
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-blue-400/30 rounded-full transition-all duration-1000 ${
              isHovered ? 'opacity-60 animate-pulse' : 'opacity-0'
            }`}
            style={{
              left: `${20 + i * 30}%`,
              top: `${30 + i * 20}%`,
              transitionDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards = [
    {
      className: "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className: "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className: "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
    },
  ];

  const displayCards = cards || defaultCards;

  return (
    <div className="relative flex items-center justify-center min-h-[400px] w-full max-w-5xl mx-auto">
      {/* Container with proper spacing for stacked cards */}
      <div className="relative grid [grid-template-areas:'stack'] place-items-center w-full h-full">
        {displayCards.map((cardProps, index) => (
          <DisplayCard key={index} {...cardProps} />
        ))}
      </div>
    </div>
  );
}